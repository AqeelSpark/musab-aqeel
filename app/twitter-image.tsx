import { ImageResponse } from 'next/og'
import { SITE_DOMAIN, SITE_NAME, SITE_SHORT_TITLE } from '@/lib/config'

export const runtime = 'edge'
export const alt = SITE_SHORT_TITLE
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0d0d0d',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Accent top bar */}
      <div
        style={{ height: '3px', backgroundColor: '#d4ff00', flexShrink: 0 }}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 72px 60px',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#d4ff00',
                transform: 'rotate(45deg)',
              }}
            />
            <span
              style={{
                color: '#555',
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {SITE_DOMAIN}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#d4ff00',
              }}
            />
            <span
              style={{
                color: '#d4ff00',
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Available for work
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '82px',
              fontWeight: 700,
              color: '#f0f0f0',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {SITE_NAME}.
          </span>
          <span
            style={{
              fontSize: '82px',
              fontWeight: 700,
              color: '#1e1e1e',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            Developer.
          </span>
          <span
            style={{
              fontSize: '82px',
              fontWeight: 700,
              color: '#1e1e1e',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            Architect. Operator.
          </span>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: '#3a3a3a',
              fontSize: '18px',
              lineHeight: 1.5,
              maxWidth: '540px',
            }}
          >
            Complete builds from design to deployment in weeks, not months.
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['Full Stack', 'Next.js', 'TypeScript'] as const).map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '5px 14px',
                  border: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: '#3a3a3a',
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  )
}
