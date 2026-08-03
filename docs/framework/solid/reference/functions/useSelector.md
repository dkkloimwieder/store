---
id: useSelector
title: useSelector
---

# Function: useSelector()

```ts
function useSelector<TSource, TSelected>(
   source, 
   selector, 
options?): Accessor<TSelected>;
```

Defined in: [solid-store/src/useSelector.ts:62](https://github.com/TanStack/store/blob/main/packages/solid-store/src/useSelector.ts#L62)

Selects a slice of state from an atom or store and subscribes the component
to that selection.

This is the primary Solid read hook for TanStack Store. It returns a Solid
accessor so consumers can read the selected value reactively.

Omit the selector to subscribe to the whole value.

## Type Parameters

### TSource

`TSource`

### TSelected

`TSelected` = `NoInfer`\<`TSource`\>

## Parameters

### source

`SelectionSource`\<`TSource`\>

### selector

(`snapshot`) => `TSelected`

### options?

[`UseSelectorOptions`](../interfaces/UseSelectorOptions.md)\<`TSelected`\>

## Returns

`Accessor`\<`TSelected`\>

## Examples

```tsx
const count = useSelector(counterStore, (state) => state.count)

return <p>{count()}</p>
```

```tsx
const value = useSelector(countAtom)
```

## Remarks

Call this from a component body, or from inside a `createRoot`. The store
subscription is released through `onCleanup`, which does nothing when there is
no owner — so a `useSelector` created at module scope stays subscribed for the
lifetime of the process.

Reading the returned accessor from JSX, a memo or an effect's compute function
is tracked as usual. Reading it imperatively in the same synchronous tick as a
store write returns the previous value, because Solid 2 settles updates on a
microtask; pass `settleOnRead` if you need read-your-writes.
