import type Lenis from 'lenis'
import type { RefObject } from 'react'

import { scroll } from '@/lib/motion'

export type LenisRef = RefObject<Lenis | null>

type EasingFn = (t: number) => number

interface ScrollTargetOptions {
  duration?: number
  /** Custom easing for Lenis scrollTo. Leave undefined to use Lenis default. */
  easing?: EasingFn
  offset?: number
  onComplete?: () => void
  delayMs?: number
  restartLenis?: boolean
}

function runAfterDelay(callback: () => void, delayMs: number) {
  if (delayMs <= 0) {
    callback()
    return
  }

  window.setTimeout(callback, delayMs)
}

export function scrollToPageTop(
  lenisRef: LenisRef,
  {
    duration = 1,
    easing,
    delayMs = 0,
    onComplete,
    restartLenis = false,
  }: ScrollTargetOptions = {},
) {
  runAfterDelay(() => {
    const lenis = lenisRef.current

    if (restartLenis) {
      lenis?.start()
    }

    if (lenis) {
      lenis.scrollTo(0, {
        duration,
        ...(easing && { easing }),
        onComplete,
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
    onComplete?.()
  }, delayMs)
}

export function scrollToElement(
  lenisRef: LenisRef,
  target: HTMLElement,
  {
    duration = 1,
    easing,
    offset = -scroll.headerOffset,
    delayMs = 0,
    onComplete,
    restartLenis = false,
  }: ScrollTargetOptions = {},
) {
  runAfterDelay(() => {
    const lenis = lenisRef.current

    if (restartLenis) {
      lenis?.start()
    }

    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        duration,
        ...(easing && { easing }),
        onComplete,
      })
      return
    }

    const y = target.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top: y, behavior: 'smooth' })
    onComplete?.()
  }, delayMs)
}

export function scrollToHashSection(
  lenisRef: LenisRef,
  href: string,
  options: ScrollTargetOptions = {},
): boolean {
  const target = document.querySelector<HTMLElement>(href)

  if (!target) {
    return false
  }

  scrollToElement(lenisRef, target, options)
  return true
}
