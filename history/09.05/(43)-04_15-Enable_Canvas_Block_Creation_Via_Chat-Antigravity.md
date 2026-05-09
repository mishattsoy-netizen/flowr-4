User request: "i mean crating diagrams in canvas by using shapes and blocks"

### 1. Objective Reconstruction
- Support creating brand-new shapes, blocks, and connections on the canvas directly from chat via proposed updates, enabling full AI diagramming from scratch.

### 2. Strategic Reasoning
- Previously, the `apply-canvas` protocol in `ChatMessage.tsx` only supported modifying existing canvas blocks (`updateCanvasBlock`).
- Upgrading `ApplyCanvasCard` to read current blocks and conditionally call `addCanvasBlock` when a block ID does not exist allows the AI to instantiate new shapes, position them, and render a full visual diagram in real-time.

### 3. Detailed Blueprint
- **`src/components/assistant/components/ChatMessage.tsx`**:
  - Retrieved `blocks`, `addCanvasBlock`, and `activeEntityId` from the Zustand store inside the `ApplyCanvasCard` component.
  - Updated the application logic so that for each item in the proposed JSON array, if it does not yet exist on the active canvas, it is programmatically added with its `canvasId` bound to the current page.

### 4. Operational Trace
1. Opened `src/components/assistant/components/ChatMessage.tsx`.
2. Updated `ApplyCanvasCard` to check block existence.
3. Implemented safe creation fallbacks using `addCanvasBlock`.

### 5. Status Assessment
- **Completed**: Fully enabled creating new canvas shapes and blocks from scratch via chat proposed updates.
