import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const srcRoot = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': srcRoot,
    },
  },
  test: {
    environment: 'node',
    // Unit/integration tests only. Keep e2e under Playwright while allowing
    // both .test and .spec naming for non-e2e suites.
    include: ['tests/**/*.test.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
  },
})
