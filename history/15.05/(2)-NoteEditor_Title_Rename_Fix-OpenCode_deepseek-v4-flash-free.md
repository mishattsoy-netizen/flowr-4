User request: "fix note title card rename mode shrinking to 1 row only when title has 2 rows"

Completed: 15.05 at ~19:30

## Objective
Fix the note title rename mode in NoteEditor.tsx where the textarea would shrink to 1 row when entering edit mode for a 2-line title.

## Root Cause
The `<textarea>` had `rows={1}` which rendered at 1-row height initially. The `autoResizeTitle` function only fired on `onInput` (typing), so the height only corrected after the user typed. The h1 had `line-clamp-2` showing 2 rows, but the textarea replacing it showed 1 row, causing a visual "shrinking" effect.

## Attempts
1. **useLayoutEffect** — called autoResizeTitle synchronously before paint. Still shifted because the textarea's `rows={1}` initial layout was already computed.
2. **contentEditable h1** — kept same DOM element, avoided swap. Broke React's controlled-input model and had issues.

## Final Fix
Changed `rows={1}` → `rows={2}` on the textarea. For a 2-line title, `rows={2}` matches the h1's `line-clamp-2` height exactly — no shrink, no visible shift. Auto-resize on input still handles when the user types more content.

## Files Changed
- `src/components/editor/NoteEditor.tsx` — rows={1}→{2}
