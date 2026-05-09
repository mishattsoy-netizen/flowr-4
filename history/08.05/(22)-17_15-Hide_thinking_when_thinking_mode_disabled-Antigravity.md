User request: "dont show thinking when thinking mode off"

## 1. Objective Reconstruction
The user requested that the "Show thinking" accordion/dropdown should not be rendered at all in the chat if the "Thinking" mode is toggled off (disabled) in the settings menu.

## 2. Strategic Reasoning
- **Respect User Settings:** If a user disables thinking mode, they want to see a direct and clean chat experience without any "Show thinking / Hide thinking" elements on the page, even if there are technical non-thinking pipeline steps (like "Writing") registered.
- **Zustand Integration:** We read the global `thinkingEnabled` state from the application's Zustand store using `useStore(state => state.thinkingEnabled)`.
- **Conditional Visibility:** By logical-AND'ing `hasThinking` with `thinkingEnabled`, we ensure the thinking element is completely hidden whenever the toggle is off, regardless of whether `msg.pipelineSteps` has entries or there's residual `<think>` blocks.

## 3. Detailed Blueprint
- **Import `thinkingEnabled`:** Retrieve `thinkingEnabled` from the Zustand store.
- **Condition `hasThinking`:** Update the `hasThinking` boolean to be `thinkingEnabled && (!!thoughtContent || (!!msg.pipelineSteps && msg.pipelineSteps.length > 0))`.

## 4. Operational Trace
- **File Modified:** [ChatMessage.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/assistant/components/ChatMessage.tsx)
- Imported `thinkingEnabled` from the store (line 101).
- Updated `hasThinking` calculation (line 127).

## 5. Status Assessment
- **Complete:** The "Show thinking" accordion is now perfectly hidden when thinking mode is turned off, as requested.
