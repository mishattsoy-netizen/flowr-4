User request: "use 16px borders for all message bubbles and blocks(image, table., code...)"

## Objective Reconstruction
Coordinate aesthetic consistency across conversational visual artifacts by enforcing a standard 16px (Tailwind `rounded-2xl`) corner radius across multiple interactive blocks, including user message bubbles, code block wrappers, markdown tables, and dynamic chat image representations.

## Strategic Reasoning
Global corner synchronization unifies distinct container types into a singular cohesive layout. 
- Switched dynamic image wrappers and code containers up to `rounded-2xl` from smaller previous presets (`-lg`, `-xl`, or `[var(--radius-small)]`).
- Slightly tuned the asymmetric User message bubble anchor from 17px down to precise 16px while retaining visual orientation structure.
- Verified Table border containers adapt cleanly to match.

## Detailed Blueprint
- Update `ChatMessage.tsx`:
  - Code blocks: `rounded-xl` -> `rounded-2xl`.
  - Tables: `rounded-lg` -> `rounded-2xl`.
  - User Bubble: `17px 17px 4px 17px` -> `16px 16px 4px 16px`.
- Update `ChatImage.tsx`:
  - Main container: `rounded-[var(--radius-small)]` -> `rounded-2xl`.
  - Spinner background: `rounded-[var(--radius-small)]` -> `rounded-2xl`.

## Operational Trace
- Audited multiple files searching for layout block definitions.
- Dispatched coordinated replacements targeting CSS radius variables and literal props.
- Confirmed cascading Tailwind resolution for standard 1rem targets.

## Status Assessment
Successfully unified. All block formats now employ standardized 16px soft corners for consistent curvature.
