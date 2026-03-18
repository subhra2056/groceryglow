'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Tag,
  Image as ImageIcon,
  Leaf,
  LogOut,
  Bug,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList, exact: false },
  { href: '/admin/customers', label: 'Customers', icon: Users, exact: false },
  { href: '/admin/categories', label: 'Categories', icon: Tag, exact: false },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon, exact: false },
  { href: '/admin/bug-reports', label: 'Bug Reports', icon: Bug, exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    const supabase = createClient()

    const fetchCounts = async () => {
      const [{ count: orders }, { count: bugs }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'placed'),
        supabase.from('bug_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      ])
      setBadges({
        '/admin/orders': orders ?? 0,
        '/admin/bug-reports': bugs ?? 0,
      })
    }

    fetchCounts()

    const channel = supabase
      .channel('admin-sidebar-badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bug_reports' }, fetchCounts)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const isActive = (item: { href: string; exact: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-14 md:w-60 bg-charcoal min-h-screen flex flex-col flex-shrink-0 transition-all">
      {/* Logo */}
      <div className="px-3 md:px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-forest-green to-leaf-green rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <span className="text-white font-bold text-sm">GroceryGlow</span>
            <p className="text-white/40 text-[10px] leading-none">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 md:p-3 space-y-0.5">
        {adminNavItems.map((item) => {
          const active = isActive(item)
          const count = badges[item.href] ?? 0
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'flex items-center gap-3 px-2.5 md:px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                active
                  ? 'bg-forest-green text-white shadow-glow'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden md:inline flex-1">{item.label}</span>
              {count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0',
                  'md:static absolute top-1 right-1',
                  active ? 'bg-white/30 text-white' : 'bg-sunset-orange text-white'
                )}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 md:p-3 border-t border-white/10">
        <Link
          href="/"
          title="View Store"
          className="flex items-center gap-3 px-2.5 md:px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all mb-1"
        >
          <Leaf className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline">View Store</span>
        </Link>
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="w-full flex items-center gap-3 px-2.5 md:px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
