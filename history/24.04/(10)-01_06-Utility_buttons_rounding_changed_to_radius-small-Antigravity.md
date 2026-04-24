User request: "use small" (referring to corner radius)

## 1. Objective Reconstruction
The user requested to switch the corner radius of utility buttons and interactive elements from a custom 3px value to the system-defined `radius-small` (6px). This change softens the appearance of these small interactive footprints.

## 2. Strategic Reasoning
- **System Token Compliance**: Moving away from hardcoded pixel values to CSS variables (like `--radius-small`) ensures that the UI remains consistent if the global design tokens are updated in the future.
- **Visual Softness**: At 6px radius on a 22px button, the corners become much more prominent, creating a friendlier and less "industrial" aesthetic compared to the 3px "surgical" look.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: The definition of the `btn-sidebar-utility` class.
  - `src/components/layout/TreeItem.tsx`: The implementation of the chevron hover container.
- **Plan**:
  - Update `globals.css` to use `rounded-[var(--radius-small)]`.
  - Update `TreeItem.tsx` to replace the manual `rounded-[3px]` with the same variable.

## 4. Operational Trace
1. Modified `globals.css`:
   - Updated the `btn-sidebar-utility` utility with the system radius token.
2. Modified `TreeItem.tsx`:
   - Updated the expansion chevron's hover container to use the system radius token.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: All utility buttons and chevrons now share the 6px `radius-small` rounding, providing a unified and softer interaction style.
- **Recommendation**: None.
