'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
  AnimatePresence,
} from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type CursorState = 'default' | 'link' | 'project'

const DOT_SIZE = 6
const DOT_OFFSET = DOT_SIZE / 2

/** Springs tuned so the ring lags slightly behind the dot for depth */
const springDot = { stiffness: 520, damping: 34, mass: 0.45 }
const springRing = { stiffness: 210, damping: 26, mass: 0.7 }

export default function CustomCursor() {
  const reducedMotion = usePrefersReducedMotion()
  const visibleRef = useRef(false)
  const stateRef = useRef<CursorState>('default')
  const lastPos = useRef({ x: 0, y: 0 })

  const [hoverState, setHoverState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const dotX = useSpring(mouseX, springDot)
  const dotY = useSpring(mouseY, springDot)

  const ringX = useSpring(mouseX, springRing)
  const ringY = useSpring(mouseY, springRing)

  const dotScale = useMotionValue(1)
  const ringScale = useMotionValue(1)

  const detectState = useCallback((target: Element): CursorState => {
    if (target.closest('[data-cursor="project"]')) return 'project'
    if (
      target.closest(
        'a, button, label, summary, [data-cursor="link"], [role="button"], [role="link"], input, textarea, select',
      )
    )
      return 'link'
    return 'default'
  }, [])

  const setCursorState = useCallback((next: CursorState) => {
    if (next !== stateRef.current) {
      stateRef.current = next
      setHoverState(next)
    }
  }, [])

  const updateStateFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY)
      if (!(el instanceof Element)) return
      setCursorState(detectState(el))
    },
    [detectState, setCursorState],
  )

  useEffect(() => {
    if (reducedMotion) return

    const hasHover = window.matchMedia('(hover: hover)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (!hasHover || !finePointer) return

    document.documentElement.classList.add('custom-cursor-active')

    let scrollRaf = 0
    const scheduleScrollSync = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        if (!visibleRef.current) return
        const { x, y } = lastPos.current
        updateStateFromPoint(x, y)
      })
    }

    function onMouseMove(e: MouseEvent) {
      lastPos.current = { x: e.clientX, y: e.clientY }
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      updateStateFromPoint(e.clientX, e.clientY)
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
    }

    function onMouseOver(e: MouseEvent) {
      const t = e.target
      if (!(t instanceof Element)) return
      setCursorState(detectState(t))
    }

    function onMouseDown() {
      animate(dotScale, 0.88, { duration: 0.1, ease: 'easeOut' })
      animate(ringScale, 0.94, { duration: 0.12, ease: 'easeOut' })
    }

    function onMouseUp() {
      animate(dotScale, 1, { duration: 0.22, ease: 'easeOut' })
      animate(ringScale, 1, { duration: 0.24, ease: 'easeOut' })
    }

    function onLeaveWindow() {
      visibleRef.current = false
      setVisible(false)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onLeaveWindow)
    window.addEventListener('blur', onLeaveWindow)
    window.addEventListener('scroll', scheduleScrollSync, true)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onLeaveWindow)
      window.removeEventListener('blur', onLeaveWindow)
      window.removeEventListener('scroll', scheduleScrollSync, true)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [
    reducedMotion,
    mouseX,
    mouseY,
    dotScale,
    ringScale,
    detectState,
    updateStateFromPoint,
    setCursorState,
  ])

  if (reducedMotion) {
    return null
  }

  const ringSize =
    hoverState === 'project' ? 64 : hoverState === 'link' ? 48 : 32

  const dotHidden = hoverState === 'link'

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-10000 rounded-full will-change-transform"
        style={{
          x: dotX,
          y: dotY,
          scale: dotHidden ? 0 : dotScale,
          width: DOT_SIZE,
          height: DOT_SIZE,
          marginLeft: -DOT_OFFSET,
          marginTop: -DOT_OFFSET,
          backgroundColor: 'var(--color-text-primary)',
          mixBlendMode: 'difference',
        }}
        animate={{
          opacity: visible && !dotHidden ? 1 : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-10000 flex items-center justify-center rounded-full will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          border: '1px solid var(--color-border-up)',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          mixBlendMode: 'difference',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          opacity: visible ? 1 : 0,
          backgroundColor:
            hoverState !== 'default'
              ? 'rgba(212, 255, 0, 0.07)'
              : 'rgba(0, 0, 0, 0)',
          borderColor:
            hoverState !== 'default'
              ? 'rgba(212, 255, 0, 0.18)'
              : 'rgba(115, 115, 115, 1)',
        }}
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <AnimatePresence mode="wait">
          {hoverState === 'project' && (
            <motion.span
              key="view"
              initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -3, filter: 'blur(2px)' }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--color-text-primary)' }}
            >
              View
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
