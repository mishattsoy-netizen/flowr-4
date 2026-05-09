User request: "1. manual, add context button next to the tool button that shares my screen when on
2. full, it must understand everyhing as if i sent screenshot of my screen. it must know what i selected, contet positions, layout, oder...
3. yes"

### 1. Objective Reconstruction
Implement a comprehensive, premium Manual Screen Context Sharing System and a matching Suggestion Auto-Apply ("Write Back") System in Flowr. 
- Enable users to manually toggle active screen context sharing via a beautiful glowing `Monitor` icon button in the AI sidebar input action bar.
- Compile and serialize deep client-side layout context (spatial parameters, ordering, selection tags, nested hierarchies) for Notes and Canvas pages, passing it to the server-side as `screenContext`.
- Inject a structured `[ACTIVE SCREEN CONTEXT]` prompt block in the AI backend pipeline with formatting directions instructing the models how to formulate target improvements.
- Parse specific fenced code blocks (`apply-note` and `apply-canvas`) inside the React chat message component and render interactive, modern, glowing suggestion cards that write updates back to the active page with a single click.

### 2. Strategic Reasoning
- **Opt-in Privacy Strategy**: Providing a manual toggle button next to the "Tools" button gives the user precise, tactile control over when screen content is serialized and sent to the LLM.
- **Deep Layout Serialization**: Serializing full spatial coordinates, selection markers, and nested Markdown blocks bridges the gap of visual understanding, allowing non-vision text models to comprehend exact spatial layouts and structure.
- **Interactive Single-Click "Apply"**: Direct write-back loops completely eliminate the friction of manually copying and pasting, offering a flawless, magic-like "Vibe Coding" user experience.

### 3. Detailed Blueprint
- **`store.ts` / `store.types.ts`**: Initialized states `isSharingScreenContext` and `activeCanvasSelection` with action setters. Enhanced `sendAIMessage` to capture complete Note markdown structures and nested JSON block layouts of Canvas shapes, sending it as `screenContext`.
- **`CanvasPage.tsx`**: Synced local selected canvas shape IDs to the global state using a reactive `useEffect`.
- **`AIAssistant.tsx`**: Integrated the glassmorphic, glowing `Monitor` context sharing toggle button right next to the "Tools" action button.
- **`route.ts`**: Captured `screenContext` from the JSON request body and passed it through to `runChain`.
- **`chainRouter.ts`**: Formatted and prepended `[ACTIVE SCREEN CONTEXT]` to `finalSysPrompt` if present, defining explicit model instructions for generating `apply-note` and `apply-canvas` blocks.
- **`ChatMessage.tsx`**: Created `ApplyNoteCard` and `ApplyCanvasCard` components with modern micro-animations, glowing backdrops, and active Zustand write-backs. Updated the ReactMarkdown code component to render these cards in place of raw fenced code blocks.

### 4. Operational Trace
1. **Zustand Store Extension**:
   - Added `isSharingScreenContext` and `activeCanvasSelection` parameters to `store.types.ts`.
   - Created the `setIsSharingScreenContext` and `updateCanvasSelection` actions in `store.ts`.
   - Enhanced `sendAIMessage` to serialize Active Page parameters if `isSharingScreenContext === true`.
2. **Real-Time Active Selection Tracking**:
   - Added `useEffect` in `CanvasPage.tsx` to automatically call `updateCanvasSelection(Array.from(selectedIds))` on change.
3. **Sidebar UI Integration**:
   - Added the glassmorphic `Monitor` toggle button inside `AIAssistant.tsx` with smooth micro-interaction hover animations.
4. **Backend Route Parameter Parsing**:
   - Modified `src/app/api/ai/chat/route.ts` to parse `screenContext` from requests and pass it into the `runChain` arguments.
5. **Prompt Injection Logic**:
   - Added `screenContext` type handler to `src/lib/bot/chainRouter.ts` `runChain` parameters.
   - Constructed the formatted `[ACTIVE SCREEN CONTEXT]` block that is appended into `finalSysPrompt` prior to execution.
6. **Suggestion Rendering Cards**:
   - Exported `markdownToBlocks` from `src/data/store.ts` for frontend usage.
   - Created `ApplyNoteCard` and `ApplyCanvasCard` with glowing borders, hover states, and successful check animations inside `src/components/assistant/components/ChatMessage.tsx`.
   - Integrated custom code block parsing in ReactMarkdown inside `ChatMessage.tsx` to trigger these cards instead of standard raw code containers.

### 5. Status Assessment
- **Completed**:
  - Manual toggle with UI indicators.
  - Spatial serialization for Canvas selections and structured Note hierarchic serialization.
  - Server-side parsing and structured prompt injection.
  - Beautiful, highly-polished custom Suggestion Cards.
  - Direct Zustands-based single-click write-backs.
  - **Tracker Context Fix**: Added custom `activeEntityId === 'tracker'` serialization, allowing the AI to perfectly observe columns, items, and tasks on the Kanban board when the user switches to the Tracker view.
- **Next Steps & Edge Cases**:
  - Ensure any markdown titles proposed are accurately formatted by the AI for cleaner rendering.
