User request: "when i slect multiple items and move any of them they must omve together"

## 1. Objective Reconstruction
The objective was to implement a synchronized multi-element dragging experience on the canvas. When a user has multiple blocks or shapes selected and drags any single one of them, all selected items must move together as a single rigid body, preserving their exact relative layout and spacing perfectly.

---

## 2. Strategic Reasoning
- **Unified Offset Delta:** To prevent position drifting and round-off accumulation during active dragging, we capture the initial canvas coordinates (`x`, `y` and shape `points`) of all selected elements immediately on `pointerdown`.
- **Rigid-Body Group Delta:** During `pointermove`, we calculate a single global coordinate delta (`dx`, `dy`) based on the movement of the pointer.
- **Snapping Alignment:** To maintain alignment and layout integrity, the snapping logic (`snapWithObjects`) is executed on the primary dragged block to find its snapped position. The delta between its snapped position and initial position is then applied uniformly as a single, identical snapped delta to all other selected elements in the group.
- **Support for Lineish Shapes & Sections:** Shifting must support both conventional bounding-box elements (sections, text, etc. via `x`/`y`) and lineish elements (lines, arrows, freedraw via shifting all vertex points in the `points` coordinate array) to move unified groups accurately. Special canvas elements like sections trigger `moveCanvasSection` to cleanly shift their children as well.
- **Selection Optimization:** If an element is already part of the active selection, clicking it does not clear other selections immediately on `pointerdown`. If the user just clicks without dragging, selection is updated to only that element on `pointerup`.

---

## 3. Detailed Blueprint
- **`src/components/canvas/CanvasBlock.tsx`**:
  - Accept `selectedIds?: Set<string>` as a prop to determine which elements are part of the active selection.
  - Update `handlePointerDown` to record initial coordinates of all selected blocks in a temporary map on pointer down.
  - Update `handlePointerMove` to calculate global movement delta and apply it uniformly to all elements in the initial coordinates map, with snapping computed against the primary block.
  - Update `handlePointerUp` to commit final synchronized positions of all selected elements to the store.
  - Include `prev.selectedIds === next.selectedIds` inside the custom memo comparator of `CanvasBlock`.
- **`src/components/canvas/CanvasPage.tsx`**:
  - Pass the `selectedIds` set down into individual `CanvasBlock` instances.

---

## 4. Operational Trace
- Modified `CanvasBlockProps` and `CanvasBlockComponent` in `CanvasBlock.tsx` to support `selectedIds`.
- Created `initialPositions` map inside `handlePointerDown` to track `x`, `y`, and `points` array configurations of all selected items.
- Implemented real-time group-shifting in `handlePointerMove` using `requestAnimationFrame`, applying snapping deltas from the primary block to all other selected items.
- Updated `handlePointerUp` to commit final coordinates for sections (using `moveCanvasSection`) and normal blocks/shapes (using `updateCanvasBlock`) simultaneously.
- Enhanced the `CanvasBlock` custom `memo` comparator with `selectedIds` equality checking.
- Updated `CanvasPage.tsx` to pass the `selectedIds={selectedIds}` prop to all rendered `CanvasBlock` elements.

---

## 5. Status Assessment
- **All requirements successfully implemented:** Dragging any element within a multi-selection group perfectly shifts all other selected elements in unison.
- **Verified in Browser:** A browser subagent successfully completed validation on `http://localhost:3000` by selecting multiple elements on the canvas and dragging one, confirming that both elements moved together in perfect unison.
