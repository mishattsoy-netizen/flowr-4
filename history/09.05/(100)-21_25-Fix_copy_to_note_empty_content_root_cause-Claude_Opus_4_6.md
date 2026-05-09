User request: "content still not coppying, only simple tables @[/root-cause-tracing]"

## Objective Reconstruction
The "Copy to Note" / "Create Note" feature from chat was still only showing tables. All other block types (headings, paragraphs, lists, code blocks, quotes) were created with empty content — showing placeholder labels like "Title", "Heading", "List item..." instead of actual text.

## Strategic Reasoning
Applied root-cause tracing backwards through the rendering pipeline:

1. **Parser output** (`parseMarkdownToBlocks`) — CORRECT: produces blocks with `content` strings
2. **Store persistence** (`addEntity`/`updateEntityContent`) — CORRECT: stores blocks as-is
3. **Block rendering** (`BlockRenderer.tsx`) — **ROOT CAUSE FOUND**

The contentEditable div gets its content via a `useEffect` that checks:
```js
if (block.content !== lastTypedContent.current) {
    contentRef.current.innerHTML = block.content;
}
```

But `lastTypedContent` was initialized to `block.content`:
```js
const lastTypedContent = useRef(block.content);
```

On the very first render, `block.content === lastTypedContent.current` is always TRUE, so the guard condition fails and `innerHTML` is NEVER set. The contentEditable div stays empty and shows placeholder text.

**Why tables survived:** Table blocks use a completely separate render path with JSX `{cell}` children (not contentEditable), so they don't depend on this useEffect.

**Why user-typed content works:** When users type into the editor, `handleInput` fires → `onUpdate` → state changes → re-render. The ref and state stay in sync because the user is the source of truth.

## Detailed Blueprint
Single-line fix in `BlockRenderer.tsx` line 73:
- Changed `useRef(block.content)` → `useRef<string | null>(null)`
- Now on first render, `block.content !== null` is TRUE, so `innerHTML` gets set

## Operational Trace
- Traced from `handleCopyToNote` → `parseMarkdownToBlocks` → `addEntity` → `BlockRenderer`
- Confirmed parser output is correct (content strings populated)
- Confirmed store passes blocks through unchanged
- Found the initialization guard bug in BlockRenderer's useEffect/useRef interaction

## Status Assessment
Fixed. All block types (headings, body text, lists, code, quotes) should now render their content when created programmatically. This also fixes any other scenario where blocks are created with pre-populated content (e.g., apply-note from AI, template insertion).
