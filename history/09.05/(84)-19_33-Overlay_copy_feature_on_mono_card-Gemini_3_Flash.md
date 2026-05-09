User request: "ad copy button in the top right corner of the mono"

## Objective Reconstruction
Enable convenient one-click copying for text-based `mono` container cards. Inject a contextual "Copy" action overlay in the top-right corner that persists upon card-hover interactions.

## Strategic Reasoning
- Added local react state (`copied`) for instantaneous visual feedback via transition delays.
- Utilized absolute positioning and `group-hover` selector on the unified card wrapper to declutter passive view states, surfacing actions only on intent.
- Bound copy retrieval to current `textContent` node context so dynamic editor states carry through to system buffers reliably.

## Detailed Blueprint
- In `BlockRenderer.tsx`:
  - Supplemented Lucide imports for `Copy`.
  - Implemented clipboard write handlers backed by temporary boolean confirmation toggle.
  - Spliced an absolutely positioned, condition-gated overlay button targeting the top-right quad of the new container bounds.

## Operational Trace
Updated BlockRenderer to manage click-to-buffer pipelines and successful render state visual swapping (Copy -> Checkmark tick transition). Confirmed safety via system compiler.

## Status Assessment
Operational. Action overlay is correctly injected into the Mono container boundary.
