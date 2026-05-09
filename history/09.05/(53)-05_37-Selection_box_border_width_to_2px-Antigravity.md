User request: "its 2px not 1 px"

## Objective Reconstruction
Increase the stroke width of the canvas selection box border from 1px to 2px for enhanced visual prominence.

## Strategic Reasoning
- **The Issue**: The user requested that the selection box border width be 2px instead of 1px.
- **The Solution**: Set the `strokeWidth` attribute of the `<rect>` component in `CanvasPage.tsx` to `"2"`.

## Detailed Blueprint
- **`src/components/canvas/CanvasPage.tsx`**:
  - Locate the selection box `<rect>` element and change `strokeWidth="1"` to `strokeWidth="2"`.

## Operational Trace
- **Modified `src/components/canvas/CanvasPage.tsx`**:
  - Updated `strokeWidth` to `"2"`.
- **Verified Build**:
  - Built the application (`npm run build`) successfully with zero errors.

## Status Assessment
- **Completed**:
  - Set multi-selection drag box border width to 2px.
