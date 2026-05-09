User request: "add new task button in the header and when i clikc it open task window with focused task text area"

### 1. Objective Reconstruction
- Add an interactive "+ New Task" button to the Tracker page header.
- Upon clicking, create a new task programmatically, open the expanded task modal for that task, and automatically focus and select its Title input text area.

### 2. Strategic Reasoning
- Providing an explicit creation CTA in the header improves task creation discoverability and ease of use.
- Automatically focusing and selecting the text input upon opening reduces user friction by a keystroke, allowing instant task drafting.

### 3. Detailed Blueprint
- **`src/data/store.ts`**:
  - Modified `addTask` to return the programmatically created task object containing its generated ID.
- **`src/components/tracker/TrackerPage.tsx`**:
  - Implemented a `titleInputRef` targeting the Title `<input>` inside the modal.
  - Implemented a `handleAddNewTask` callback that dispatches `addTask`, retrieves the new task's ID, and calls `setSelectedTaskIdForEdit(id)` to open the modal immediately.
  - Set up a timeout-based focus inside `useEffect` on `taskToEdit` change to trigger `.focus()` and `.select()` on opening.
  - Rendered a styled "+ New Task" button inside the page header.

### 4. Operational Trace
1. Updated `addTask` inside `store.ts` to return the new task.
2. Created a ref for the Title input and defined the `handleAddNewTask` click handler.
3. Implemented automated autofocus & autoselect in the modal effect.
4. Rendered the "+ New Task" button in the Tracker page header.

### 5. Status Assessment
- **Completed**: Fully implemented the New Task header button and modal autofocus as requested.
