User request: "change note style so it looks like in the chat, list styles, fonts, text styles, create new button block, where i can connect links(like link pill in chat but in notes looks like button iwth 8px corners)"

## Objective Reconstruction
Match the note editor's visual appearance to the chat view's typography and styling, and create a new link/button block type with 8px corner radius for embedding clickable links in notes.

## Strategic Reasoning
The chat and note editor use different rendering engines (ReactMarkdown vs contentEditable), so direct code sharing isn't possible. Instead, matched the CSS values: same heading sizes (28/24/20px), same body text size (15px) and line-height (133%), same list spacing (0.3rem between items). For inline formatting, added an `inlineMarkdownToHtml` converter since the contentEditable div needs HTML, not raw markdown. The link block was designed as a standalone block type rather than an inline element, since the note editor's block architecture doesn't support inline block mixing.

## Detailed Blueprint
### Files Modified
1. **store.types.ts** — Added `'link'` to `BlockType` union and `linkUrl?: string` to `EditorBlock`
2. **BlockRenderer.tsx** — Updated heading/body/list styles, added link block renderer
3. **SlashCommandMenu.tsx** — Added "Link Button" command in Layout category
4. **NoteEditor.tsx** — Added `linkUrl` default in `createBlock` factory
5. **markdownToBlocks.ts** — Added `inlineMarkdownToHtml` converter for bold, italic, strikethrough, code, links
6. **store.helpers.ts** — Same inline formatting converter for the AI note generation parser

## Operational Trace
### Typography changes (BlockRenderer.tsx)
- `title`: `text-3xl` → `text-[28px]`, `leading-[1.3]` → `leading-snug`
- `heading`: `text-2xl` → `text-[24px]`, `leading-[1.3]` → `leading-snug`
- `subheading`: `text-xl` → `text-[20px]`, `leading-[1.3]` → `leading-snug`
- `body`: `text-base font-ui leading-[1.5]` → `text-[15px] leading-[133%]`

### List styling changes
- Bullet marker: `w-[6px] h-[6px] bg-accent` → `w-[5px] h-[5px] bg-bone-60`
- List item vertical padding: `py-0.5` → `py-[0.15rem]` for compact spacing

### Link block
- Renders as a button with favicon, editable label, external link icon
- 8px corners (`rounded-lg`)
- URL editor appears on hover
- Accessible via `/link` slash command

### Inline formatting converter
Both parsers now convert:
- `**bold**`/`__bold__` → `<strong>`
- `*italic*`/`_italic_` → `<em>`
- `~~strikethrough~~` → `<s>`
- `` `code` `` → `<code>`
- `[label](url)` → `<a>`

## Status Assessment
Complete. The note editor now visually matches the chat's typography hierarchy. The link block is functional with editable label and URL. Inline markdown formatting is preserved when copying chat content to notes.
