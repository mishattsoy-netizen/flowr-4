User request: "when i copy or create note from chat, the only content that is coppied is tables. fix it"

## Objective Reconstruction
Fix the "Copy to Note" / "Create Note" feature which was only copying table content from AI chat messages, losing all other content types (headings, paragraphs, lists, code blocks, quotes, etc.).

## Strategic Reasoning
Root cause: `handleCopyToNote` was passing raw `msg.content` directly to `parseMarkdownToBlocks()`. Raw content includes `<think>...</think>` tags, tool invocation XML, and reasoning pattern artifacts. The markdown block parser doesn't understand these non-markdown elements, so most lines either got swallowed by the `<think>` block or mismatched by regex patterns. Tables survived because they have clear pipe-delimited structure that parsed even inside noisy content.

The display pipeline already handles this correctly — `sanitizeContent()` strips `<think>` tags, tool tags, and reasoning patterns before rendering. The fix is simply to sanitize the content first before feeding it to the block parser.

## Detailed Blueprint
- In `ChatMessage.tsx`, line 264-266: Changed `handleCopyToNote` to first run `sanitizeContent(msg.content, false, false)` before passing to `parseMarkdownToBlocks()`.
- Using `false, false` for the loading/lastMessage flags ensures full sanitization without streaming-state artifacts.

## Operational Trace
- Traced call chain: `handleCopyToNote` → `parseMarkdownToBlocks(msg.content)` → note blocks
- Identified that `msg.content` was raw (unsanitized), while `targetContent` (used for display) goes through `sanitizeContent` first
- Applied the sanitization step before block parsing

## Status Assessment
Fixed. All content types (headings, paragraphs, lists, code blocks, quotes, tables) should now copy correctly to notes.
