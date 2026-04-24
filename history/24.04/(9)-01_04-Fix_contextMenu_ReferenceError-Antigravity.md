User request: "Runtime ReferenceError: contextMenu is not defined"

## 1. Objective Reconstruction
The user reported a runtime crash after the previous update to utility button highlights. The error occurred because `contextMenu` was being referenced in the JSX of `Sidebar.tsx` and `TreeItem.tsx` but had not been extracted from the `useStore` hook.

## 2. Strategic Reasoning
- **Hook Destructuring**: In Zustand-based stores, every state property used in a component must be explicitly mapped via the `useStore` hook. Omitting this mapping results in a `ReferenceError` because the variable doesn't exist in the component's scope.
- **System Stability**: When fixing a `ReferenceError` in one file, it's critical to audit other files where similar logic was recently applied. Since I added `contextMenu` checks to both `Sidebar.tsx` and `TreeItem.tsx`, I verified and patched both locations.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/TreeItem.tsx`
- **Plan**:
  - Add `const contextMenu = useStore(state => state.contextMenu);` to both components.
  - Verify that no other missing variables are being referenced.

## 4. Operational Trace
1. Modified `Sidebar.tsx`:
   - Added the `contextMenu` selector to the store hooks section.
2. Modified `TreeItem.tsx`:
   - Added the `contextMenu` selector to the store hooks section.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The runtime error is resolved, and the persistent highlights for utility buttons are now fully functional and safe.
- **Recommendation**: None.
