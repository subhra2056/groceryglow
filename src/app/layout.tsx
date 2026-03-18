import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
