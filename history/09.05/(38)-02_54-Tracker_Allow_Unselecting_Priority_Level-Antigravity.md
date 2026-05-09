User request: "when i clikc on selected priority level, unselect it"

### 1. Objective Reconstruction
- Allow unselecting the active priority level in the task details modal by clicking it again.

### 2. Strategic Reasoning
- Toggling selection on click is standard, intuitive UI behavior. If a user clicks a priority button that is already active, they expect it to clear the priority level back to undefined rather than remaining locked.

### 3. Detailed Blueprint
- **`src/components/tracker/TrackerPage.tsx`**:
  - Located the `low`, `medium`, and `high` priority selection buttons.
  - Modified the `onClick` handler of the priority button to toggle: if `localPriority === prio` set to `undefined`, else set to `prio`.

### 4. Operational Trace
1. Opened `TrackerPage.tsx`.
2. Changed the priority `onClick` event to use a conditional toggle check.

### 5. Status Assessment
- **Completed**: Successfully enabled unselecting priority levels on click.
