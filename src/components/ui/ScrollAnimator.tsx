'use client'

import { useEffect } from 'react'

export default function ScrollAnimator() {
  useEffect(() => {
    const observe = (el: Element) => {
      observer.observe(el)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    )

    // Initial scan
    document.querySelectorAll('[data-animate]').forEach(observe)

    // Watch for dynamically added elements (e.g. BestSelling products)
    const mutation = new MutationObserver(() => {
      document.querySelectorAll('[data-animate]:not(.in-view)').forEach(observe)
    })
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])

  return null
}
