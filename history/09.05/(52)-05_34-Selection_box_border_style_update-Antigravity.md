User request: "change selection box border to 100% opacity, 1pc solid border"

## Objective Reconstruction
Update the canvas drag-to-select multi-selection box border to be a 1px solid border with 100% opacity, utilizing the brand blue color system (`--brand-blue`).

## Strategic Reasoning
- **The Issue**: Previously, the multi-select selection rectangle in `CanvasPage.tsx` had a semi-transparent dashed border (`stroke="rgba(42,120,214,0.4)" strokeDasharray="4 3"`).
- **The Solution**: Update the `<rect>` styling of the multi-select visual element on the canvas to use `stroke="var(--brand-blue)"` (which represents the brand's primary `#2A78D6` blue with full 100% opacity), set `strokeWidth="1"`, and remove `strokeDasharray` completely to render a crisp solid border.

## Detailed Blueprint
- **`src/components/canvas/CanvasPage.tsx`**:
  - Locate the `<rect>` element inside `multiSelect.selectionRect` rendering condition.
  - Modify properties: set `stroke` to `"var(--brand-blue)"`, remove `strokeDasharray`, and keep `strokeWidth` at `"1"`.

## Operational Trace
- **Modified `src/components/canvas/CanvasPage.tsx`**:
  - Replaced the semi-transparent dashed blue border settings with the fully opaque, solid `--brand-blue` border style on the multi-select component.
- **Verified Build**:
  - Ran a production compilation (`npm run build`), confirming successful build execution with no errors.

## Status Assessment
- **Completed**:
  - Styled the drag selection box border to be solid and 100% opaque.
