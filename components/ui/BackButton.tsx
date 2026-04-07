'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm mb-8"
      style={{
        fontFamily: 'var(--font-body), sans-serif',
        color: 'var(--color-text-secondary)',
      }}
    >
      ← Back
    </button>
  )
}
