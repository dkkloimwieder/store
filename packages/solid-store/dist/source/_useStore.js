import { useSelector } from './useSelector';
/**
 * Experimental combined read+write hook for stores, mirroring useAtom's tuple
 * pattern.
 *
 * Returns `[selected, actions]` when the store has an actions factory, or
 * `[selected, setState]` for plain stores.
 *
 * @example
 * ```tsx
 * // Store with actions
 * const [cats, { addCat }] = _useStore(petStore, (s) => s.cats)
 *
 * // Store without actions
 * const [count, setState] = _useStore(plainStore, (s) => s)
 * setState((prev) => prev + 1)
 * ```
 */
export function _useStore(store, selector, options) {
    const selected = useSelector(store, selector, options);
    const actionsOrSetState = store.actions ?? store.setState;
    return [selected, actionsOrSetState];
}
//# sourceMappingURL=_useStore.js.map