import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/config'
import { getProjectSlugs } from '@/lib/projects'

describe('sitemap', () => {
  it('returns stable route metadata without fabricated timestamps', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toEqual([
      SITE_URL,
      `${SITE_URL}/work`,
      ...getProjectSlugs().map((slug) => `${SITE_URL}/work/${slug}`),
    ])

    for (const entry of entries) {
      expect(entry).not.toHaveProperty('lastModified')
    }
  })
})