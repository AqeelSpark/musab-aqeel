'use client'

import { useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DustFilterSvg from '@/components/ui/DustFilterSvg'
import { useScrollTriggerCleanup } from '@/components/ui/useScrollTriggerCleanup'
import { useLoader } from '@/lib/LoaderContext'
import { dust, scroll } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

interface RevealTextProps {
  children: ReactNode
  className?: string
  /**
   * Offsets the ScrollTrigger start so nested blocks can feel slightly staggered
   * (approx. pixels added to `start`; scroll-synced only).
   */
  delay?: number
}

export default function RevealText({
  children,
  className = '',
  delay = 0,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null)
  const reactId = useId()
  const filterId = `dust-${reactId.replace(/:/g, '')}`
  const { isReadyToAnimate } = useLoader()
  const { cleanup, scrollTriggerRef } = useScrollTriggerCleanup()
  const reducedMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !isReadyToAnimate) return

    cleanup()

    const start =
      delay !== 0
        ? `${scroll.revealStart}+=${Math.round(delay * 72)}`
        : scroll.revealStart

    const fe = displacementRef.current
    const useDust = !reducedMotion && fe

    if (useDust) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start,
          end: scroll.revealEnd,
          scrub: scroll.revealScrub,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        el,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, ease: 'none', duration: 1 },
        0,
      ).fromTo(
        fe,
        { attr: { scale: dust.maxDisplacement } },
        { attr: { scale: 0 }, ease: 'none', duration: 1 },
        0,
      )

      scrollTriggerRef.current = tl.scrollTrigger ?? null
    } else {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start,
            end: scroll.revealEnd,
            scrub: scroll.revealScrub,
            invalidateOnRefresh: true,
          },
        },
      )
      scrollTriggerRef.current = tween.scrollTrigger ?? null
    }

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [delay, cleanup, isReadyToAnimate, reducedMotion])

  const dustActive = !reducedMotion

  return (
    <>
      {dustActive && (
        <DustFilterSvg id={filterId} displacementRef={displacementRef} />
      )}
      <div
        ref={ref}
        data-reveal
        className={className}
        style={dustActive ? { filter: `url(#${filterId})` } : undefined}
      >
        {children}
      </div>
    </>
  )
}
