import { describe, expect, it, vi } from 'vitest'
import { render } from '@solidjs/testing-library'
import { createAtom, createStore } from '@tanstack/store'
import { useSelector } from '../src/index'
import { settle } from './utils/reactive'

function captureWarnings(run: () => void): Array<string> {
  const seen: Array<string> = []
  const warn = vi
    .spyOn(console, 'warn')
    .mockImplementation((...args) => void seen.push(args.join(' ')))
  try {
    run()
  } finally {
    warn.mockRestore()
  }
  return seen
}

/**
 * `useSelector` captures its selector once, at construction. That has always been
 * true, but Solid 2's dev build now reports the case where it matters, and these
 * tests pin both halves of that: the documented pattern stays quiet, and the
 * pattern that is actually broken gets a diagnostic pointing at the component.
 */
describe('selector capture semantics', () => {
  it('stays diagnostic-free when the selector closes over a static prop', () => {
    // This is the shape used by the `simple` example and by the Quick Start doc.
    const store = createStore({ cats: 0, dogs: 0 })

    const Display = (props: { animals: 'cats' | 'dogs' }) => {
      const count = useSelector(store, (state) => state[props.animals])
      return <span>{count()}</span>
    }

    const warnings = captureWarnings(() => {
      const { getByText } = render(() => <Display animals="dogs" />)
      expect(getByText('0')).toBeInTheDocument()

      store.setState((prev) => ({ ...prev, dogs: prev.dogs + 1 }))
      settle()
      expect(getByText('1')).toBeInTheDocument()
    })

    // Nothing reactive is read: a static JSX attribute is a plain value, not a
    // getter, so there is no untracked reactive read to report.
    expect(warnings).toEqual([])
  })

  it('goes stale and warns when the selector closes over a dynamic prop', () => {
    const store = createStore({ cats: 41, dogs: 7 })
    const which = createAtom<'cats' | 'dogs'>('dogs')

    const Display = (props: { animals: 'cats' | 'dogs' }) => {
      const count = useSelector(store, (state) => state[props.animals])
      return <span>{count()}</span>
    }

    const Parent = () => {
      const animals = useSelector(which)
      return <Display animals={animals()} />
    }

    const warnings = captureWarnings(() => {
      const { getByText } = render(() => <Parent />)
      expect(getByText('7')).toBeInTheDocument()

      which.set('cats')
      settle()

      // Still 7, not 41: the selector was captured at construction and never
      // re-read `props.animals`.
      expect(getByText('7')).toBeInTheDocument()
    })

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('[STRICT_READ_UNTRACKED]')
    expect(warnings[0]).toContain('<Display>')
  })
})
