import { ImageResponse } from 'next/og'
import { SITE_DOMAIN, SITE_NAME } from '@/lib/config'
import { projects } from '@/lib/projects'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Project case study by Musab Aqeel'

export default async function ProjectOGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)

  const title = project?.title ?? 'Project'
  const type = project?.type ?? 'Case Study'
  const tagList = project?.tags?.slice(0, 4) ?? []

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
          <span
            style={{
              color: '#333',
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Case Study
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span
            style={{
              color: '#d4ff00',
              fontSize: '13px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {type}
          </span>
          <span
            style={{
              fontSize: '74px',
              fontWeight: 700,
              color: '#f0f0f0',
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
            }}
          >
            {title}.
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
          <div style={{ display: 'flex', gap: '8px' }}>
            {tagList.map((tag) => (
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
                  }}
                >
                  {tag}
                </span>
              </div>
            ))}
          </div>
          <span
            style={{
              color: '#2e2e2e',
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {SITE_NAME}
          </span>
        </div>
      </div>
    </div>,
    { ...size },
  )
}
