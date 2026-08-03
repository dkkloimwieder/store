/* istanbul ignore file -- @preserve */
import { bench, describe } from 'vitest'
import { shallowRef, computed as vueComputed, watchEffect } from 'vue'
import { createEffect, createMemo, createRoot, createSignal, flush } from 'solid-js'
import {
  computed as preactComputed,
  effect as preactEffect,
  signal as preactSignal,
} from '@preact/signals'
import {
  computed as angularComputed,
  signal as angularSignal,
} from '@angular/core'
import { createWatch } from '@angular/core/primitives/signals'
import { createStore } from '../src'

function noop(val: any) {
  val
}

/**
 *         A
 *        / \
 *       B   C
 *      / \  |
 *     D  E  F
 *      \ / |
 *       \ /
 *        G
 */
describe('Derived', () => {
  bench('TanStack', () => {
    const a = createStore(1)
    const b = createStore(() => a.state)
    const c = createStore(() => a.state)
    const d = createStore(() => b.state)
    const e = createStore(() => b.state)
    const f = createStore(() => c.state)
    const g = createStore(() => d.state + e.state + f.state)

    g.subscribe(() => noop(g.state))

    a.setState(() => 2)
  })

  bench('Vue', () => {
    const a = shallowRef(1)
    const b = vueComputed(() => a.value)
    const c = vueComputed(() => a.value)
    const d = vueComputed(() => b.value)
    const e = vueComputed(() => b.value)
    const f = vueComputed(() => c.value)
    const g = vueComputed(() => d.value + e.value + f.value)

    watchEffect(() => {
      noop(g.value)
    })

    a.value = 2
  })

  // Solid 2 needs three things the other adapters here do not, and all three are
  // load-bearing rather than ceremony:
  //  - an owner, because an unowned memo that has already computed recomputes
  //    against pending values while its sources still read committed ones (it tears)
  //  - `ownedWrite`, because `setA` runs inside the root's owned scope and a plain
  //    signal write there is a dev-time throw (REACTIVE_WRITE_IN_OWNED_SCOPE)
  //  - an explicit `flush()`, because updates settle on a microtask; without it the
  //    iteration would measure a signal write that propagates to nothing
  bench('Solid', () => {
    createRoot((dispose) => {
      const [a, setA] = createSignal(1, { ownedWrite: true })
      const b = createMemo(() => a())
      const c = createMemo(() => a())
      const d = createMemo(() => b())
      const e = createMemo(() => b())
      const f = createMemo(() => c())
      const g = createMemo(() => d() + e() + f())

      createEffect(
        () => g(),
        (value) => {
          noop(value)
        },
      )

      setA(2)
      flush()
      dispose()
    })
  })

  bench('Preact', () => {
    const a = preactSignal(1)
    const b = preactComputed(() => a.value)
    const c = preactComputed(() => a.value)
    const d = preactComputed(() => b.value)
    const e = preactComputed(() => b.value)
    const f = preactComputed(() => c.value)
    const g = preactComputed(() => d.value + e.value + f.value)

    preactEffect(() => {
      noop(g.value)
    })

    a.value = 2
  })

  bench('Angular', () => {
    const a = angularSignal(1)
    const b = angularComputed(() => a())
    const c = angularComputed(() => a())
    const d = angularComputed(() => b())
    const e = angularComputed(() => b())
    const f = angularComputed(() => c())
    const g = angularComputed(() => d() + e() + f())

    createWatch(
      () => {
        console.log(g())
      },
      () => {},
      false,
    )

    a.set(2)
  })
})
