import { defineConfig } from 'vitest/config'
import packageJson from './package.json'

export default defineConfig({
  // solid-js@2 maps the bare `node` condition to an inert server build where
  // effects never run and memos compute exactly once. This package has no Solid
  // JSX so it does not run vite-plugin-solid (which would inject these itself),
  // and without them tests/derived.bench.ts would benchmark a signal write that
  // propagates to nothing. Pinned by tests/solid-runtime.test.ts.
  resolve: { conditions: ['browser', 'development'] },
  ssr: { resolve: { conditions: ['browser', 'development'] } },
  test: {
    name: packageJson.name,
    server: { deps: { inline: [/solid-js/, /@solidjs\/signals/] } },
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    coverage: { enabled: true, provider: 'istanbul', include: ['src/**/*'] },
    typecheck: { enabled: true },
  },
})
