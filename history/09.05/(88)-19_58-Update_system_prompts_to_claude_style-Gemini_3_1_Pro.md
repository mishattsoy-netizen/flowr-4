User request: "@[c:\Users\misha\Documents\Vibe Coding\flowr-4-main\mode-default.txt]@[c:\Users\misha\Documents\Vibe Coding\flowr-4-main\mode-pro.txt] answer stle prompts are only 1,344 chars they should be 2000-2500 chars they must be writtent properly so bot feels consistant and answer is structured, satisfying and helpfull, like claude. chage them and ill paste them in the ui. also if there is any other seaction in the prompt that can be improved, like personality or thinking, do it"

## Objective Reconstruction
Rewrite the core system prompts (`mode-default.txt` and `mode-pro.txt`) to vastly improve the AI's internal response formatting, reasoning logic, and persona. The goal is to enforce a Claude-like editorial standard—dense, highly structured, relentlessly formatted (bold prefixes, explicit headers, strict code containerization), and clinically professional without unnecessary sycophancy or fluff.

## Strategic Reasoning
The previous `[ANSWER STYLE]`, `[THINKING PATTERN]`, and `[PERSONALITY]` sections were relatively brief (~1,300 chars) and did not provide sufficient rigid constraints for complex formatting. By expanding these to ~2,000-2,500 characters, we explicitly instruct the LLM on *how* to construct visual hierarchy (using headers, dividers, bold-prefix lists, and markdown tables) and *how* to calibrate its cognitive effort (from trivial facts to complex first-principles architectural breakdowns).

## Detailed Blueprint
Replaced three major sections in both `mode-default.txt` and `mode-pro.txt`:
1. **[CORE PERSONA & TONE]** (formerly `[PERSONALITY]`): Upgraded to emphasize "Honesty Over Politeness", "Zero Sycophancy," and contextual emotional intelligence. Pro mode emphasizes a "senior staff engineer / strategic consultant" dynamic.
2. **[ANSWER STYLE & FORMATTING ARCHITECTURE]** (formerly `[ANSWER STYLE]`): Expanded heavily to enforce editorial scannability, mandatory markdown headings, the "Bold-Prefix Pattern" for lists, strict containerization for code/technical artifacts, and an aggressive Anti-Pattern Checklist (no preamble/postamble/filler).
3. **[COGNITIVE FRAMEWORK & THINKING PATTERN]** (formerly `[THINKING PATTERN]`): Refined rules on how to handle ambiguity, calibrate cognitive effort based on problem difficulty, and deliver objective pushback when the user presents flawed logic.

## Operational Trace
- Read the current bounds of the `mode-default.txt` and `mode-pro.txt` files to preserve the internal `# SYNC BLOCK` constraints.
- Drafted new content targeting ~2,300 characters per section to maximize LLM behavioral adherence.
- Deployed `multi_replace_file_content` to seamlessly overwrite the legacy sections in both local `.txt` documents.

## Status Assessment
Complete. The local files `mode-default.txt` and `mode-pro.txt` have been directly updated with the new, highly detailed system prompts. The user can now copy these values into the UI to immediately benefit from the enhanced Claude-like response structuring.
