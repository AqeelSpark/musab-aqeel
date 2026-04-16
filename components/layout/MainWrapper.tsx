'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLoader } from '@/lib/LoaderContext'

gsap.registerPlugin(ScrollTrigger)

export default function MainWrapper({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isLoading, setIsReadyToAnimate } = useLoader()
  const hasAnimated = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (isLoading || hasAnimated.current) return
      hasAnimated.current = true

      window.scrollTo(0, 0)

      const loaderEl = document.querySelector('.loader') as HTMLElement | null
      const loaderContent = document.querySelector(
        '.loader-content',
      ) as HTMLElement | null
      const wrapper = wrapperRef.current

      if (!loaderEl || !loaderContent || !wrapper) {
        if (loaderEl) loaderEl.style.visibility = 'hidden'
        setRevealed(true)
        setIsReadyToAnimate(true)
        requestAnimationFrame(() => ScrollTrigger.refresh())
        return
      }

      const tl = gsap.timeline({
        onComplete: () => {
          loaderEl.style.visibility = 'hidden'
          setRevealed(true)
          setIsReadyToAnimate(true)
          requestAnimationFrame(() => ScrollTrigger.refresh())
        },
      })
      tlRef.current = tl

      tl.to(loaderContent, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      })

      tl.to(
        loaderEl,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.2,
          ease: 'power4.inOut',
        },
        '-=0.15',
      )

      tl.fromTo(
        wrapper,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power4.inOut',
          clearProps: 'clipPath',
        },
        '<',
      )
    },
    { dependencies: [isLoading] },
  )

  useEffect(() => {
    return () => {
      tlRef.current?.kill()
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={revealed ? undefined : { clipPath: 'inset(0% 0% 100% 0%)' }}
    >
      {children}
    </div>
  )
}
