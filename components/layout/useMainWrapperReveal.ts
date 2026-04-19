'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function getLoaderElements() {
  const loader = document.querySelector('.loader') as HTMLElement | null
  const loaderContent = document.querySelector('.loader-content') as HTMLElement | null

  return {
    loader,
    loaderContent,
  }
}

function revealWithoutLoader({
  loader,
  onRevealComplete,
}: {
  loader: HTMLElement | null
  onRevealComplete: () => void
}) {
  if (loader) {
    loader.style.visibility = 'hidden'
  }

  onRevealComplete()
}

export function useMainWrapperReveal({
  isLoading,
  wrapperRef,
  hasAnimatedRef,
  onRevealComplete,
}: {
  isLoading: boolean
  wrapperRef: RefObject<HTMLDivElement | null>
  hasAnimatedRef: RefObject<boolean>
  onRevealComplete: () => void
}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (isLoading || hasAnimatedRef.current) {
        return
      }

      hasAnimatedRef.current = true
      window.scrollTo(0, 0)

      const { loader, loaderContent } = getLoaderElements()
      const wrapper = wrapperRef.current

      if (!loader || !loaderContent || !wrapper) {
        revealWithoutLoader({
          loader,
          onRevealComplete,
        })
        return
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          loader.style.visibility = 'hidden'
          onRevealComplete()
        },
      })

      timelineRef.current = timeline

      // Phase 1 — loader content acknowledges it's leaving: fast ease-in
      // fade with a slight upward drift.
      timeline.to(loaderContent, {
        opacity: 0,
        y: -24,
        duration: 0.4,
        ease: 'power2.in',
      })

      // Phase 2 — loader slides off the top of the viewport. Pure transform
      // + opacity animation, which is GPU-composited reliably on iOS/macOS
      // Safari where clip-path on fixed elements has long-standing jank.
      // `yPercent: -105` gives a 5% buffer so there's never a sub-pixel
      // sliver left at the bottom edge during a rounding stutter.
      timeline.to(
        loader,
        {
          yPercent: -105,
          duration: 1.0,
          ease: 'power4.inOut',
        },
        '-=0.15',
      )

      // Phase 3 — page wrapper rises into place in parallel with the loader
      // lift-off. Shared direction (both moving up) reads as one coordinated
      // motion rather than two overlapping events. A softer ease-out settles
      // the content as the loader accelerates away.
      timeline.fromTo(
        wrapper,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          clearProps: 'transform,opacity,willChange',
        },
        '<',
      )
    },
    { dependencies: [hasAnimatedRef, isLoading, onRevealComplete, wrapperRef] },
  )

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [timelineRef])
}
