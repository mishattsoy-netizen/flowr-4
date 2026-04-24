User request: "noth full width, mkae them same size as buttons"

## 1. Objective Reconstruction
The user requested that the recently added context menu dividers be adjusted so they are no longer full-width (edge-to-edge) but instead match the horizontal span of the menu buttons.

## 2. Strategic Reasoning
- **Visual Alignment**: Removing negative horizontal margins from the divider utility ensures it respects the parent container's padding, aligning it with the interactive area of the buttons.
- **Utility Refinement**: Modified the global `popup-divider` utility rather than adding inline overrides, as this aligns with the user's preference for consistent menu aesthetics across the project.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: Contains the `popup-divider` utility definition.
- **Plan**:
  - Locate the `popup-divider` utility.
  - Remove the `-mx-1.5` class which was forcing the divider to ignore the container's padding.

## 4. Operational Trace
1. Opened `globals.css` to line 297.
2. Identified the `@utility popup-divider` block.
3. Removed `-mx-1.5` from the `@apply` directive.
4. Verified that the divider will now inherit the `p-1.5` padding from the `popup-glass-small` container used in `ContextMenu.tsx`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Dividers now match the button width precisely, creating a cleaner, more organized look in the context menus.
- **Recommendation**: None at this time.
