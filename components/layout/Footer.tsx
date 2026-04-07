export default function Footer() {
  return (
    <footer
      className="py-8 px-6 md:px-12 lg:px-24"
      style={{ borderTop: '1px solid var(--color-border-sub)' }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p
          className="text-xs"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            color: 'var(--color-text-tertiary)',
          }}
        >
          &copy; {new Date().getFullYear()} Musab Aqeel. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/musabaqeel" // {/* UPDATE: real URL */}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors duration-200 hover:text-[var(--color-text-primary)]"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              color: 'var(--color-text-tertiary)',
            }}
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/musabaqeel" // {/* UPDATE: real URL */}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors duration-200 hover:text-[var(--color-text-primary)]"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              color: 'var(--color-text-tertiary)',
            }}
          >
            LinkedIn
          </a>
          <a
            href="https://twitter.com/musabaqeel" // {/* UPDATE: real URL */}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors duration-200 hover:text-[var(--color-text-primary)]"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              color: 'var(--color-text-tertiary)',
            }}
          >
            X / Twitter
          </a>
        </div>
      </div>
    </footer>
  )
}
