import { describe, expect, it, vi } from 'vitest'
import { createEffect } from 'solid-js'
import { render, renderHook } from '@solidjs/testing-library'
import { createAtom, createStore } from '@tanstack/store'
import { useSelector } from '../src/index'
import { createEffectTestRoot, settle } from './utils/reactive'

/**
 * Contracts for the Solid 2 reactivity model, pinned so that a regression shows
 * up as a failing assertion rather than as a subtly stale value in a consumer's
 * app. None of these are caught by the type system.
 */
describe('Solid 2 semantics', () => {
  it('does not throw when the producer writes from inside a component body', () => {
    // The regression test for `ownedWrite: true`. @tanstack/store notifies
    // synchronously from set(), so if a store is written while a component is
    // constructing, useSelector's setter inherits that owned scope. Without
    // ownedWrite this is a hard REACTIVE_WRITE_IN_OWNED_SCOPE throw.
    const store = createStore(0)
    const selected = renderHook(() => useSelector(store)).result

    expect(() =>
      render(() => {
        // Reading and writing the same store during another component's setup.
        useSelector(store)
        store.setState((prev) => prev + 1)
        return <div>ok</div>
      }),
    ).not.toThrow()

    settle()
    expect(selected()).toBe(1)
  })

  it('coalesces several writes in one tick into a single settled update', () => {
    const store = createStore(0)
    const { result } = renderHook(() => useSelector(store))
    const observed = vi.fn()

    const { dispose } = createEffectTestRoot(() => {
      createEffect(
        () => result(),
        (value) => {
          observed(value)
        },
      )
    })

    for (let i = 0; i < 5; i++) {
      store.setState((prev) => prev + 1)
    }
    settle()

    expect(result()).toBe(5)
    // One effect run for five writes, and the intermediate 1..4 never surface.
    // The effect half does not run at creation, so this is its first delivery.
    expect(observed.mock.calls.flat()).toEqual([5])
    dispose()
  })

  it('lets consecutive functional updates in one tick see each other', () => {
    // Solid 2's functional setter receives the PENDING value, even though plain
    // reads still return the committed one. That asymmetry is deliberate and
    // load-bearing for read-modify-write handlers.
    const atom = createAtom(0)
    const { result } = renderHook(() => useSelector(atom))

    atom.set((prev) => prev + 1)
    atom.set((prev) => prev + 1)
    settle()

    expect(result()).toBe(2)
  })

  it('leaves an imperative same-tick read stale', () => {
    // The documented contract, asserted explicitly so that a change which makes
    // reads synchronous again is caught rather than silently welcomed.
    const store = createStore(0)
    const { result } = renderHook(() => useSelector(store))

    store.setState(() => 1)
    expect(result()).toBe(0)

    settle()
    expect(result()).toBe(1)
  })

  it('settles on its own after one awaited microtask', async () => {
    // The staleness window is exactly the synchronous tick of the write: the
    // write itself arms a queueMicrotask(flush).
    const store = createStore(0)
    const { result } = renderHook(() => useSelector(store))

    store.setState(() => 1)
    await Promise.resolve()

    expect(result()).toBe(1)
  })

  it('gives read-your-writes when settleOnRead is enabled', () => {
    const store = createStore(0)
    const { result } = renderHook(() =>
      useSelector(store, (state) => state, { settleOnRead: true }),
    )

    store.setState(() => 1)
    // This test must never gain a settle() between the write and the read.
    expect(result()).toBe(1)
  })

  it('stops writing once its owner is disposed, and tolerates double dispose', () => {
    const store = createStore(0)
    const { dispose, value: selected } = createEffectTestRoot(() =>
      useSelector(store),
    )

    store.setState(() => 1)
    settle()
    expect(selected()).toBe(1)

    dispose()

    store.setState(() => 2)
    settle()
    expect(selected()).toBe(1)

    // Solid 2 nested roots are parent-owned, so double dispose is reachable.
    expect(() => dispose()).not.toThrow()
  })
})
