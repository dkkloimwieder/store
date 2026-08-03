import { createSignal, flush, getObserver, getOwner, onCleanup } from "solid-js";

//#region src/useSelector.ts
function defaultCompare(a, b) {
	return a === b;
}
/**
* Selects a slice of state from an atom or store and subscribes the component
* to that selection.
*
* This is the primary Solid read hook for TanStack Store. It returns a Solid
* accessor so consumers can read the selected value reactively.
*
* Omit the selector to subscribe to the whole value.
*
* @example
* ```tsx
* const count = useSelector(counterStore, (state) => state.count)
*
* return <p>{count()}</p>
* ```
*
* @example
* ```tsx
* const value = useSelector(countAtom)
* ```
*
* @remarks
* Call this from a component body, or from inside a `createRoot`. The store
* subscription is released through `onCleanup`, which does nothing when there is
* no owner — so a `useSelector` created at module scope stays subscribed for the
* lifetime of the process.
*
* Reading the returned accessor from JSX, a memo or an effect's compute function
* is tracked as usual. Reading it imperatively in the same synchronous tick as a
* store write returns the previous value, because Solid 2 settles updates on a
* microtask; pass `settleOnRead` if you need read-your-writes.
*/
function useSelector(source, selector = (s) => s, options) {
	const compare = options?.compare ?? defaultCompare;
	const [signal, setSignal] = createSignal(selector(source.get()), {
		equals: compare,
		ownedWrite: true,
		name: "store/useSelector"
	});
	const unsubscribe = source.subscribe((snapshot) => {
		setSignal(() => selector(snapshot));
	}).unsubscribe;
	onCleanup(() => {
		unsubscribe();
	});
	if (!options?.settleOnRead) return signal;
	return () => {
		if (getObserver() === null && getOwner() === null) flush();
		return signal();
	};
}

//#endregion
export { useSelector };
//# sourceMappingURL=useSelector.js.map