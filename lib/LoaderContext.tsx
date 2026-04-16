'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { LOADER_DURATION_MS } from '@/lib/motion'

interface LoaderContextValue {
  isLoading: boolean
  progress: number
  assetsReady: boolean
  isReadyToAnimate: boolean
  setIsReadyToAnimate: (v: boolean) => void
}

const LoaderContext = createContext<LoaderContextValue>({
  isLoading: true,
  progress: 0,
  assetsReady: false,
  isReadyToAnimate: false,
  setIsReadyToAnimate: () => {},
})

export function useLoader() {
  return useContext(LoaderContext)
}

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [assetsReady, setAssetsReady] = useState(false)
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false)
  const hasRun = useRef(false)

  const trackImages = useCallback(() => {
    return new Promise<void>((resolve) => {
      let settled = false
      const safeResolve = () => {
        if (settled) return
        settled = true
        clearTimeout(fallbackTimer)
        resolve()
      }

      // Hard cap: never block the loader for more than 8 seconds regardless of
      // images that never fire load or error (lazy images, ad-blocked assets, etc.)
      const fallbackTimer = setTimeout(() => {
        setProgress(100)
        safeResolve()
      }, 8000)

      const check = () => {
        const imgs = Array.from(document.querySelectorAll('img'))
        if (imgs.length === 0) {
          setProgress(100)
          safeResolve()
          return
        }

        let loaded = 0
        const total = imgs.length

        const tick = () => {
          loaded++
          setProgress(Math.min(Math.round((loaded / total) * 100), 100))
          if (loaded >= total) safeResolve()
        }

        for (const img of imgs) {
          if (img.complete && img.naturalWidth > 0) {
            tick()
          } else {
            img.addEventListener('load', tick, { once: true })
            img.addEventListener('error', tick, { once: true })
          }
        }
      }

      if (document.readyState === 'complete') {
        setProgress(100)
        safeResolve()
      } else {
        window.addEventListener(
          'load',
          () => {
            setProgress(100)
            safeResolve()
          },
          { once: true },
        )
        check()
      }
    })
  }, [])

  useEffect(() => {
    if (hasRun.current) {
      setIsLoading(false)
      setProgress(100)
      setAssetsReady(true)
      setIsReadyToAnimate(true)
      return
    }

    let timerDone = false
    let assetsDone = false

    const checkBothDone = () => {
      if (timerDone && assetsDone) {
        setIsLoading(false)
        hasRun.current = true
      }
    }

    setTimeout(() => {
      timerDone = true
      checkBothDone()
    }, LOADER_DURATION_MS)

    trackImages().then(() => {
      assetsDone = true
      setAssetsReady(true)
      checkBothDone()
    })
  }, [trackImages])

  return (
    <LoaderContext.Provider
      value={{
        isLoading,
        progress,
        assetsReady,
        isReadyToAnimate,
        setIsReadyToAnimate,
      }}
    >
      {children}
    </LoaderContext.Provider>
  )
}
