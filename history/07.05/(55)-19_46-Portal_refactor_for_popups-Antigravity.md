User request: "still under cards"

Objective Reconstruction:
After the initial z-index fix failed to resolve the overlapping issue (likely due to the sortable grid's internal stacking contexts created by 'transform' properties), the objective shifted to a more robust solution: React Portals.

Strategic Reasoning:
React Portals allow components to 'break out' of their parent's DOM hierarchy and render elsewhere—in this case, directly under 'document.body'. By rendering the popups as children of the body, we completely bypass any 'z-index' or clipping issues imposed by the parent cards or the grid. I used 'getBoundingClientRect()' to calculate the card's position and maintain the popup's visual alignment while it floats at the body level.

Detailed Blueprint:
- Files involved:
    - `src/components/admin/RouterManager.tsx`
- Changes:
    - Implemented `createPortal` for System Prompt and Preset Manager popups.
    - Added `cardRef` and `useEffect` to track the card's position on scroll/resize.
    - Set the portal `z-index` to '9999'.

Operational Trace:
- Modified `RouterManager.tsx`: 
    - Added `import { createPortal } from 'react-dom'`.
    - Added `rect` state and tracking logic.
    - Refactored popup JSX to use `createPortal`.
    - Fixed structural errors in the preset list rendering that occurred during the transition.

Status Assessment:
Completed. This is the definitive fix for stacking context issues in the admin grid.
