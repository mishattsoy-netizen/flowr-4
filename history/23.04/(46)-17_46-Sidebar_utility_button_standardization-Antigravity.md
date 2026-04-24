User request: "i feel ike utility buttons hover effect is not same dor header and list items is it true?"

## 1. Objective Reconstruction
The user correctly identified an inconsistency in the hover effects and sizing of utility buttons (like "..." and "+") between sidebar section headers and sidebar list items. The goal was to unify these elements for a perfectly consistent visual experience.

## 2. Strategic Reasoning
- **Unified Design System**: Created a single CSS utility `btn-sidebar-utility` to act as the source of truth for these small icon buttons. This ensures that any future changes to the design will automatically propagate to both headers and list items.
- **Visual Parity**: Standardized on `w-6 h-6` dimensions and the `hover:bg-[var(--bone-10)]` token, which provides the cleanest and most deliberate hover feedback in the sidebar.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: To define the new shared utility.
  - `src/components/layout/Sidebar.tsx`: To update section header buttons.
  - `src/components/layout/TreeItem.tsx`: To update list item buttons.
- **Plan**:
  - Define `btn-sidebar-utility` with standardized sizing, colors, and transitions.
  - Swap out legacy inline classes for the new utility in all sidebar components.

## 4. Operational Trace
1. Defined `@utility btn-sidebar-utility` in `globals.css` using the project's "bone" tokens.
2. Replaced `p-1 rounded-[var(--radius-small)] hover:bg-[var(--bone-6)]` in `Sidebar.tsx` (Pinned, Unsorted, Workspaces headers) with `btn-sidebar-utility`.
3. Replaced the explicit sizing and hover classes in `TreeItem.tsx` with `btn-sidebar-utility`.
4. Verified that all buttons now share the exact same 10% opacity bone background on hover and 100% white text color shift.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar now feels significantly more cohesive. Every utility button follows the exact same visual logic, removing the subtle "drift" that was present between different types of navigation elements.
- **Recommendation**: Continue using `btn-sidebar-utility` for any future small icon actions in the sidebar area.
