User request: "change scale to 99 and remove from utiity buttons"

## 1. Objective Reconstruction
The user requested a refinement of the tactile feedback in the sidebar. The goal was to make the navigation row scale effect more subtle (0.99 instead of 0.97) and to remove the effect entirely from the smaller utility buttons.

## 2. Strategic Reasoning
- **Subtlety as Premium**: A 0.99 scale provides a very delicate sense of depth that is often perceived as more "high-end" than a more dramatic 0.97 scale. It suggests a rigid but responsive interface.
- **Visual Hierarchy**: Removing the effect from utility buttons simplifies the interaction model for secondary actions, focusing the tactile feedback solely on primary navigation transitions.
- **Consistency**: Retaining the 75ms duration ensures that while the scale is smaller, the response time remains consistent across the app's interactive surface.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: The source of the UI utility definitions.
- **Plan**:
  - Adjust `.sidebar-item-row` active scale to `0.99`.
  - Remove `active:scale-[0.9]` from the `btn-sidebar-utility` class.

## 4. Operational Trace
1. Modified `globals.css`:
   - Updated the `.sidebar-item-row` class with the new scale value.
   - Removed the active state modifier from `btn-sidebar-utility`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar feedback is now extremely subtle and professional. The 0.99 scale provides just enough feedback to be felt without being visually distracting.
- **Recommendation**: None.
