'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 flex justify-center pointer-events-none">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ background: 'linear-gradient(135deg, #1F6B4F 0%, #4CAF50 60%, #FF8A3D 100%)', boxShadow: '0 4px 24px rgba(31,107,79,0.35)' }}
        className="pointer-events-auto flex items-center gap-2 text-white pl-2 pr-4 py-2 rounded-full text-xs font-semibold tracking-wide active:scale-95 transition-transform duration-150 animate-fade-up whitespace-nowrap"
        aria-label="Back to top"
      >
        <div className="w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center flex-shrink-0">
          <ArrowUp className="w-3 h-3" />
        </div>
        Back to top
      </button>
    </div>
  )
}
