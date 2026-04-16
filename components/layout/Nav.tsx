'use client'

import type Lenis from 'lenis'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
} from 'react'
import HamburgerIcon from '@/components/ui/HamburgerIcon'
import Logo from '@/components/ui/Logo'
import MagneticButton from '@/components/ui/MagneticButton'
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, SITE_NAME } from '@/lib/config'
import { useLoader } from '@/lib/LoaderContext'
import { useLenisRef } from '@/lib/lenis-context'
import { duration, ease, scroll } from '@/lib/motion'
import type { NavLink } from '@/types'

const NAV_LINKS: readonly NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

const HOME_PATH = '/'
const HEADER_SCROLL_THRESHOLD = 60
/** Below this while already “scrolled”, release to idle (avoids flicker at the threshold). */
const HEADER_SCROLL_RELEASE = 28
const ACTIVE_SECTION_THRESHOLD = 120
/** After close: wait for clip + staggered exit before restoring scroll */
const MOBILE_MENU_RESTART_DELAY_MS = 1000
const MOBILE_SCROLL_DELAY_MS = 100
const MOBILE_MENU_OPEN_CLIP_PATH = 'circle(160% at calc(100% - 40px) 36px)'
const MOBILE_MENU_CLOSED_CLIP_PATH = 'circle(0% at calc(100% - 40px) 36px)'

type LenisRef = RefObject<Lenis | null>

function setBodyScrollLocked(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : ''
}

function getFocusableElements(menuEl: HTMLDivElement | null) {
  return menuEl
    ? Array.from(
        menuEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      )
    : []
}

function resolveActiveSection(pathname: string, isReadyToAnimate: boolean) {
  if (!isReadyToAnimate || pathname !== HOME_PATH) return ''

  const atBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2

  if (atBottom) {
    return NAV_LINKS[NAV_LINKS.length - 1].href
  }

  const firstSection = document.querySelector<HTMLElement>(NAV_LINKS[0].href)
  if (
    !firstSection ||
    firstSection.getBoundingClientRect().top > ACTIVE_SECTION_THRESHOLD
  ) {
    return ''
  }

  let currentSection = ''

  for (const link of NAV_LINKS) {
    const section = document.querySelector<HTMLElement>(link.href)
    if (!section) continue

    if (section.getBoundingClientRect().top <= ACTIVE_SECTION_THRESHOLD) {
      currentSection = link.href
      continue
    }

    break
  }

  return currentSection
}

function scrollToTop(
  lenisRef: LenisRef,
  mobileOpen: boolean,
  onComplete: () => void,
) {
  if (mobileOpen) {
    window.setTimeout(() => {
      const lenis = lenisRef.current
      lenis?.start()
      lenis?.scrollTo(0, {
        duration: 0.8,
        onComplete,
      })
    }, MOBILE_SCROLL_DELAY_MS)
    return
  }

  lenisRef.current?.scrollTo(0, {
    duration: 1.0,
    onComplete,
  })
}

function scrollToSection(
  lenisRef: LenisRef,
  target: HTMLElement,
  mobileOpen: boolean,
  onComplete: () => void,
) {
  if (mobileOpen) {
    window.setTimeout(() => {
      const lenis = lenisRef.current
      lenis?.start()
      lenis?.scrollTo(target, {
        offset: -scroll.headerOffset,
        duration: 0.8,
        onComplete,
      })
    }, MOBILE_SCROLL_DELAY_MS)
    return
  }

  lenisRef.current?.scrollTo(target, {
    offset: -scroll.headerOffset,
    duration: 1.0,
    onComplete,
  })
}

function useHeaderScrolledState() {
  const [scrolled, setScrolled] = useState(false)
  const lenisRef = useLenisRef()

  useEffect(() => {
    function readScrollY(lenis: Lenis | null): number {
      return lenis ? lenis.scroll : window.scrollY
    }

    function update() {
      const y = readScrollY(lenisRef.current)
      setScrolled((prev) =>
        prev ? y > HEADER_SCROLL_RELEASE : y > HEADER_SCROLL_THRESHOLD,
      )
    }

    update()

    window.addEventListener('scroll', update, { passive: true })

    let unsubscribeLenis: (() => void) | undefined
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      const attach = () => {
        const lenis = lenisRef.current
        if (lenis) unsubscribeLenis = lenis.on('scroll', update)
      }
      attach()
      if (!unsubscribeLenis) {
        raf2 = requestAnimationFrame(attach)
      }
    })

    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
      window.removeEventListener('scroll', update)
      unsubscribeLenis?.()
    }
  }, [lenisRef])

  return scrolled
}

function useActiveSectionState(pathname: string, isReadyToAnimate: boolean) {
  const [activeSection, setActiveSection] = useState('')
  const isProgrammaticScrollRef = useRef(false)

  const getActiveSection = useCallback(() => {
    return resolveActiveSection(pathname, isReadyToAnimate)
  }, [isReadyToAnimate, pathname])

  const syncActiveSection = useCallback(() => {
    if (isProgrammaticScrollRef.current) return
    setActiveSection(getActiveSection())
  }, [getActiveSection])

  // Bypasses the programmatic-scroll guard so the mobile menu always opens
  // showing the section the user is actually at, even if a Lenis scroll was
  // interrupted (which would leave isProgrammaticScrollRef stuck at true).
  const forceSyncActiveSection = useCallback(() => {
    isProgrammaticScrollRef.current = false
    setActiveSection(getActiveSection())
  }, [getActiveSection])

  const beginProgrammaticScroll = useCallback(() => {
    isProgrammaticScrollRef.current = true
  }, [])

  const finishProgrammaticScroll = useCallback(() => {
    isProgrammaticScrollRef.current = false
    setActiveSection(getActiveSection())
  }, [getActiveSection])

  const resetActiveSection = useCallback(() => {
    isProgrammaticScrollRef.current = false
    setActiveSection('')
  }, [])

  useEffect(() => {
    if (!isReadyToAnimate || pathname !== HOME_PATH) return

    const frame = window.requestAnimationFrame(syncActiveSection)

    window.addEventListener('scroll', syncActiveSection, { passive: true })
    window.addEventListener('resize', syncActiveSection)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', syncActiveSection)
      window.removeEventListener('resize', syncActiveSection)
    }
  }, [isReadyToAnimate, pathname, syncActiveSection])

  return {
    activeSection,
    beginProgrammaticScroll,
    finishProgrammaticScroll,
    forceSyncActiveSection,
    resetActiveSection,
    setActiveSection,
    syncActiveSection,
  }
}

function useMobileMenuEffects(
  mobileOpen: boolean,
  lenisRef: LenisRef,
  menuRef: RefObject<HTMLDivElement | null>,
  forceSyncActiveSection: () => void,
  setMobileOpen: Dispatch<SetStateAction<boolean>>,
) {
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    const lenis = lenisRef.current

    if (mobileOpen) {
      hasOpenedRef.current = true
      lenis?.stop()
      setBodyScrollLocked(true)
      return
    }

    if (!hasOpenedRef.current) return

    const timer = window.setTimeout(() => {
      lenis?.start()
      setBodyScrollLocked(false)
    }, MOBILE_MENU_RESTART_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      lenis?.start()
      setBodyScrollLocked(false)
    }
  }, [lenisRef, mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return

    // Force-compute the real active section, cancelling any stuck programmatic
    // scroll flag that would have blocked the regular syncActiveSection guard.
    forceSyncActiveSection()

    const menuEl = menuRef.current
    const focusTimer = window.setTimeout(() => {
      getFocusableElements(menuEl)[0]?.focus({ preventScroll: true })
    }, 520)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(menuEl)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last?.focus({ preventScroll: true })
        }
        return
      }

      if (document.activeElement === last) {
        event.preventDefault()
        first?.focus({ preventScroll: true })
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuRef, mobileOpen, setMobileOpen, forceSyncActiveSection])
}

function DesktopNavLinks({
  activeSection,
  onNavigate,
}: {
  activeSection: string
  onNavigate: (href: string) => void
}) {
  return (
    <div className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <button
          key={link.href}
          type="button"
          onClick={() => onNavigate(link.href)}
          className="nav-link font-body text-sm font-medium tracking-wide"
          data-active={activeSection === link.href || undefined}
        >
          {link.label}
          <span className="nav-link-underline" />
        </button>
      ))}
    </div>
  )
}

function DesktopActions({
  onNavigate,
}: {
  onNavigate: (href: string) => void
}) {
  return (
    <div className="hidden items-center gap-4 lg:flex">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          backgroundColor: 'var(--color-surface-up)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </span>
        <span
          className="font-mono text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Available for work
        </span>
      </div>

      <MagneticButton
        className="btn-outline"
        onClick={() => onNavigate('#contact')}
      >
        Hire Me
      </MagneticButton>
    </div>
  )
}

function MobileMenu({
  activeSection,
  menuRef,
  onNavigate,
}: {
  activeSection: string
  menuRef: RefObject<HTMLDivElement | null>
  onNavigate: (href: string) => void
}) {
  const getMobileLinkColor = (href: string) => {
    if (activeSection === href) return 'var(--color-text-primary)'
    if (activeSection) return 'var(--color-text-tertiary)'
    return 'var(--color-text-primary)'
  }

  return (
    <motion.div
      key="mobile-menu"
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-40 flex h-dvh flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
      initial={{ clipPath: MOBILE_MENU_CLOSED_CLIP_PATH }}
      animate={{
        clipPath: MOBILE_MENU_OPEN_CLIP_PATH,
        transition: {
          duration: duration.mobileMenuClipOpen,
          ease: ease.layout,
        },
      }}
      exit={{
        clipPath: MOBILE_MENU_CLOSED_CLIP_PATH,
        transition: {
          duration: duration.mobileMenuClipClose,
          ease: ease.overlayExit,
        },
      }}
    >
      <div className="h-[64px] shrink-0" />

      <div className="flex flex-1 flex-col justify-center px-6">
        {NAV_LINKS.map((link, index) => (
          <div key={link.href} className="overflow-hidden">
            <motion.div
              initial={{ y: '110%' }}
              animate={{
                y: '0%',
                transition: {
                  duration: 0.65,
                  ease: ease.out,
                  delay: 0.2 + index * 0.075,
                },
              }}
              exit={{
                y: '110%',
                transition: {
                  duration: 0.48,
                  ease: ease.in,
                  delay: index * 0.05,
                },
              }}
            >
              <button
                type="button"
                onClick={() => onNavigate(link.href)}
                className="block w-full rounded-sm py-1 text-left outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              >
                <span
                  className="font-display block leading-[0.9] font-bold tracking-tight uppercase transition-colors duration-200"
                  style={{
                    fontSize: 'clamp(3rem, 14vw, 5.5rem)',
                    color: getMobileLinkColor(link.href),
                  }}
                >
                  {link.label}
                </span>
              </button>
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: ease.out,
            delay: 0.58,
          },
        }}
        exit={{
          opacity: 0,
          y: 8,
          transition: { duration: 0.38, ease: ease.in, delay: 0.06 },
        }}
        className="flex shrink-0 items-center justify-between px-6 pb-8"
      >
        <div className="flex flex-col gap-1.5">
          <p
            className="font-mono text-[10px] leading-none tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {SITE_NAME}
          </p>
          <p
            className="font-mono text-[10px] leading-none tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {CONTACT_EMAIL}
          </p>
        </div>
        <a
          href={CONTACT_EMAIL_HREF}
          className="group inline-flex items-center gap-2 rounded-[2px] px-4 py-2 font-mono transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-white/20"
          style={{
            border: '1px solid var(--color-border)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-secondary)',
          }}
        >
          Get in touch
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            →
          </span>
        </a>
      </motion.div>
    </motion.div>
  )
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const lenisRef = useLenisRef()
  const { isReadyToAnimate } = useLoader()
  const scrolled = useHeaderScrolledState()
  const {
    activeSection,
    beginProgrammaticScroll,
    finishProgrammaticScroll,
    forceSyncActiveSection,
    resetActiveSection,
    setActiveSection,
    syncActiveSection,
  } = useActiveSectionState(pathname, isReadyToAnimate)
  const visibleActiveSection =
    isReadyToAnimate && pathname === HOME_PATH ? activeSection : ''

  useMobileMenuEffects(
    mobileOpen,
    lenisRef,
    menuRef,
    forceSyncActiveSection,
    setMobileOpen,
  )

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const handleLogoClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()

      if (pathname === HOME_PATH) {
        if (window.scrollY === 0) {
          resetActiveSection()
          if (mobileOpen) closeMobileMenu()
          return
        }

        beginProgrammaticScroll()
        setActiveSection('')

        if (mobileOpen) {
          closeMobileMenu()
        }

        scrollToTop(lenisRef, mobileOpen, finishProgrammaticScroll)
        return
      }

      if (mobileOpen) {
        closeMobileMenu()
      }

      router.push(HOME_PATH)
    },
    [
      beginProgrammaticScroll,
      closeMobileMenu,
      finishProgrammaticScroll,
      lenisRef,
      mobileOpen,
      pathname,
      resetActiveSection,
      router,
      setActiveSection,
    ],
  )

  const handleNavClick = useCallback(
    (href: string) => {
      if (pathname !== HOME_PATH) {
        if (mobileOpen) {
          closeMobileMenu()
        }

        router.push(`/${href}`)
        return
      }

      const section = document.querySelector<HTMLElement>(href)
      if (!section) {
        closeMobileMenu()
        return
      }

      beginProgrammaticScroll()
      setActiveSection(href)

      if (mobileOpen) {
        closeMobileMenu()
      }

      scrollToSection(lenisRef, section, mobileOpen, finishProgrammaticScroll)
    },
    [
      beginProgrammaticScroll,
      closeMobileMenu,
      finishProgrammaticScroll,
      lenisRef,
      mobileOpen,
      pathname,
      router,
      setActiveSection,
    ],
  )

  const headerState = mobileOpen ? 'menu' : scrolled ? 'scrolled' : 'idle'

  return (
    <>
      <header className="site-header fixed top-0 right-0 left-0 z-50" data-state={headerState}>
        <nav className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Logo onClick={handleLogoClick} />
          <DesktopNavLinks
            activeSection={visibleActiveSection}
            onNavigate={handleNavClick}
          />
          <DesktopActions onNavigate={handleNavClick} />
          <HamburgerIcon
            isOpen={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          />
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            activeSection={visibleActiveSection}
            menuRef={menuRef}
            onNavigate={handleNavClick}
          />
        )}
      </AnimatePresence>
    </>
  )
}
