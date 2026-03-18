import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import ScrollAnimator from '@/components/ui/ScrollAnimator'

export const metadata: Metadata = {
  title: {
    default: 'GroceryGlow — Fresh Groceries Delivered',
    template: '%s | GroceryGlow',
  },
  description:
    'Premium fresh groceries delivered to your door. Shop organic fruits, vegetables, dairy, and more.',
  keywords: ['grocery', 'fresh produce', 'organic', 'delivery', 'GroceryGlow'],
  openGraph: {
    title: 'GroceryGlow — Fresh Groceries Delivered',
    description: 'Premium fresh groceries delivered to your door.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..600;1,9..40,300..600&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ScrollAnimator />
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
