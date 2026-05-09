User request: "i dont want steps to be visible iin the chat. but i want there to be thinking and advisor reasoning/thinking like in gemini or claude thikning mode."

## 1. Objective Reconstruction
The user requested a complete visual overhaul of how the AI's internal reasoning and pipeline execution steps are presented. Specifically:
- Hide/replace the technical, raw step-by-step list ("Thinking Process (X steps)" accordion with checkboxes/clocks) in the chat messages.
- Replace it with an elegant, modern "Show thinking" accordion inspired by Google Gemini and Anthropic Claude's thinking modes.
- Present both DeepSeek-R1-style raw `<think>` blocks and advisor pipeline execution reasoning in this premium, human-readable format rather than a dry list of technical tasks.

## 2. Strategic Reasoning
- **Aesthetic Excellence:** A dry list of pipeline step metrics (e.g. "FAST SIMPLE Writing") with clock and checkmark icons feels like a developer tool or a test-runner interface. To create a premium, state-of-the-art user experience, reasoning should feel organic, conversational, and integrated.
- **Unified Parsing Strategy:** By introducing a `thoughtContent` parser, we handle both DeepSeek-R1-style `<think>` blocks (fully enclosed or streaming in real-time) and the existing `pipelineSteps` array.
- **Gemini-Style Styling:**
  - Used a subtle left border (accent border line) and italic text to convey internal thoughts.
  - Replaced the mono font with a clean sans-serif typography for a natural, human-readable flow.
  - Used standard titles like "Show thinking" and "Hide thinking" with the `<Brain>` icon.
  - Maintained a subtle pulsing dot animation on the running step title to keep the UI feeling "alive" and interactive.

## 3. Detailed Blueprint
- **Compute `thoughtContent` and `hasThinking`:** Memoize the extraction of the `<think>` block from message content or fallback to `msg.thought`.
- **Button Overhaul:** Redesign the button as a sleek, borderless text link with standard `Brain` and Chevron icons, aligning to the left with a subtle hover state.
- **Accordion Content Overhaul:**
  - Render the extracted `<think>` block content directly as italic text if present.
  - Otherwise, render pipeline steps as clean italicized paragraphs under bold titles, completely removing checkboxes, clocks, and code block boxes.
  - Keep the active pipeline step title highlighted with the `text-accent` color and a subtle pulsing indicator to represent real-time activity.

## 4. Operational Trace
- **File Modified:** [ChatMessage.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/assistant/components/ChatMessage.tsx)
- Added memoized calculations for `thoughtContent` and `hasThinking` at the top of the `ChatMessage` component.
- Replaced the `pipelineSteps` rendering block (lines 485–530) with the new Gemini-inspired accordion button and content panel.

## 5. Status Assessment
- **Complete:** The technical pipeline step blocks are successfully replaced with a gorgeous Gemini/Claude-style "Show thinking" dropdown.
- **Validation:** Checked that the styles match the screenshots provided by the user, providing a pristine left-border indicator, italics, and a pulsing live status.
