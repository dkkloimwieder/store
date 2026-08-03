import { expect, test } from 'vitest'
import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flush,
} from 'solid-js'

/**
 * Guards the resolve conditions in vitest.config.ts.
 *
 * solid-js@2 maps the bare `node` condition to an inert server build: effects
 * never run and memos compute exactly once. This package has no Solid JSX, so it
 * does not run vite-plugin-solid (which injects the browser/development
 * conditions itself) and has to set them by hand.
 *
 * Without them tests/derived.bench.ts silently benchmarks a signal write that
 * propagates to nothing — which measured ~5.5x faster than the real thing and
 * made Solid look like the second-fastest library in the comparison.
 */
test('the live client runtime is resolved, not the inert server build', () => {
  const effectRuns: Array<number> = []
  let memoComputes = 0

  createRoot((dispose) => {
    const [source, setSource] = createSignal(1, { ownedWrite: true })
    const doubled = createMemo(() => {
      memoComputes++
      return source() * 2
    })

    createEffect(
      () => doubled(),
      (value) => {
        effectRuns.push(value)
      },
    )

    setSource(2)
    flush()
    dispose()
  })

  // On the inert server build both of these are `[]` and `1`.
  expect(effectRuns).toEqual([4])
  expect(memoComputes).toBe(2)
})
