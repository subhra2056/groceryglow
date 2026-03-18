'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

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
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(200,200,200,0.25) 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
        className="pointer-events-auto w-10 h-10 rounded-full backdrop-blur-md text-gray-500 flex items-center justify-center active:scale-95 transition-transform duration-150 animate-fade-up"
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  )
}
