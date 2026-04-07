import { ImageResponse } from 'next/og'
import { projects } from '@/lib/projects'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function ProjectOGImage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug)

  const title = project?.title ?? 'Project'
  const type = project?.type ?? ''
  const tags = project?.tags.slice(0, 4).join('  /  ') ?? ''

  return new ImageResponse(
    (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#d4ff00',
                transform: 'rotate(45deg)',
              }}
            />
            <span style={{ color: '#f0f0f0', fontSize: '18px', letterSpacing: '0.05em' }}>
              musabaqeel.com
            </span>
          </div>
          <span style={{ color: '#808080', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Case Study
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ color: '#808080', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {type}
          </span>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#f0f0f0',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#808080', fontSize: '16px', letterSpacing: '0.04em' }}>
            {tags}
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
