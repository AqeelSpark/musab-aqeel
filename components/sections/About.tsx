'use client'

import SplitText from '@/components/ui/SplitText'
import RevealText from '@/components/ui/RevealText'

const CODE_BLOCK = `const engagement = {
  scope:     'design to deployment',
  delivery:  'weeks, not months',
  ownership: 'single operator, zero handoffs',
  stack:     'matched to the problem',
  pricing:   'project value, not hours',
  revisions: 'until it ships right',
  support:   'post-launch included',
}`

// COPY
const DETAILS = [
  'Remote / Worldwide',
  'Full stack — design to deployment',
  'Response within 24 hours',
]

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div>
          <RevealText>
            <span className="section-label block mb-6">
              {'// 01 About'}
            </span>
          </RevealText>

          <SplitText
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-8"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            Built on systems. Delivered fast.
          </SplitText>

          <RevealText delay={0.05}>
            <p
              className="text-lg leading-relaxed mb-10 max-w-[520px]"
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontWeight: 300,
                color: 'var(--color-text-secondary)',
              }}
            >
              {/* COPY */}
              Close to a decade of building has produced something more useful than experience: systems.
              Reusable architectures, hardened workflows, and an AI stack that compresses timelines
              from months to weeks without touching quality. I take projects from zero to deployed,
              across any stack, and I ship them fast.
            </p>
          </RevealText>

          <div className="flex flex-col">
            {DETAILS.map((detail, i) => (
              <RevealText key={detail} delay={0.1 + i * 0.05}>
                <div
                  className="flex items-center gap-3 py-3"
                  style={{ borderTop: '1px solid var(--color-border-sub)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {detail}
                  </span>
                </div>
              </RevealText>
            ))}
          </div>
        </div>

        <RevealText delay={0.15}>
          <div
            className="rounded-[4px] overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface-up)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border-sub)' }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-border-up)' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-border-up)' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-border-up)' }} />
            </div>
            <pre className="p-5 overflow-x-auto">
              <code
                className="text-[13px] leading-[1.7]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {CODE_BLOCK.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.includes(':') ? (
                      <>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{line.split(':')[0]}</span>
                        <span style={{ color: 'var(--color-text-tertiary)' }}>:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>{line.split(':').slice(1).join(':')}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-text-secondary)' }}>{line}</span>
                    )}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </RevealText>
      </div>
    </section>
  )
}
