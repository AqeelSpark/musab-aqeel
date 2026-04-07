'use client'

import Link from 'next/link'
import SplitText from '@/components/ui/SplitText'
import RevealText from '@/components/ui/RevealText'
import ProjectCard from '@/components/work/ProjectCard'
import { projects } from '@/lib/projects'

const HOME_PROJECTS = projects.slice(0, 3)

export default function Work() {
  const featured = HOME_PROJECTS[0]
  const rest = HOME_PROJECTS.slice(1)

  return (
    <section id="work" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <RevealText>
              <span className="section-label block mb-4">
                {'// 02 Work'}
              </span>
            </RevealText>
            <SplitText
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              Selected projects
            </SplitText>
          </div>
          <RevealText delay={0.1}>
            <Link
              href="/work"
              className="hidden md:flex items-center gap-2 text-sm"
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                color: 'var(--color-text-secondary)',
              }}
            >
              View all <span>→</span>
            </Link>
          </RevealText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RevealText className="md:col-span-2" delay={0.05}>
            <ProjectCard project={featured} />
          </RevealText>

          {rest.map((project, i) => (
            <RevealText
              key={project.slug}
              delay={0.1 + i * 0.06}
            >
              <ProjectCard project={project} />
            </RevealText>
          ))}
        </div>

        {/* Mobile-only bottom button */}
        <RevealText delay={0.2} className="md:hidden mt-8">
          <Link href="/work" className="btn-outline w-full text-center">
            View all projects
          </Link>
        </RevealText>
      </div>
    </section>
  )
}
