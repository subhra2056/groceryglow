'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface AppNotification {
  id: string
  user_id: string
  type: 'cart_reminder' | 'order_update' | 'promo'
  title: string
  message: string
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface ToastNotification {
  id: string
  type: AppNotification['type']
  title: string
  message: string
}

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  toast: ToastNotification | null
  dismissToast: () => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  addLocalNotification: (n: Omit<AppNotification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [toast, setToast] = useState<ToastNotification | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const dismissToast = useCallback(() => {
    setToast(null)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  // Load existing notifications
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      return
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setNotifications(data ?? [])
  }, [user, supabase])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // ── Supabase Realtime: listen for order updates ──────────────────
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`orders:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const order = payload.new as {
            id: string
            order_number: string
            order_status: string
          }

          const statusLabels: Record<string, string> = {
            confirmed: 'Your order has been confirmed!',
            packed: 'Your order is being packed.',
            shipped: 'Your order is on its way!',
            delivered: 'Your order has been delivered. Enjoy! 🎉',
            cancelled: 'Your order was cancelled.',
          }

          const message = statusLabels[order.order_status]
          if (!message) return

          // Persist to DB
          const { data: newNotif } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'order_update',
              title: `Order #${order.order_number} Update`,
              message,
              is_read: false,
              data: { order_id: order.id, order_status: order.order_status },
            })
            .select()
            .single()

          if (newNotif) {
            setNotifications((prev) => [newNotif, ...prev])
          }

          // Browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`Order #${order.order_number} Update`, { body: message })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const addLocalNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => {
      const notif: AppNotification = {
        ...n,
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        user_id: user?.id ?? '',
        is_read: false,
        created_at: new Date().toISOString(),
      }
      setNotifications((prev) => [notif, ...prev])

      // Show toast popup
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setToast({ id: notif.id, type: n.type, title: n.title, message: n.message })
      toastTimerRef.current = setTimeout(() => setToast(null), 5000)

      // Also persist if logged in
      if (user) {
        supabase.from('notifications').insert({
          user_id: user.id,
          type: n.type,
          title: n.title,
          message: n.message,
          is_read: false,
          data: n.data,
        })
      }
    },
    [user, supabase]
  )

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      if (user) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      }
    },
    [user, supabase]
  )

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }, [user, supabase])

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (user) {
      await supabase.from('notifications').delete().eq('id', id)
    }
  }, [user, supabase])

  const clearAll = useCallback(async () => {
    setNotifications([])
    if (user) {
      await supabase.from('notifications').delete().eq('user_id', user.id)
    }
  }, [user, supabase])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, toast, dismissToast, markAsRead, markAllAsRead, deleteNotification, clearAll, addLocalNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}
