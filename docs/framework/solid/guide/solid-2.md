---
title: Solid 2 Guide
id: solid-2
---

`@tanstack/solid-store` targets **SolidJS 2 only**. Solid 1 is not supported.

```json
{
  "dependencies": {
    "solid-js": "2.0.0-beta.30",
    "@solidjs/web": "2.0.0-beta.30"
  },
  "devDependencies": {
    "vite-plugin-solid": "3.0.0-next.21"
  }
}
```

`@solidjs/web` is a **peer dependency**, not a transitive one — Solid 2 moved the DOM
runtime out of `solid-js/web` into its own package, and two copies of it in one graph
will break rendering. Your `tsconfig.json` needs to point JSX at it too:

```jsonc
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@solidjs/web"
  }
}
```

## The timing contract

This is the one behavioural change that will affect existing code.

Solid 2 settles every update on a microtask. A selector read in the **same synchronous
tick** as a store write returns the previous value:

```tsx
const count = useSelector(store, (state) => state.count)

store.setState((state) => ({ ...state, count: 1 }))
count() // → 0, not 1
```

**Reads from JSX, memos and effect compute functions need nothing.** They re-run when
the graph settles, so components are unaffected — this only shows up in imperative
reads, which in practice means tests and the occasional event handler.

The stale window is exactly the synchronous tick of the write. The write itself
schedules the settle, so awaiting a single microtask is enough:

```tsx
store.setState((state) => ({ ...state, count: 1 }))
await Promise.resolve()
count() // → 1
```

### `settleOnRead`

If you want read-your-writes back for a particular selector, opt into it:

```tsx
const count = useSelector(store, (state) => state.count, { settleOnRead: true })

store.setState((state) => ({ ...state, count: 1 }))
count() // → 1
```

It is off by default because it costs a settle on every read taken outside the reactive
graph. When enabled, the settle happens only when there is **no tracking observer and
no owner** — a genuinely imperative read. Reads during component setup are owned, so
they still return the last committed value; don't rely on write-then-read inside a
component body.

### Testing

`flush()` from `solid-js` settles the graph synchronously, which is usually what a test
wants:

```tsx
import { flush } from 'solid-js'

store.setState((state) => ({ ...state, count: 1 }))
flush()
expect(count()).toBe(1)
```

Two rules worth knowing: `flush()` **throws** if called inside `onSettled` or
`createTrackedEffect`, and from an ordinary effect callback it is a silent no-op rather
than an error. Also note that `fireEvent` does not flush — un-flushed read-modify-write
clicks *collapse* into one, so you get wrong values rather than merely stale ones.

## Why the adapter sets `ownedWrite`

`@tanstack/store` notifies its subscribers **synchronously** from `set()`. That means
`useSelector`'s subscription callback runs in whatever scope the caller was in — and if
a store happens to be written while a component is constructing, the resulting signal
write inherits that component's owned scope, which Solid 2 rejects with
`REACTIVE_WRITE_IN_OWNED_SCOPE`.

The adapter creates its backing signal with `ownedWrite: true` for exactly this reason.
You do not need to do anything; it is mentioned here because the same consideration
applies if you bridge another external store into Solid yourself.

## Ownership

Call `useSelector` from a component body, or from inside a `createRoot`. It releases
its store subscription through `onCleanup`, and `onCleanup` does nothing when there is
no owner — so a `useSelector` created at module scope stays subscribed for the lifetime
of the process.

This is not new in Solid 2; it was equally true under Solid 1. It is worth stating
because Solid 2's `runWithOwner(null, fn)` means "detach" rather than failing, so an
unowned call is quiet rather than loud.

## Context

A Solid 2 context object **is** its own provider — `Context.Provider` no longer exists.
This is internal to `createStoreContext`, so `StoreProvider` is unchanged from the
consumer's side:

```tsx
const { StoreProvider, useStoreContext } = createStoreContext<{
  countAtom: Atom<number>
}>()

<StoreProvider value={{ countAtom }}>
  <App />
</StoreProvider>
```

Calling `useStoreContext()` outside its provider still throws
`Missing StoreProvider for StoreContext`.

## `[STRICT_READ_UNTRACKED]`

Solid 2's dev build warns when a reactive value is read directly in an untracked scope:

```
[STRICT_READ_UNTRACKED] Reactive value read directly in <Display> will not update.
Move it into a tracking scope (JSX, a memo, or an effect's compute function).
```

This is **dev-build only** — there is no production cost — and it is worth reading
rather than silencing, because it discriminates between a real bug and a false alarm.

`useSelector` captures its selector once, when it is called. A selector that closes over
a **static** prop is fine, and produces no warning:

```tsx
// No warning. `animals` is a static attribute, so nothing reactive is read.
const Display = (props: { animals: 'cats' | 'dogs' }) => {
  const count = useSelector(store, (state) => state[props.animals])
  return <span>{count()}</span>
}

<Display animals="dogs" />
```

A selector that closes over a **dynamic** prop is a genuine bug, and this is what the
warning is pointing at — the selector was captured on the first render and will never
observe the new prop:

```tsx
// Warns, and the value really is stale.
<Display animals={selectedAnimal()} />
```

The fix is to make the reactive input part of the selection rather than closing over it
— select the whole slice and index it in JSX, where the read is tracked:

```tsx
const counts = useSelector(store, (state) => state)
return <span>{counts()[props.animals]}</span>
```

Because the diagnostic tells these two cases apart, a blanket `untrack()` would hide the
only one worth catching.

## A note on Solid stores as data

A Solid store proxy's identity never changes — not even when a setter replaces the whole
array, since the update merges into the same proxy. Anything that memoizes on identity
will therefore never see an update. If you need to hand a Solid store's contents to
something that compares by identity, project it through a copy:

```tsx
const items = createMemo(() => rows.map((row) => ({ ...row })))
```

The copy is load-bearing twice over: reading every property makes the memo invalidate on
nested mutation, and returning a new array gives the consumer an identity change to
observe.
