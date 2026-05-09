User request: "insctead of checkbox next to the task in the task window show color circle and when i click it show color selection popup. instead of done button, add complete button with dropdown button on the right that open other statues like in progress or restore button if task is completed that moves task to today or reschedule button in overdue tasks that will move task to today"

### 1. Objective Reconstruction
- Replace the completion checkbox in the modal header with an interactive color circle that opens a category color popover.
- Remove the old category color picker row, making the Workspace Selector full-width.
- Replace the "Done" button with a primary action button group containing:
  - A dynamic primary button that updates based on the task's state: `"Complete"` (to mark as complete), `"Restore"` (if completed, which uncompletes and moves to today), or `"Reschedule"` (if overdue, which moves to today).
  - An dropdown arrow button on the right that opens a status transition menu ("Mark as Completed", "Move to In Progress", "Move to Today", "Move to Upcoming").

### 2. Strategic Reasoning
- Consolidating the category color selector in the header adjacent to the title reduces visual clutter at the bottom.
- Replacing the static "Done" button with context-aware, state-driven action buttons makes completing, rescheduling, or restoring tasks incredibly fast and natural.
- Adding a dedicated status transition dropdown on the button group provides complete, fine-grained control over due date and completion column assignments.

### 3. Detailed Blueprint
- **`src/components/tracker/TrackerPage.tsx`**:
  - Replaced the checkbox element in the header next to the title with a `<Popover>` containing the `COLORS` palette and rendering a circular preview colored with `localColor`.
  - Replaced the bottom Workspace & Category Color layout row with a single full-width Workspace Selector.
  - Built an action button group in the footer with a main context-sensitive action button (`Restore`, `Reschedule`, `Complete`) alongside a caret dropdown `Popover` containing detailed transition selections.

### 4. Operational Trace
1. Updated modal header in `TrackerPage.tsx` to include the category color selection popover instead of the checkbox.
2. Removed the second column of the Workspace/Color row.
3. Implemented the dual action button group with context-aware labeling and a status dropdown menu in the modal footer.
4. Ran automated browser testing to verify the entire flow works flawlessly.

### 5. Status Assessment
- **Completed**: Successfully implemented the header category color picker popover and context-aware action button group with status transitions.
