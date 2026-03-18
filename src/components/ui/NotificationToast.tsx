'use client'

import { useEffect, useState } from 'react'
import { X, ShoppingCart, Package } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

export default function NotificationToast() {
  const { toast, dismissToast } = useNotifications()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [toast])

  if (!toast) return null

  const Icon = toast.type === 'cart_reminder' ? ShoppingCart : Package
  const iconBg = toast.type === 'cart_reminder'
    ? 'bg-sunset-orange/10 text-sunset-orange'
    : 'bg-forest-green/10 text-forest-green'

  return (
    <div
      className={cn(
        'fixed bottom-[76px] md:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-32px)] max-w-sm',
        'bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-gray-100',
        'flex items-start gap-3 px-4 py-3.5',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal leading-tight">{toast.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={dismissToast}
        className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0 -mt-0.5 -mr-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
