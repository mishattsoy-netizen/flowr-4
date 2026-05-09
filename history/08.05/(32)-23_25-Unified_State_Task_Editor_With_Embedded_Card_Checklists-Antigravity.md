User request: "i cant add subtasks and save updates/edits, tasks in the tracker must contain subtasks priority and short description but add max rows visible"

### 1. Objective Reconstruction
- Resolve subtask and description saving lag/issues by transitioning the expanded task modal to full local state tracking (`localTitle`, `localNote`, `localPriority`, `localSubtasks`, `localDueDate`) with a single unified save upon clicking "Done" or closing.
- Redesign Kanban board task cards (`TaskCardUI`) to directly display active subtask checklists (up to 3 items + overflow indicator) and short description summaries (clamped to 2 lines) directly on the board, enhancing overall information density and accessibility.

### 2. Strategic Reasoning
- **Lag-Free Interaction**: Directly calling IndexedDB writes on every key event (`onChange`) previously locked the browser main thread. Transitioning to local states with a unified save callback (`handleSave`) upon clicking "Done" or closing eliminates database lockups completely, making subtask additions and text editing instantaneous and highly responsive.
- **Embedded Board Visibility**: Users want to understand the active details of their board at a single glance without opening modals. Embedding bounded summaries of descriptions and checklists directly on task cards greatly enhances the readability of columns while preventing cards from growing excessively tall ("max rows visible").

### 3. Detailed Blueprint
- **`TrackerPage.tsx`**:
  - Bound all modal edit components (title, description, priority, subtask lists, due dates) to local react state variables.
  - Implemented a unified `handleSave` callback to write all local states simultaneously back to the Zustand store.
- **`TaskCard.tsx`**:
  - Rendered description summaries with `line-clamp-2` (limiting to exactly 2 rows).
  - Rendered a compact, stylish subtask checklist displaying the first 3 subtasks with their respective checkmarks and a `+ N more` indicator for any excess items.

### 4. Operational Trace
1. Updated `localPriority`, `localSubtasks`, and `localDueDate` states inside `TrackerPage.tsx`.
2. Created `handleSave` callback to update title, note, description, priority, subtasks, and due dates in a single store action.
3. Updated all modal handlers to modify local state variables.
4. Redesigned `TaskCardUI` in `TaskCard.tsx` to render bounded descriptions and up to 3 checklist subtasks directly on the card.

### 5. Status Assessment
- **Completed**:
  - Lag-free, stable modal subtask additions and descriptions.
  - Subtask checklists and short description summaries are beautifully displayed on the Kanban cards with bounded maximum heights.
