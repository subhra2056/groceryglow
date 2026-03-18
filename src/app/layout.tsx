import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import ScrollAnimator from '@/components/ui/ScrollAnimator'
import { SpeedInsights } from '@vercel/speed-insights/next'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
})

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
  preload: true,
})

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
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${dmSerif.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body>
        <ScrollAnimator />
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </CartProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
