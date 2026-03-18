'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data ?? null)
    },
    [supabase]
  )

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile(user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  // Force logout if admin blocks the currently logged-in user
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`profile-block:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          const updated = payload.new as { is_active: boolean }
          if (updated.is_active === false) {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            window.location.href = '/auth/signin?blocked=1'
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) return { error: error.message }

    // Use data.user directly — getUser() may return null before session settles
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'customer',
        is_active: true,
      })
    }

    return { error: null }
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const { data: authData } = await supabase.auth.getUser()
    if (authData.user) {
      // Check if account is blocked
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', authData.user.id)
        .single()

      if (profileData?.is_active === false) {
        await supabase.auth.signOut()
        return { error: 'ACCOUNT_BLOCKED' }
      }

      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id)
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{ user, profile, isAdmin, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
