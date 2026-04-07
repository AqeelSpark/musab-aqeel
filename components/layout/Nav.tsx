'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Logo from '@/components/ui/Logo'
import HamburgerIcon from '@/components/ui/HamburgerIcon'
import MagneticButton from '@/components/ui/MagneticButton'
import { ease } from '@/lib/motion'
import type { NavLink } from '@/types'

const NAV_LINKS: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function handleNavClick(href: string) {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      const offset = 80
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'color-mix(in oklch, var(--color-bg) 80%, transparent)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '0.5px solid var(--color-border-sub)' : '0.5px solid transparent',
        }}
      >
        <nav className="mx-auto flex items-center justify-between px-6 py-4 max-w-[1400px]">
          <Logo />

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="nav-link text-sm font-medium tracking-wide"
                style={{ fontFamily: 'var(--font-body), sans-serif' }}
              >
                {link.label}
                <span className="nav-link-underline" />
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-surface-up)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: 'var(--font-mono), monospace', color: 'var(--color-text-secondary)' }}
              >
                Available for work
              </span>
            </div>

            <MagneticButton
              className="btn-outline"
              onClick={() => handleNavClick('#contact')}
            >
              Hire Me
            </MagneticButton>
          </div>

          <HamburgerIcon isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
        </nav>
      </header>

      {/* ── Mobile menu ── */}
      <AnimatePresence mode="wait">
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 mobile-nav-overlay flex flex-col"
            style={{ backgroundColor: 'var(--color-bg)' }}
            initial={{ clipPath: 'circle(0% at 0% 0%)' }}
            animate={{
              clipPath: 'circle(155% at 0% 0%)',
              transition: {
                duration: 0.7,
                ease: [0.32, 0.72, 0, 1],
              },
            }}
            exit={{
              clipPath: 'circle(0% at 0% 0%)',
              transition: {
                duration: 0.6,
                ease: [0.5, 0, 0.75, 0],
                delay: 0.2,
              },
            }}
          >
            {/* Top spacer for header */}
            <div className="h-[64px] shrink-0" />

            {/* Links — vertically centered, massive uppercase, left-aligned */}
            <div className="flex-1 flex flex-col justify-center px-6">
              {NAV_LINKS.map((link, i) => (
                <div key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{
                      y: '0%',
                      transition: {
                        duration: 0.5,
                        ease: ease.out,
                        delay: 0.25 + i * 0.05,
                      },
                    }}
                    exit={{
                      y: '-110%',
                      transition: {
                        duration: 0.3,
                        ease: ease.in,
                        delay: i * 0.03,
                      },
                    }}
                  >
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="block w-full text-left py-1"
                    >
                      <span
                        className="uppercase font-bold tracking-tight leading-[0.9] block transition-opacity duration-200 active:opacity-50"
                        style={{
                          fontFamily: 'var(--font-display), sans-serif',
                          fontSize: 'clamp(3rem, 14vw, 5.5rem)',
                        }}
                      >
                        {link.label}
                      </span>
                    </button>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: ease.out, delay: 0.45 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15 },
              }}
              className="shrink-0 px-6 pb-8 flex items-end justify-between"
            >
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest mb-0.5"
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Musab Aqeel
                </p>
                <p
                  className="text-[10px] uppercase tracking-widest"
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  hello@musabaqeel.com {/* UPDATE: real email */}
                </p>
              </div>
              <a
                href="mailto:hello@musabaqeel.com"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                style={{
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Get in touch
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
