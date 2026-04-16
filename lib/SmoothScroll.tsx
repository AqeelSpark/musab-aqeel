'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LenisContext } from '@/lib/lenis-context'
import { useLoader } from '@/lib/LoaderContext'
import { scroll } from '@/lib/motion'

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

    const lenis = new Lenis({ autoRaf: false })
    lenisRef.current = lenis

    lenis.stop()

    lenis.on('scroll', ScrollTrigger.update)

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(rafCallback)
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
        ScrollTrigger.refresh()
      })
    } else {
      lenis.scrollTo(0, { immediate: true })
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }
  }, [pathname])

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  )
}
