'use client'

import { Bell } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { AppNotification } from '@/contexts/NotificationContext'

interface NotificationsTabProps {
  notifications: AppNotification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearAll: () => Promise<void>
}

export default function NotificationsTab({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
}: NotificationsTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-charcoal">Notifications</h2>
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-forest-green font-medium hover:underline">
                Mark all as read
              </button>
            )}
            <button onClick={clearAll} className="text-xs text-red-400 font-medium hover:underline">
              Clear all
            </button>
          </div>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-card transition-all ${!n.is_read ? 'border-l-4 border-forest-green' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-medium text-charcoal ${!n.is_read ? 'font-semibold' : ''}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {!n.is_read && <span className="w-2 h-2 bg-forest-green rounded-full" />}
                  <p className="text-[10px] text-gray-400">{formatDate(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
