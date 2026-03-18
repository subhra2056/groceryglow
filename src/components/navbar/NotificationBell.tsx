'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, ShoppingCart, Package, Check, CheckCheck } from 'lucide-react'
import { useNotifications, type AppNotification } from '@/contexts/NotificationContext'
import { useCartReminder } from '@/hooks/useCartReminder'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function NotificationItem({
  n,
  onRead,
  onDelete,
}: {
  n: AppNotification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const Icon = n.type === 'cart_reminder' ? ShoppingCart : Package

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group/item',
        !n.is_read && 'bg-green-50/50'
      )}
      onClick={() => onRead(n.id)}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          n.type === 'cart_reminder'
            ? 'bg-orange-100 text-sunset-orange'
            : 'bg-green-100 text-forest-green'
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer">
        <p className={cn('text-sm font-medium text-charcoal', !n.is_read && 'font-semibold')}>
          {n.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(n.id) }}
        className="p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover/item:opacity-100 flex-shrink-0 mt-0.5"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Activate cart reminder timer
  useCartReminder()

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-forest-green transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-[4.5rem] md:absolute md:left-auto md:right-0 md:top-auto md:w-80 md:mt-2 bg-white rounded-2xl shadow-card-hover border border-gray-100 z-50 overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-forest-green" />
              <span className="font-semibold text-charcoal text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge-green text-[10px]">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-forest-green transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-2 py-1 text-xs text-red-400 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-300 mt-1">
                  Order updates and reminders appear here
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} n={n} onRead={markAsRead} onDelete={deleteNotification} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <Link
                href="/account?tab=notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-forest-green font-medium hover:underline"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
