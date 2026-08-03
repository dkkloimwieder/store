import { createContext, useContext } from 'solid-js';
/**
 * Creates a typed Solid context for sharing a bundle of atoms and stores with a
 * subtree.
 *
 * The returned `StoreProvider` only transports the provided object through
 * Solid context. Consumers destructure the contextual atoms and stores, then
 * compose them with the existing hooks like {@link useSelector} and
 * {@link useAtom}.
 *
 * The object shape is preserved exactly, so keyed atoms and stores remain fully
 * typed when read back with `useStoreContext()`.
 *
 * @example
 * ```tsx
 * const { StoreProvider, useStoreContext } = createStoreContext<{
 *   countAtom: Atom<number>
 *   totalsStore: Store<{ count: number }>
 * }>()
 *
 * function CountButton() {
 *   const { countAtom, totalsStore } = useStoreContext()
 *   const count = useSelector(countAtom)
 *   const total = useSelector(totalsStore, (state) => state.count)
 *
 *   return (
 *     <button
 *       type="button"
 *       onClick={() =>
 *         totalsStore.setState((state) => ({ ...state, count: state.count + 1 }))
 *       }
 *     >
 *       {count()} / {total()}
 *     </button>
 *   )
 * }
 * ```
 *
 * @throws When `useStoreContext()` is called outside the matching `StoreProvider`.
 */
export function createStoreContext() {
    // An explicit null default rather than Solid 2's default-less
    // `createContext<TValue>()`. The default-less form throws its own
    // ContextNotFoundError, which would silently replace this package's documented
    // "Missing StoreProvider for StoreContext" contract.
    const Context = createContext(null);
    function StoreProvider(props) {
        // In Solid 2 the context object is itself the provider component.
        return <Context value={props.value}>{props.children}</Context>;
    }
    function useStoreContext() {
        const value = useContext(Context);
        // Thrown from the component body, never from a JSX expression: a throw
        // inside JSX triggers REACTIVITY_HALTED and kills every later render.
        if (value === null) {
            throw new Error('Missing StoreProvider for StoreContext');
        }
        return value;
    }
    return {
        StoreProvider,
        useStoreContext,
    };
}
//# sourceMappingURL=createStoreContext.jsx.map