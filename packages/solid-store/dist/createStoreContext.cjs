let _solidjs_web = require("@solidjs/web");
let solid_js = require("solid-js");

//#region src/createStoreContext.tsx
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
function createStoreContext() {
	const Context = (0, solid_js.createContext)(null);
	function StoreProvider(props) {
		return (0, _solidjs_web.createComponent)(Context, {
			get value() {
				return props.value;
			},
			get children() {
				return props.children;
			}
		});
	}
	function useStoreContext() {
		const value = (0, solid_js.useContext)(Context);
		if (value === null) throw new Error("Missing StoreProvider for StoreContext");
		return value;
	}
	return {
		StoreProvider,
		useStoreContext
	};
}

//#endregion
exports.createStoreContext = createStoreContext;
//# sourceMappingURL=createStoreContext.cjs.map