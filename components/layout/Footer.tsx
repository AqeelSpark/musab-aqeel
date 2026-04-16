import { SITE_NAME, SOCIAL_LINKS } from '@/lib/config'

export default function Footer() {
  return (
    <footer
      className="px-6 py-8 md:px-12 lg:px-24"
      style={{ borderTop: '1px solid var(--color-border-sub)' }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 md:flex-row">
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>

        <div className="flex items-center">
          {SOCIAL_LINKS.map(({ label, href }, i) => (
            <div key={label} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-4 block h-3 w-px"
                  style={{ backgroundColor: 'var(--color-accent-border)' }}
                />
              )}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-(--color-text-tertiary) transition-colors duration-200 hover:text-(--color-text-primary)"
              >
                {label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
