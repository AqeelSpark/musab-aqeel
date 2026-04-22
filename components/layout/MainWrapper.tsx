'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useMainWrapperReveal } from '@/components/layout/useMainWrapperReveal'
import { useIntro } from '@/lib/IntroContext'

export default function MainWrapper({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isVisible: isIntroVisible, setIsReadyToAnimate } = useIntro()
  const hasAnimated = useRef(false)
  const [revealed, setRevealed] = useState(false)

  const handleRevealComplete = useCallback(() => {
    setRevealed(true)
    setIsReadyToAnimate(true)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [setIsReadyToAnimate])

  useMainWrapperReveal({
    isIntroVisible,
    wrapperRef,
    hasAnimatedRef: hasAnimated,
    onRevealComplete: handleRevealComplete,
  })

  return (
    <div
      ref={wrapperRef}
      style={
        revealed
          ? undefined
          : {
              // Seeds GSAP's fromTo so the first paint and the animation start
              // match. The loader (z-9999, opaque) covers this offset content
              // until it lifts off in `useMainWrapperReveal`.
              transform: 'translateY(48px)',
              opacity: 0,
              willChange: 'transform, opacity',
            }
      }
    >
      {children}
    </div>
  )
}
