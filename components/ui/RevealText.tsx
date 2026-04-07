'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface RevealTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  scrub?: boolean
}

export default function RevealText({
  children,
  className = '',
  delay = 0,
  scrub = true,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)

  const cleanup = useCallback(() => {
    if (stRef.current) {
      stRef.current.kill()
      stRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return

    gsap.set(ref.current, { opacity: 0, y: 30 })

    const tween = gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'none',
      delay,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 95%',
        end: 'top 65%',
        scrub: scrub ? 0.6 : false,
        once: !scrub,
        invalidateOnRefresh: true,
        onEnter: () => {
          if (!scrub && ref.current) {
            gsap.to(ref.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay })
          }
        },
      },
    })

    stRef.current = tween.scrollTrigger ?? null

    return cleanup
  }, [delay, scrub, cleanup])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
