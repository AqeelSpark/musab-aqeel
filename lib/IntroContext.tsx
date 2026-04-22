'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { useIntroBootstrap } from '@/lib/intro-bootstrap'

interface IntroContextValue {
  /** The cosmetic intro is currently on screen. */
  isVisible: boolean
  /** Page-level entrance animations (SplitText, RevealText, Hero fadeUps) may fire. */
  isReadyToAnimate: boolean
  setIsReadyToAnimate: (v: boolean) => void
}

const IntroContext = createContext<IntroContextValue>({
  isVisible: true,
  isReadyToAnimate: false,
  setIsReadyToAnimate: () => {},
})

export function useIntro() {
  return useContext(IntroContext)
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const state = useIntroBootstrap()

  return <IntroContext.Provider value={state}>{children}</IntroContext.Provider>
}
