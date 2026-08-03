import type { Accessor } from 'solid-js';
/**
 * Deprecated alias for {@link useSelector}.
 *
 * @example
 * ```tsx
 * const count = useStore(counterStore, (state) => state.count)
 * ```
 *
 * @deprecated Use `useSelector` instead.
 */
export declare const useStore: <TSource, TSelected = NoInfer<TSource>>(source: {
    get: () => TSource;
    subscribe: (listener: (value: TSource) => void) => {
        unsubscribe: () => void;
    };
}, selector?: (snapshot: TSource) => TSelected, compare?: (a: TSelected, b: TSelected) => boolean) => Accessor<TSelected>;
