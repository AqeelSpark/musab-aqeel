'use client'

import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { gsap } from 'gsap'
import { useScrollTriggerCleanup } from '@/components/ui/useScrollTriggerCleanup'
import { useLoader } from '@/lib/LoaderContext'
import { scroll, stagger } from '@/lib/motion'

interface SplitTextProps {
  children: string
  className?: string
  style?: CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  trigger?: 'load' | 'scroll'
  delay?: number
}

export default function SplitText({
  children,
  className = '',
  style,
  as: Tag = 'h2',
  trigger = 'scroll',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const { isReadyToAnimate } = useLoader()
  const { cleanup, scrollTriggerRef } = useScrollTriggerCleanup()

  useEffect(() => {
    if (!containerRef.current) return
    const words =
      containerRef.current.querySelectorAll<HTMLSpanElement>('.split-word')
    gsap.set(words, { yPercent: 110 })
  }, [])

  useEffect(() => {
    if (!containerRef.current || !isReadyToAnimate) return

    const words =
      containerRef.current.querySelectorAll<HTMLSpanElement>('.split-word')

    if (trigger === 'load') {
      gsap.to(words, {
        yPercent: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: stagger.tight,
        delay,
      })
    } else {
      const tween = gsap.to(words, {
        yPercent: 0,
        duration: 1,
        ease: 'none',
        stagger: 0.08,
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: scroll.revealStart,
          end: scroll.revealEnd,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      scrollTriggerRef.current = tween.scrollTrigger ?? null
    }

    return cleanup
  }, [trigger, delay, cleanup, isReadyToAnimate, scrollTriggerRef])

  const words = children.split(' ')

  return (
    <Tag
      ref={containerRef as RefObject<HTMLHeadingElement>}
      className={className}
      style={style}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span className="split-word inline-block">
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}
