User request: "in the tasks add ability to set priority- low, medium, high. also add ability to write description/notes  or sub tasksfor tasks. when i click on task open in the window/expanded view in the center of the screen and add these fetures to context aswell"

### 1. Objective Reconstruction
Implement task feature expansions on the Kanban Tracker board:
- Add a new `priority` property to tasks (`low`, `medium`, `high`) displayed as beautifully styled glowing pill badges.
- Add support for detailed task `description` / notes.
- Add support for nesting dynamic checklist `subtasks` within a parent task, tracking complete/total counts in real-time.
- Build an elegant, state-of-the-art glassmorphic expanded task edit modal in the center of the screen triggered by clicking on any Task Card.
- Integrate these newly added task metadata features into the `screenContext` serializer for the Tracker page so the AI possesses total situational awareness.

### 2. Strategic Reasoning
- **Premium Aesthetics**: The expanded view leverages vibrant, color-coded glows corresponding to task priorities, elegant backdrop blurs, and glassmorphic inputs.
- **Deep Context Serialization**: Task priorities, descriptions, and subtasks are serialized into hierarchical Markdown and passed directly into the active `screenContext`, enabling the AI to assist users with precise breakdowns or recommendations.
- **Flawless Interaction**: Merging full-card click triggers with independent drag handlers ensures that opening the modal is seamless and natural.

### 3. Detailed Blueprint
- **`store.types.ts`**: Expanded `AppTask` interface with `priority`, `description`, and `subtasks` properties. Declared `selectedTaskIdForEdit` state and `setSelectedTaskIdForEdit` actions.
- **`store.ts`**: Initialized state values and action setters. Enhanced the `'tracker'` context serializer inside `sendAIMessage` to compile priorities, description text, and checklist subtasks into the systemic context payload.
- **`TaskCard.tsx`**: Updated `TaskCardUI` to render priority badges, subtask progress indicators (`completed/total`), and description indicators. Added hover circular buttons for fast maximization and wired click handlers to trigger task edits on select.
- **`TrackerPage.tsx`**: Constructed and rendered the custom, high-fidelity glassmorphic expanded task editor modal with support for renaming, priority selection, markdown descriptions, subtask checklists, subtask creation/deletion, and due date selection.

### 4. Operational Trace
1. **Interface Expansion**:
   - Added fields to `AppTask` in `src/data/store.types.ts`.
   - Declared `selectedTaskIdForEdit` and `setSelectedTaskIdForEdit` in `store.types.ts`.
2. **State Integration**:
   - Initialized `selectedTaskIdForEdit` to `null` and created the `setSelectedTaskIdForEdit` action in `src/data/store.ts`.
3. **High-Fidelity Indicators**:
   - Enhanced `TaskCardUI` inside `src/components/tracker/TaskCard.tsx` with conditional badges and subtask counter pill icons.
   - Wired `onClick={() => setSelectedTaskIdForEdit(task.id)}` onto the card.
4. **Interactive Expanded Editor Modal**:
   - Added modal state triggers in `src/components/tracker/TrackerPage.tsx`.
   - Rendered a stunning, responsive center modal with a rich layout, fully supporting title edits, priority pill selectors, custom description textareas, a subtask creation bar, checklist items, date pickers, and delete triggers.
5. **Context Serialization Integration**:
   - Updated `sendAIMessage` in `store.ts` to serialize priority tags, descriptions, and list items in the systemic `'tracker'` context payload.

### 5. Status Assessment
- **Completed**:
  - Priority properties (`low`, `medium`, `high`) with beautiful color pills.
  - Subtask checklists (create, toggle, delete) with tracking counters.
  - Description notes field.
  - Premium center modal with smooth click actions.
  - Full tracker context synchronization with the AI.
- **Next Steps**:
  - No outstanding tasks remain. The Kanban Tracker board is fully optimized with enterprise-grade capabilities.
