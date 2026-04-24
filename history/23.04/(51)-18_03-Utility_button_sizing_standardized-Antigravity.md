User request: "all utility buttons smae size and make their hover backround smaller not icon"

## 1. Objective Reconstruction
The user requested a more refined aesthetic for sidebar utility buttons (Plus, More, Chevrons). Specifically, the hover background should be smaller than the 28px row height to create an "inset" effect, while the icon itself remains at its original 14px scale. Additionally, all utility buttons (including expansion chevrons) must share this same standardized footprint.

## 2. Strategic Reasoning
- **Visual Refinement**: A 24px button centered in a 28px row creates a 2px "breathing room" above and below the background. This makes the UI feel less "chunky" and more professional.
- **Hit Area Synchronization**: By mapping all secondary interaction points (chevrons, plus, more) to a single `btn-sidebar-utility` class, we ensure predictable behavior and visual balance across different sidebar components.
- **Inset Hover Pattern**: Using a fixed size (w-6 h-6) for the hover background while keeping the icon centered ensures that the expansion chevrons don't feel oversized compared to the utility actions at the end of the row.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: To update the global utility class.
  - `src/components/layout/TreeItem.tsx`: To unify chevron toggle styling.
  - `src/components/layout/Sidebar.tsx`: To wrap header chevrons in the new footprint.
- **Plan**:
  - Update `btn-sidebar-utility` to `w-6 h-6` (24px).
  - Replace the relative negative-margin chevron in `TreeItem` with a fixed 24px absolute container (`-inset-[5px]`).
  - Wrap header chevrons in `Sidebar.tsx` in a `w-6 h-6` flex container.

## 4. Operational Trace
1. Modified `globals.css`:
   - Updated `btn-sidebar-utility` from `w-7 h-7` to `w-6 h-6`.
2. Modified `TreeItem.tsx`:
   - Refactored the chevron toggle area to use `absolute -inset-[5px]`, which creates a 24px hover area for the 14px icon.
   - Removed the legacy `p-1` and negative margin logic.
3. Modified `Sidebar.tsx`:
   - Wrapped the header chevrons for "Unsorted" and "Workspaces" in `w-6 h-6` flex containers to match the footprint of the adjacent buttons.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: All utility buttons now have a consistent, refined 24px hover background. The icons are centered and balanced, and the sidebar alignment is perfectly preserved.
- **Recommendation**: None.
