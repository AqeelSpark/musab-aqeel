import { useCallback, useRef } from 'react'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useScrollTriggerCleanup() {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  const cleanup = useCallback(() => {
    if (!scrollTriggerRef.current) return
    const anim = scrollTriggerRef.current.animation
    scrollTriggerRef.current.kill()
    anim?.kill()
    scrollTriggerRef.current = null
  }, [])

  return { cleanup, scrollTriggerRef }
}
