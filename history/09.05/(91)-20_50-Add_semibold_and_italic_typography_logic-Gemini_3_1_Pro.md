User request: "add ability for bot to use not only bold style in the answers but also semibold and italic(very rarely only when needded, i dont like a lot if italic texts. if quote-doesnt mean whole quote block is italic) styles."

## Objective Reconstruction
Enable the AI to distinguish between standard Bold and Semibold font weights in generated responses, enforce stricter visual controls over Italics usage (especially excluding whole-quote styling), and cascade these formatting instructions to the System Prompt architectures.

## Strategic Reasoning
- **Tiered Weight Detection:** By inspecting the raw markdown AST token `node.position.start.offset` inside the `strong` ReactMarkdown component, we can differentiate between double-asterisk `**text**` (interpreted as 700 Weight Heavy Bold) and double-underscore `__text__` (interpreted as 600 Weight Semibold). This achieves tiered weight without changing basic markdown logic.
- **Italic Restrictions:** Explicitly mapping the `em` component for customized tracking and simultaneously removing the hardcoded `italic` CSS class from the `blockquote` component honors the user's desire to prevent monolithic italic blocks.
- **Coherent Instruction Routing:** The explicit distinction is embedded in the core [ANSWER STYLE] rules for prompt construction so the underlying model leverages double-underscores for soft emphasis naturally.

## Detailed Blueprint
- Edit `src/components/assistant/components/ChatMessage.tsx`:
  - Modified `blockquote` to strip global italics.
  - Upgraded `strong` to execute source-offset validation for `__` strings.
  - Added explicit `em` rendering handler.
- Edit `mode-default.txt` & `mode-pro.txt`:
  - Integrated "Weight Guidelines & Typography" section documenting explicit usage criteria.

## Operational Trace
- Patched `ChatMessage.tsx` via non-contiguous chunk injection.
- Deployed regex reinforcement to default and pro mode system definitions.
- Validated sequential numbered section increments via tool re-evaluation.

## Status Assessment
Successfully completed. The bot will now gracefully cycle through 600 and 700 weight variants based on internal list syntax and strictly gate usage of italics only when critically designated.
