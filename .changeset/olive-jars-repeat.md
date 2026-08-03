---
'@tanstack/solid-store': minor
---

Migrate to SolidJS 2. This is a breaking change.

**Imperative reads are no longer synchronous.** Solid 2 settles every update on a
microtask, so a selector read in the same synchronous tick as a store write returns the
previous value:

```tsx
const count = useSelector(store, (state) => state.count)

store.setState((state) => ({ ...state, count: 1 }))
count() // → 0, not 1
```

Reads from JSX, memos and effect compute functions are unaffected — they re-run when the
graph settles — so components need no changes. This shows up in imperative reads, which
in practice means tests and the occasional event handler. Awaiting one microtask is
enough, or pass the new `settleOnRead` option to opt a selector back into
read-your-writes:

```tsx
useSelector(store, (state) => state.count, { settleOnRead: true })
```

**`@solidjs/web` is now a required peer dependency** alongside `solid-js`. Solid 2 moved
the DOM runtime out of `solid-js/web` into its own package; install both and keep them on
the same version.

**Solid 1 is no longer supported.** The peer range is `>=2.0.0-beta.30 <3.0.0`. There is
no SolidStart release built on Solid 2 yet, so SolidStart apps are not currently
supported.

`useSelector`, `useAtom`, `useStore`, `_useStore` and `createStoreContext` keep their
signatures — `UseSelectorOptions` only gains the optional `settleOnRead`. See the new
Solid 2 Guide for the full timing contract.
