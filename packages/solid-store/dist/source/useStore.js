import { useSelector } from './useSelector';
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
export const useStore = (source, selector = (value) => value, compare) => useSelector(source, selector, { compare });
//# sourceMappingURL=useStore.js.map