import type { Accessor } from 'solid-js';
export interface UseSelectorOptions<TSelected> {
    compare?: (a: TSelected, b: TSelected) => boolean;
    /**
     * Settle the reactive graph when this accessor is read imperatively, so that a
     * read taken immediately after a store write observes the new value.
     *
     * Off by default. Solid 2 defers every update to a microtask, so a read in the
     * same synchronous tick as a write returns the previous value. Reads from JSX,
     * memos and effects are unaffected either way — they re-run when the graph
     * settles — so this only matters for imperative reads, and it costs a flush per
     * untracked, unowned read.
     */
    settleOnRead?: boolean;
}
type SelectionSource<T> = {
    get: () => T;
    subscribe: (listener: (value: T) => void) => {
        unsubscribe: () => void;
    };
};
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
export declare function useSelector<TSource, TSelected = NoInfer<TSource>>(source: SelectionSource<TSource>, selector?: (snapshot: TSource) => TSelected, options?: UseSelectorOptions<TSelected>): Accessor<TSelected>;
export {};
