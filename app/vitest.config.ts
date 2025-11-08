import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/.wasp/**'],
  },
  resolve: {
    alias: {
      'wasp/server': path.resolve(process.cwd(), 'test/mocks/waspServer.ts'),
    },
  },
})
