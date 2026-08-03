import { useSelector } from './useSelector';
/**
 * Returns the current atom accessor together with a setter.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useAtom(countAtom)
 *
 * return (
 *   <button type="button" onClick={() => setCount((prev) => prev + 1)}>
 *     {count()}
 *   </button>
 * )
 * ```
 */
export function useAtom(atom, options) {
    const value = useSelector(atom, undefined, options);
    return [value, atom.set];
}
//# sourceMappingURL=useAtom.js.map