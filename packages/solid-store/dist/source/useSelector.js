import { createSignal, flush, getObserver, getOwner, onCleanup } from 'solid-js';
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
export function useSelector(source, selector = (s) => s, options) {
    const compare = options?.compare ?? defaultCompare;
    const [signal, setSignal] = createSignal(
    // createSignal's value overload takes Exclude<T, Function>, since a bare
    // function argument is reserved for the compute form. The bare `Function`
    // here mirrors Solid's own signature — narrowing it would stop matching.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    selector(source.get()), {
        equals: compare,
        // The producer sits outside Solid's ownership: @tanstack/store notifies
        // synchronously from set(), so this callback inherits whatever scope the
        // caller was in. If that is a component body or an effect, a plain write
        // here would throw REACTIVE_WRITE_IN_OWNED_SCOPE.
        ownedWrite: true,
        name: 'store/useSelector',
    });
    const unsubscribe = source.subscribe((snapshot) => {
        setSignal(() => selector(snapshot));
    }).unsubscribe;
    onCleanup(() => {
        unsubscribe();
    });
    if (!options?.settleOnRead)
        return signal;
    return () => {
        // Both halves of this guard are load-bearing. Flushing merely because there
        // is no observer drains the pending queue into a mounting component's owned
        // scope, where otherwise-legal writes hard-throw.
        if (getObserver() === null && getOwner() === null)
            flush();
        return signal();
    };
}
//# sourceMappingURL=useSelector.js.map