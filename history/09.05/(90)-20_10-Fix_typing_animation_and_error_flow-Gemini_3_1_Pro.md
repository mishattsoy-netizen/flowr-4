User request: "fix, i dont see bot's answer typing animation. make sure that if answer contain any text, no matter if its any chain or error notification. ther must be typing apearance aniumation"

## Objective Reconstruction
Fix the bug causing the assistant's typing animation to fail under specific conditions (e.g., prolonged thinking phases, non-streamed final outputs, or System Alert error notifications). Ensure animations strictly run for all incoming text regardless of generation method or status tier.

## Strategic Reasoning
Tracing the implementation in `ChatMessage.tsx` revealed three core breakdown vectors:
1. **Premature Expiry Bug:** A utility `useEffect` was automatically invoking a 1.5s fallback to `setHasFinishedTyping(true)` immediately upon the creation of the message container. If the backend process (thinking, routing) exceeded 1.5s before outputting text, the typing mechanism was preemptively killed, forcing the final content to render instantly without animation.
2. **Structural Bypass (Errors):** The specialized `isError` view was intercepting standard rendering before the markdown parser and was binding directly to `msg.content`, skipping the incremental `displayContent` system entirely.
3. **Null-Render Suppression:** The core layout wrapper had a logic condition `!displayContent && !(isAILoading && isLast)` returning `null`, which caused transient render voids if typing had not initialized characters within the exact micro-tick that network loading concluded.

## Detailed Blueprint
Targeted edits deployed to `src/components/assistant/components/ChatMessage.tsx`:
- Add `targetContent.length > 0` precondition to the 1.5s stall fallback to disable expiry triggers during active thinking periods.
- Introduce substring slice interpolation in the `isError` routine to align visual error reporting dynamically with the real-time text accumulator count.
- Augment component output gate with `targetContent.length === 0` checking to maintain rendering throughout dynamic character generation.

## Operational Trace
- Performed file inspection of `ChatMessage.tsx`, scanning for all instances of state triggers for `hasFinishedTyping`.
- Audited global store (`store.ts`) instantiation timing ensuring state is properly anchored across render cycles without component unmounting.
- Deployed synchronous `multi_replace_file_content` patch.

## Status Assessment
Resolved. Animation constraints have been correctly partitioned to ONLY skip for legacy message history loading. All live generated text—whether streaming, instant tool payload, or System Error bubble—will correctly iterate character/word sequences before enabling final text stability.
