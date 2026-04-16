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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#141414',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            color: '#f0f0f0',
            fontSize: '18px',
            letterSpacing: '0.05em',
          }}
        >
          {SITE_DOMAIN}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#f0f0f0',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {SITE_NAME}.
        </span>
        <span
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#808080',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Developer. Architect. Operator.
        </span>
      </div>

      <span
        style={{
          color: '#808080',
          fontSize: '20px',
          maxWidth: '600px',
          lineHeight: 1.5,
        }}
      >
        Complete builds from design to deployment in weeks, not months.
      </span>
    </div>,
    { ...size },
  )
}
