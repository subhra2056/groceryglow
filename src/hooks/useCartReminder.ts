'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'

const REMINDER_DELAY_MS = 2 * 60 * 1000 // 2 minutes

/**
 * Fires a cart-reminder notification if the user has items in
 * their cart for more than 2 minutes without checking out.
 */
export function useCartReminder() {
  const { items } = useCart()
  const { addLocalNotification } = useNotifications()
  const { user } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRemindedRef = useRef(false)

  useEffect(() => {
    // Reset reminder flag when cart changes
    hasRemindedRef.current = false

    if (timerRef.current) clearTimeout(timerRef.current)

    if (!user || items.length === 0) return

    timerRef.current = setTimeout(() => {
      if (hasRemindedRef.current) return
      hasRemindedRef.current = true

      const itemCount = items.reduce((s, i) => s + i.quantity, 0)
      const message = `You have ${itemCount} item${itemCount !== 1 ? 's' : ''} waiting in your cart. Ready to checkout?`

      addLocalNotification({
        type: 'cart_reminder',
        title: '🛒 Don\'t forget your groceries!',
        message,
        data: null,
      })

      // Browser push notification
      if (typeof window !== 'undefined') {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('🛒 Don\'t forget your groceries!', { body: message })
            }
          })
        } else if (Notification.permission === 'granted') {
          new Notification('🛒 Don\'t forget your groceries!', { body: message })
        }
      }
    }, REMINDER_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items, user, addLocalNotification])
}
