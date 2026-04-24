User request: "make all buttons in sidebar 28px and same size icons adn utility buttons"

## 1. Objective Reconstruction
The user requested a complete standardization of the sidebar's vertical rhythm. The goal was to make every interactive element—headers, list items, and utility buttons—exactly 28px in height, with perfectly unified icon sizes for a professional, high-fidelity look.

## 2. Strategic Reasoning
- **Vertical Rhythm**: Standardizing on `h-7` (28px) creates a consistent grid throughout the sidebar, making it feel more organized and easier to scan.
- **Component Parity**: By making utility buttons and icon containers the same width (`w-7`), we ensure that text labels and icons align vertically across different levels of the tree and between headers and items.
- **Icon Scale**: Standardizing all icons to `w-3.5` (14px) ensures they don't look "clunky" or "lost" within their 28px containers.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: To update the `btn-sidebar-utility` shared class.
  - `src/components/layout/TreeItem.tsx`: To update list item row height, icon sizing, and alignment.
- **Plan**:
  - Update `btn-sidebar-utility` to `w-7 h-7`.
  - Change `TreeItem` row height from `py-[3px]` to `h-7`.
  - Increase icon container width to `w-7` and adjust text margins (`ml-0`).
  - Standardize all icon sizes to `w-3.5 h-3.5`.
  - Adjust chevron hit area to `-m-1.75` to match the 28px grid.

## 4. Operational Trace
1. Updated `globals.css` utility `@utility btn-sidebar-utility` to `w-7 h-7`.
2. Modified `TreeItem.tsx`:
   - Updated `getIcon` helper to use `w-3.5 h-3.5`.
   - Changed main row container to `h-7`.
   - Changed icon container to `w-7` and text span to `ml-0`.
   - Updated chevron hit area to `-m-1.75` (expanding it from 20px to 28px).
3. Verified alignment: `12px (padding) + 28px (container) = 40px` offset, maintaining the previous layout's horizontal position while providing a larger interactive area.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar is now perfectly uniform. Every clickable element shares the same 28px vertical footprint, and icons are consistently scaled across the entire navigation panel.
- **Recommendation**: Maintain the `h-7` standard for any future sidebar extensions.
