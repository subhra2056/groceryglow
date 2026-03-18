import Link from 'next/link'
import { Leaf, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

const footerLinks = {
  Shop: [
    { label: 'Fresh Fruits', href: '/shop?category=fresh-fruits' },
    { label: 'Vegetables', href: '/shop?category=vegetables' },
    { label: 'Dairy & Eggs', href: '/shop?category=dairy' },
    { label: 'Bakery', href: '/shop?category=bakery' },
    { label: 'All Products', href: '/shop' },
  ],
  Account: [
    { label: 'My Profile', href: '/account' },
    { label: 'My Orders', href: '/account?tab=orders' },
    { label: 'Wishlist', href: '/account?tab=wishlist' },
    { label: 'Sign In', href: '/auth/signin' },
    { label: 'Sign Up', href: '/auth/signup' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
}

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function Footer({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <footer className={`bg-charcoal text-white${hideOnMobile ? ' hidden md:block' : ''}`}>
      <div className="container-app py-10 md:py-16 pb-[88px] md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-8">
          {/* Brand column */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-forest-green to-leaf-green rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Grocery<span className="text-sunset-orange">Glow</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium organic groceries delivered fresh to your doorstep. Supporting local farmers,
              one order at a time.
            </p>

            {/* Contact */}
            <div className="space-y-2">
              {[
                { icon: Mail, text: 'hello@groceryglow.com' },
                { icon: Phone, text: '+78432470144' },
                { icon: MapPin, text: 'San Francisco, CA 94102' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <Icon className="w-3.5 h-3.5 text-leaf-green flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links columns — 2-col grid on mobile, individual cols on desktop */}
          <div className="col-span-1 md:contents">
            <div className="grid grid-cols-2 gap-6 md:contents">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="md:col-span-1">
                  <h4 className="font-semibold text-white text-sm mb-3 md:mb-4">{title}</h4>
                  <ul className="space-y-2 md:space-y-2.5">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-gray-400 text-xs md:text-sm hover:text-leaf-green transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} GroceryGlow. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 bg-white/10 hover:bg-leaf-green rounded-lg flex items-center justify-center transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
