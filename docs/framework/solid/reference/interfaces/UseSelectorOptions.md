---
id: UseSelectorOptions
title: UseSelectorOptions
---

# Interface: UseSelectorOptions\<TSelected\>

Defined in: [solid-store/src/useSelector.ts:4](https://github.com/TanStack/store/blob/main/packages/solid-store/src/useSelector.ts#L4)

## Type Parameters

### TSelected

`TSelected`

## Properties

### compare()?

```ts
optional compare: (a, b) => boolean;
```

Defined in: [solid-store/src/useSelector.ts:5](https://github.com/TanStack/store/blob/main/packages/solid-store/src/useSelector.ts#L5)

#### Parameters

##### a

`TSelected`

##### b

`TSelected`

#### Returns

`boolean`

***

### settleOnRead?

```ts
optional settleOnRead: boolean;
```

Defined in: [solid-store/src/useSelector.ts:16](https://github.com/TanStack/store/blob/main/packages/solid-store/src/useSelector.ts#L16)

Settle the reactive graph when this accessor is read imperatively, so that a
read taken immediately after a store write observes the new value.

Off by default. Solid 2 defers every update to a microtask, so a read in the
same synchronous tick as a write returns the previous value. Reads from JSX,
memos and effects are unaffected either way — they re-run when the graph
settles — so this only matters for imperative reads, and it costs a flush per
untracked, unowned read.
