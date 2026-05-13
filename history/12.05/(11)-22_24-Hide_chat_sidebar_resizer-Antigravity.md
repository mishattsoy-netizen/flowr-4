User request: "what is this invisible resize sidebar handle in chat"

### 0. Date and time of the request
12.05.2026 22:22

### 1. User request
"what is this invisible resize sidebar handle in chat"

### 2. Objective Reconstruction
Identify and remove a stray vertical resizer handle that appears over the Chat page content when the global AI Assistant sidebar is toggled on but hidden due to being in Chat mode.

### 3. Strategic Reasoning
The global shell layout provides a resizable sidebar for the AI Assistant. On the Chat page, this sidebar is intentionally hidden because the Chat page embeds the assistant directly into the main view. However, the resizer handle component was missing the conditional check for the current page, causing it to float over the chat content at its last known width (defaulting to 400px from the right).

### 4. Detailed Blueprint
- Update `Shell.tsx` to add `activeEntityId !== 'chat'` to the rendering condition for the Right Resizer Handle.
- Ensure the handle's visibility matches the sidebar's visibility logic.

### 5. Operational Trace
- Inspected `src/components/layout/Shell.tsx`.
- Found that while the AI Sidebar wrapper had the check at line 286, the Resizer Handle at line 255 did not.
- Applied the fix to `Shell.tsx` by adding the missing condition.

### 6. Status Assessment
- **Completed**: The resizer handle is now correctly hidden when on the Chat page.
- **Fixed**: Removed the "invisible" vertical line/handle from the chat interface.
