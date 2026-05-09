User request: "fix ** in notes, font usage must be same as in the chat, crimson, dm sans and dm mono"

## Objective Reconstruction
Fix two issues: (1) raw `**bold**` markdown syntax showing as literal text in note blocks instead of rendering as bold, and (2) apply Crimson Text, DM Sans, and DM Mono fonts to the note editor to match the chat's typography.

## Strategic Reasoning
The `**bold**` problem had two layers:
1. The `inlineMarkdownToHtml` converter was NOT applied to heading content — only body/list/quote blocks. AI models frequently wrap heading text in `**markers**`, causing raw syntax display.
2. The note editor's contentEditable div used Tailwind `font-bold`/`font-semibold` classes but no explicit font-family, defaulting to the browser's sans-serif instead of Crimson Text.

Font matching follows the chat's established pattern:
- Crimson Text 700 for headings (title/heading)
- Crimson Text 600 for subheadings
- Crimson Text 500 at 17px for body/list/quote text
- DM Mono via `font-mono` class for code blocks

## Detailed Blueprint
### Files Modified
1. **BlockRenderer.tsx** — Added `getFontStyle()` helper, applied to contentEditable `style` prop
2. **markdownToBlocks.ts** — Applied `inlineMarkdownToHtml` to heading content
3. **store.helpers.ts** — Applied `inlineToHtml` to heading content

## Operational Trace
### BlockRenderer.tsx
- Removed `font-bold`/`font-semibold` from `getStyleClasses` (now in `getFontStyle` as inline style)
- Added `getFontStyle(style)` that returns `{ fontFamily, fontWeight, fontSize }` per block style
- Applied via spread to the contentEditable div's style prop

### Both markdown parsers
- All heading blocks (`#`, `##`, `###`, `####`) now pass content through `inlineToHtml`/`inlineMarkdownToHtml`
- This converts `**bold**` → `<strong>bold</strong>` before storing

## Status Assessment
Fixed for new content. Existing notes with stored raw `**` will need to be regenerated or manually edited — the stored content is already plain text with asterisks, not retroactively convertible.
