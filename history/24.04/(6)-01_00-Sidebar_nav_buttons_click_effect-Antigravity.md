User request: "add soft satisfying click effect for nav buttons in the sidebar"

## 1. Objective Reconstruction
The user requested a "satisfying" tactile response for navigation elements in the sidebar. The goal was to enhance the perceived quality of the UI by adding physical-like feedback to the "active" state of buttons and list items.

## 2. Strategic Reasoning
- **Tactile Transformation**: A slight scale-down on click is a well-established pattern for creating "satisfying" buttons. It emulates the physical compression of a real button.
- **Proportional Feedback**: Larger items (like navigation rows) require less extreme scaling (0.97) to feel natural, whereas smaller buttons (22px utility buttons) benefit from a more pronounced scale (0.90) to be noticeable.
- **Transition Speed**: Using a 75ms duration ensures the feedback is perceived as instantaneous. If the transition is too slow, the UI feels "mushy" rather than "snappy".

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: The central location for shared UI component styles.
- **Plan**:
  - Update `.sidebar-item-row` with an `active:scale-[0.97]` state.
  - Update `@utility btn-sidebar-utility` with an `active:scale-[0.9]` state.
  - Apply `duration-75` for sharp, responsive feedback.

## 4. Operational Trace
1. Modified `globals.css`:
   - Added the `.sidebar-item-row` class definition for global active state tracking.
   - Updated the `btn-sidebar-utility` utility with the active scale modifier.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar now feels significantly more responsive and tactile. Each click provides a soft, satisfying "press" animation.
- **Recommendation**: Consider adding a similar effect to the Header buttons for global consistency.
