import { UseSelectorOptions } from "./useSelector.cjs";
import { Atom } from "@tanstack/store";
import { Accessor } from "solid-js";

//#region src/useAtom.d.ts
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
declare function useAtom<TValue>(atom: Atom<TValue>, options?: UseSelectorOptions<TValue>): [Accessor<TValue>, Atom<TValue>['set']];
//#endregion
export { useAtom };
//# sourceMappingURL=useAtom.d.cts.map