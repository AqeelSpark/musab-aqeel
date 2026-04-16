'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useScrollTriggerCleanup } from '@/components/ui/useScrollTriggerCleanup'
import { useLoader } from '@/lib/LoaderContext'
import { scroll } from '@/lib/motion'

interface RevealTextProps {
  children: ReactNode
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
  const { isReadyToAnimate } = useLoader()
  const { cleanup, scrollTriggerRef } = useScrollTriggerCleanup()

  useEffect(() => {
    if (!ref.current || !isReadyToAnimate) return

    gsap.set(ref.current, { opacity: 0, y: 30 })

    const tween = gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: scrub ? 1 : 0.7,
      ease: scrub ? 'none' : 'power3.out',
      delay: scrub ? 0 : delay,
      scrollTrigger: {
        trigger: ref.current,
        start: scroll.revealStart,
        end: scroll.revealEnd,
        scrub: scrub ? 0.3 : false,
        once: !scrub,
        invalidateOnRefresh: true,
      },
    })

    scrollTriggerRef.current = tween.scrollTrigger ?? null

    return cleanup
  }, [delay, scrub, cleanup, isReadyToAnimate, scrollTriggerRef])

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}
