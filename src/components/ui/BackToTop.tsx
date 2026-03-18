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
        className="pointer-events-auto w-9 h-9 rounded-full bg-white text-black border-2 border-black flex items-center justify-center active:scale-95 transition-transform duration-150 animate-fade-up shadow-lg"
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  )
}
