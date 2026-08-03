import { useSelector } from "./useSelector.js";

//#region src/useAtom.ts
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
function useAtom(atom, options) {
	return [useSelector(atom, void 0, options), atom.set];
}

//#endregion
export { useAtom };
//# sourceMappingURL=useAtom.js.map