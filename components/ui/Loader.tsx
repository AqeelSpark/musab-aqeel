'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoader } from '@/lib/LoaderContext'

const TEXTS = ['Developer', 'Architect', 'Operator', 'Loading']
const MORPH_TIME = 0.8
const COOLDOWN_TIME = 0.3
const LOADER_DURATION = 3500

export default function Loader() {
  const { isLoading, progress, assetsReady } = useLoader()
  const [displayProgress, setDisplayProgress] = useState(0)

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  const textIndexRef = useRef(TEXTS.length - 1)
  const timeRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(COOLDOWN_TIME)
  const startTimeRef = useRef(0)
  const displayRef = useRef(0)
  const prevRoundedRef = useRef(0)
  const reachedLastRef = useRef(false)

  const assetsReadyRef = useRef(false)
  const progressRef = useRef(0)

  useEffect(() => {
    assetsReadyRef.current = assetsReady
  }, [assetsReady])
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const el1 = text1Ref.current
    const el2 = text2Ref.current
    if (!el1 || !el2) return

    const initialTime = Date.now()
    timeRef.current = initialTime
    startTimeRef.current = initialTime

    el1.textContent = TEXTS[textIndexRef.current % TEXTS.length]
    el2.textContent = TEXTS[(textIndexRef.current + 1) % TEXTS.length]

    const maxIndex = textIndexRef.current + TEXTS.length - 1

    function setMorph(fraction: number) {
      if (!el1 || !el2) return
      el2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      el2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

      const inv = 1 - fraction
      el1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`
      el1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`

      el1.textContent = TEXTS[textIndexRef.current % TEXTS.length]
      el2.textContent = TEXTS[(textIndexRef.current + 1) % TEXTS.length]
    }

    function doMorph() {
      morphRef.current -= cooldownRef.current
      cooldownRef.current = 0
      let fraction = morphRef.current / MORPH_TIME
      if (fraction > 1) {
        cooldownRef.current = COOLDOWN_TIME
        fraction = 1
      }
      setMorph(fraction)
    }

    function doCooldown() {
      if (!el1 || !el2) return
      morphRef.current = 0
      el2.style.filter = ''
      el2.style.opacity = '100%'
      el1.style.filter = ''
      el1.style.opacity = '0%'
    }

    function animate() {
      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const dt = (now - timeRef.current) / 1000
      timeRef.current = now

      // --- Counter ---
      if (assetsReadyRef.current) {
        const linearTarget = Math.min((elapsed / LOADER_DURATION) * 100, 100)
        if (linearTarget >= 100) {
          displayRef.current += (100 - displayRef.current) * 0.12
        } else {
          displayRef.current = linearTarget
        }
      } else {
        displayRef.current += (progressRef.current - displayRef.current) * 0.08
      }

      const rounded = Math.min(Math.round(displayRef.current), 100)
      if (rounded !== prevRoundedRef.current) {
        prevRoundedRef.current = rounded
        setDisplayProgress(rounded)
      }

      // --- Morph ---
      if (reachedLastRef.current) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      const shouldIncrement = cooldownRef.current > 0
      cooldownRef.current -= dt

      if (cooldownRef.current <= 0) {
        if (shouldIncrement) {
          if (textIndexRef.current < maxIndex) {
            textIndexRef.current++
          } else {
            reachedLastRef.current = true
            doCooldown()
            rafRef.current = requestAnimationFrame(animate)
            return
          }
        }
        doMorph()
      } else {
        doCooldown()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      cancelAnimationFrame(rafRef.current)
    }
  }, [isLoading])

  return (
    <div
      className="loader fixed inset-0 z-9999 flex h-dvh w-screen flex-col items-center justify-center text-white"
      style={{
        background:
          'linear-gradient(135deg, oklch(0% 0 0) 0%, oklch(12% 0.01 80) 50%, var(--color-bg) 100%)',
      }}
      aria-hidden={!isLoading}
    >
      <div className="loader-content relative flex h-full w-full flex-col items-center justify-center">
        {/* Morph container */}
        <div
          className="relative w-full"
          style={{
            height: '80pt',
            filter: 'url(#threshold) blur(0.45px)',
          }}
        >
          <span
            ref={text1Ref}
            className="font-display absolute inline-block w-full text-center text-5xl font-semibold select-none md:text-[80pt]"
          />
          <span
            ref={text2Ref}
            className="font-display absolute inline-block w-full text-center text-5xl font-semibold select-none md:text-[80pt]"
          />
        </div>

        {/* Progress counter */}
        <div className="absolute right-8 bottom-8 md:right-12 md:bottom-10">
          <span className="font-mono text-sm text-white/60 tabular-nums md:text-base">
            [ {displayProgress}% ]
          </span>
        </div>
      </div>

      {/* SVG threshold filter */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
