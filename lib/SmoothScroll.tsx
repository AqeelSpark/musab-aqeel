'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LenisContext } from '@/lib/lenis-context'
import { useLoader } from '@/lib/LoaderContext'
import { completeScrubAnimationsAtPageEnd } from '@/lib/completeScrubAtPageEnd'
import { lenis as lenisConfig, scroll } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()
  const { isLoading, isReadyToAnimate } = useLoader()

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    const lenis = new Lenis({
      autoRaf: false,
      lerp: lenisConfig.lerp,
      smoothWheel: true,
      wheelMultiplier: lenisConfig.wheelMultiplier,
      touchMultiplier: lenisConfig.touchMultiplier,
      syncTouch: lenisConfig.syncTouch,
      syncTouchLerp: lenisConfig.syncTouchLerp,
      touchInertiaExponent: lenisConfig.touchInertiaExponent,
      stopInertiaOnNavigate: lenisConfig.stopInertiaOnNavigate,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      overscroll: true,
    })
    lenisRef.current = lenis

    lenis.stop()

    // ScrollTrigger follows Lenis; scrub completion runs on the ticker *after*
    // Lenis + ST so nothing can overwrite forced progress in the same frame.
    lenis.on('scroll', () => {
      ScrollTrigger.update()
    })

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    /** Runs after Lenis RAF each frame — pins scrub tweens when parked at page end. */
    const pinScrubAfterLenis = () => {
      const l = lenisRef.current
      if (!l) return
      completeScrubAnimationsAtPageEnd(l.scroll, l.limit)
    }

    gsap.ticker.add(rafCallback)
    gsap.ticker.add(pinScrubAfterLenis)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(rafCallback)
      gsap.ticker.remove(pinScrubAfterLenis)
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    if (isReadyToAnimate && !isLoading) {
      lenis.start()
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    } else {
      lenis.stop()
    }
  }, [isLoading, isReadyToAnimate])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    const hash = window.location.hash
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.querySelector(hash)
        if (el) {
          lenis.scrollTo(el as HTMLElement, {
            offset: -scroll.headerOffset,
            immediate: true,
          })
        }
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      })
    } else {
      lenis.scrollTo(0, { immediate: true })
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      })
    }
  }, [pathname])

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  )
}
