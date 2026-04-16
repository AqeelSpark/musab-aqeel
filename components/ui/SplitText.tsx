'use client'

import { useId, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DustFilterSvg from '@/components/ui/DustFilterSvg'
import { useScrollTriggerCleanup } from '@/components/ui/useScrollTriggerCleanup'
import { useLoader } from '@/lib/LoaderContext'
import { dust, scroll, stagger } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

interface SplitTextProps {
  children: string
  className?: string
  style?: CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  trigger?: 'load' | 'scroll'
  delay?: number
}

function scrollTriggerConfig(container: HTMLElement, start: string) {
  return {
    trigger: container,
    start,
    end: scroll.revealEnd,
    scrub: scroll.revealScrub,
    invalidateOnRefresh: true,
  }
}

export default function SplitText({
  children,
  className = '',
  style,
  as: Tag = 'h2',
  trigger: propTrigger = 'scroll',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null)
  const loadTlRef = useRef<gsap.core.Timeline | null>(null)
  const dustTweenRef = useRef<gsap.core.Tween | null>(null)
  const reactId = useId()
  const filterId = `dust-${reactId.replace(/:/g, '')}`
  const { isReadyToAnimate } = useLoader()
  const { cleanup, scrollTriggerRef } = useScrollTriggerCleanup()
  const reducedMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const words = container.querySelectorAll<HTMLSpanElement>('.split-word')
    if (words.length === 0) return

    const isLoad = propTrigger === 'load'

    if (!isReadyToAnimate) {
      gsap.set(words, { yPercent: 110 })
      return
    }

    cleanup()
    dustTweenRef.current?.scrollTrigger?.kill()
    dustTweenRef.current?.kill()
    dustTweenRef.current = null
    loadTlRef.current?.kill()
    loadTlRef.current = null

    if (isLoad) {
      gsap.set(words, { yPercent: 110 })

      const fe = displacementRef.current
      const useDust = !reducedMotion && fe

      if (useDust) {
        const tl = gsap.timeline({ delay })
        tl.fromTo(
          fe,
          { attr: { scale: dust.maxDisplacement } },
          { attr: { scale: 0 }, duration: 0.75, ease: 'power3.out' },
          0,
        ).to(
          words,
          {
            yPercent: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: stagger.tight,
          },
          0,
        )
        loadTlRef.current = tl
      } else {
        const tl = gsap.timeline({ delay })
        tl.to(words, {
          yPercent: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: stagger.tight,
        })
        loadTlRef.current = tl
      }

      return () => {
        loadTlRef.current?.kill()
        loadTlRef.current = null
      }
    }

    const start =
      delay !== 0
        ? `${scroll.revealStart}+=${Math.round(delay * 72)}`
        : scroll.revealStart

    gsap.set(words, { yPercent: 110 })

    const fe = displacementRef.current
    const useDust = !reducedMotion && fe
    const st = scrollTriggerConfig(container, start)

    const wordsTween = gsap.fromTo(
      words,
      { yPercent: 110 },
      {
        yPercent: 0,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: st,
      },
    )

    scrollTriggerRef.current = wordsTween.scrollTrigger ?? null

    if (useDust) {
      dustTweenRef.current = gsap.fromTo(
        fe,
        { attr: { scale: dust.maxDisplacement } },
        {
          attr: { scale: 0 },
          ease: 'none',
          scrollTrigger: { ...st },
        },
      )
    }

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(raf)
      dustTweenRef.current?.scrollTrigger?.kill()
      dustTweenRef.current?.kill()
      dustTweenRef.current = null
      cleanup()
    }
  }, [propTrigger, delay, cleanup, isReadyToAnimate, reducedMotion])

  const words = children.split(' ')
  const dustActive = !reducedMotion

  return (
    <>
      {dustActive && (
        <DustFilterSvg id={filterId} displacementRef={displacementRef} />
      )}
      <Tag
        ref={(el) => {
          containerRef.current = el
        }}
        className={className}
        style={{
          ...style,
          ...(dustActive ? { filter: `url(#${filterId})` } : {}),
        }}
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
    </>
  )
}
