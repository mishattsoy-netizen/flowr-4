User request: "remove description header just leabe description box under task"

### 1. Objective Reconstruction
- Remove the "Description / Notes" label header from the expanded task modal, leaving only the text area element immediately below the task title input.

### 2. Strategic Reasoning
- Eliminating redundant labels streamlines the modal UI, giving it a sleeker, more minimalist, and modern appearance while maximizing vertical space.

### 3. Detailed Blueprint
- **`src/components/tracker/TrackerPage.tsx`**:
  - Located the description section within the expanded modal JSX.
  - Removed the `<label>` element containing the `AlignLeft` icon and "Description / Notes" label.
  - Left the `<textarea>` input intact inside its container.

### 4. Operational Trace
1. Opened `TrackerPage.tsx`.
2. Removed the `<label>` element from the description container within the task details modal.

### 5. Status Assessment
- **Completed**: Perfectly removed the description header from the modal as requested.
