'use client'

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import SplitText from '@/components/ui/SplitText'
import RevealText from '@/components/ui/RevealText'
import MagneticButton from '@/components/ui/MagneticButton'
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from '@/lib/config'
import type { ContactFormStatus, ContactPayload } from '@/types'

const INPUT_STYLE = {
  backgroundColor: 'var(--color-surface-up)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
} as const

const LABEL_STYLE = { color: 'var(--color-text-tertiary)' } as const

const BUDGET_OPTIONS = [
  'Under $1k',
  '$1k - $5k',
  '$5k - $15k',
  '$15k+',
  "Let's discuss",
]

const PROJECT_TYPES = [
  'Full Stack Build',
  'Landing Page',
  'Design System',
  'Consultation',
  'Other',
]

const EMPTY_CONTACT_FORM: ContactPayload = {
  name: '',
  email: '',
  budget: '',
  projectType: '',
  message: '',
}

const SelectArrow = () => (
  <span
    className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
    style={{ color: 'var(--color-text-tertiary)' }}
    aria-hidden="true"
  >
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

export default function Contact() {
  const [status, setStatus] = useState<ContactFormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState<ContactPayload>(EMPTY_CONTACT_FORM)

  useEffect(() => {
    if (status !== 'sent') return
    const t = setTimeout(() => setStatus('idle'), 5000)
    return () => clearTimeout(t)
  }, [status])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('sent')
        setForm({ ...EMPTY_CONTACT_FORM })
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(
          typeof data.error === 'string'
            ? data.error
            : 'Something went wrong. Try emailing me directly.',
        )
        setStatus('error')
      }
    } catch {
      setErrorMessage('Something went wrong. Try emailing me directly.')
      setStatus('error')
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const labelClass = 'block mb-1.5 text-xs uppercase tracking-widest font-mono'
  const inputClass =
    'w-full pl-4 pr-4 py-3 text-sm rounded-[2px] outline-none transition-colors duration-200 font-body'

  return (
    <section id="contact" className="px-6 py-24 md:px-12 md:py-32 lg:px-24">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left column */}
        <div>
          <RevealText>
            <span className="section-label mb-4 block">{'// 05 Contact'}</span>
          </RevealText>

          <SplitText
            as="h2"
            className="font-display mb-8 text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
          >
            Start a project
          </SplitText>

          <RevealText delay={0.05}>
            <div
              className="mb-10 pl-4"
              style={{ borderLeft: '2px solid var(--color-border-sub)' }}
            >
              <p
                className="font-body text-sm leading-relaxed"
                style={{
                  fontWeight: 300,
                  color: 'var(--color-text-secondary)',
                }}
              >
                I price based on what the project is worth to your business, not
                how many hours I spend on it. Fast delivery is a feature, not a
                discount. Clients who need something shipped in days pay
                accordingly because that speed has real business value. If you
                need the cheapest option, I am not it. If you need something
                built properly, and fast, let&apos;s talk.
              </p>
            </div>
          </RevealText>

          <RevealText delay={0.1}>
            <a
              href={CONTACT_EMAIL_HREF}
              className="group font-body relative mb-6 inline-block text-lg font-medium"
            >
              {CONTACT_EMAIL}
              <span
                className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  transitionTimingFunction: 'var(--ease-out)',
                }}
              />
            </a>
          </RevealText>

          <RevealText delay={0.15}>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
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
                Available for new projects
              </span>
            </div>
            <p
              className="font-mono text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Response within 24 hours.
            </p>
          </RevealText>
        </div>

        {/* Right column - form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-busy={status === 'sending'}
          >
            <RevealText delay={0.05}>
              <div className="form-field">
                <label
                  htmlFor="contact-name"
                  className={labelClass}
                  style={LABEL_STYLE}
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                  style={INPUT_STYLE}
                />
              </div>
            </RevealText>

            <RevealText delay={0.1}>
              <div className="form-field">
                <label
                  htmlFor="contact-email"
                  className={labelClass}
                  style={LABEL_STYLE}
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                  style={INPUT_STYLE}
                />
              </div>
            </RevealText>

            <RevealText delay={0.15}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="form-field">
                  <label
                    htmlFor="contact-budget"
                    className={labelClass}
                    style={LABEL_STYLE}
                  >
                    Budget
                  </label>
                  <div className="relative">
                    <select
                      id="contact-budget"
                      name="budget"
                      required
                      value={form.budget}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none pr-10`}
                      style={{
                        ...INPUT_STYLE,
                        color: form.budget
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-tertiary)',
                      }}
                    >
                      <option value="" disabled>
                        Select range
                      </option>
                      {BUDGET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div className="form-field">
                  <label
                    htmlFor="contact-project-type"
                    className={labelClass}
                    style={LABEL_STYLE}
                  >
                    Project type
                  </label>
                  <div className="relative">
                    <select
                      id="contact-project-type"
                      name="projectType"
                      required
                      value={form.projectType}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none pr-10`}
                      style={{
                        ...INPUT_STYLE,
                        color: form.projectType
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-tertiary)',
                      }}
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      {PROJECT_TYPES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
              </div>
            </RevealText>

            <RevealText delay={0.2}>
              <div className="form-field">
                <label
                  htmlFor="contact-message"
                  className={labelClass}
                  style={LABEL_STYLE}
                >
                  Project brief
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project"
                  rows={4}
                  className={`${inputClass} resize-none`}
                  style={INPUT_STYLE}
                />
              </div>
            </RevealText>

            <RevealText delay={0.25}>
              <MagneticButton className="btn-outline mt-2 w-full" type="submit">
                {status === 'sending'
                  ? 'Sending...'
                  : status === 'sent'
                    ? 'Sent ✓'
                    : 'Send message'}
              </MagneticButton>

              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mt-4 text-center font-mono text-xs"
              >
                {status === 'sent' && (
                  <p style={{ color: 'var(--color-accent)' }}>
                    Message received. I will be in touch within 24 hours.
                  </p>
                )}
                {status === 'error' && (
                  <p style={{ color: 'var(--color-error)' }}>
                    {errorMessage}
                  </p>
                )}
              </div>
            </RevealText>
          </form>
        </div>
      </div>
    </section>
  )
}
