User request: Fix note page blocks (Enter key, list formatting, Copy to Note), transcript feature, status messages, prompt caching, list block visuals, selection toolbar

Completed: 15.05 at ~01:20

## Objective
Fix list blocks in notes (Enter key, nesting, formatting shortcuts), add full AI transcript feature, fix status messages to use admin settings, optimize prompt caching, polish list block hover/selected effects, replace editor toolbar with selection popup.

## Changes

### 1. ListBlock.tsx — Enter key and nesting fix (critical)
- **flattenRows**: Siblings treated as depth 0 (not 1) — multi-item lists no longer lose items after the first
- **nestRows**: `buildTree(..., 0)` instead of `1` — round-trip preserves sibling rows
- **Enter on empty last row**: `onExitTop()` converts list to text instead of inserting empty block below
- **Space shortcuts**: `#`, `##`, `###`, `[]`, `1.`, `>`, `"`, `---`, `-` formatting now works inside list items
- **ignoreNextInput ref**: One-shot gate prevents stale `onInput` race that overwrote new rows on Enter
- **ArrowUp/ArrowDown**: Navigate between rows via existing `focusRow`
- **Backspace at cursor-start**: On non-empty rows, cursor at position 0 steps back (unindent nested, merge with previous at depth 0)

### 2. ListBlock.tsx — BlockRenderer hover/selected effects
- Added `isFocused && "focused"` to list block wrapper
- Added `flex items-start w-full relative` + `bg-white/[0.01]` hover/selected classes to list block inner div
- Existing `selected-block` CSS now matches list blocks via `flex items-start` selector

### 3. ChatMessage.tsx — Status messages from admin settings
- Fallback status lookup now uses `activeStep.chain` to find admin-configured messages for ALL chain types
- Previously only checked `"THINKING"` or `"CLASSIFIER"` — all other chain types silently ignored

### 4. chainRouter.ts — Status messages for all chains + onStatus for text chains
- Added `STATUS_CATEGORIES` block: REGULAR, COMPLEX, CODING, TOOLS, ADVISOR, AUDIO, WEB_SEARCH now emit `onStatus` with admin-configured labels
- RESEARCH already had its own explicit `onStatus`

### 5. transcript.ts — Full AI transcript feature (new file)
- `buildTranscript()` assembles complete Markdown document per request
- Includes: prompt, full history, system prompts (global + internal + router), classification trace, chain traces (input/output/reasoning/duration per model), routing trace, reasoning/CoT, final response, citations, tokens, costs
- Saved to `transcripts/ai-transcript-{timestamp}.md` on every AI response
- Included in SSE event as `transcript_md` for client-side access

### 6. promptCache.ts — 30-min prompt caching
- `COMPILED_CACHE_TTL_MS`: 60s → 30min (global prompt cache)
- `HASH_CACHE_TTL_MS`: 3h → 30min (hash cache)
- `GEMINI_CACHE_TTL_SECONDS`: 3h → 30min (Gemini cache)
- New Tier 3: Per-chain internal prompts cache (`pipeline_internal_prompts`) with 30min TTL

### 7. compilePrompt.ts — use cached per-chain prompts
- `getInternalPrompt()` now checks in-memory cache before Supabase query
- Entire `pipeline_internal_prompts` JSON cached in one entry, covers all chain types

### 8. SelectionToolbar.tsx — new selection popup (replaces EditorToolbar)
- Appears near selected text in contentEditable blocks
- Inline formatting only: Bold, Italic, Underline, Strikethrough, Link, Highlight colors
- Positions above selection (falls below if not enough space)
- Closes on collapsed selection, Escape, outside click, or scroll
- `skipNextCheck` ref prevents closure on repeated button clicks
- Outside-click handler closes link/highlight sub-popups
- Replaces old EditorToolbar (undo/redo, block style, alignment, lists, full-width button removed)

## Files changed
- `src/components/editor/ListBlock.tsx` — Enter, nesting, arrows, Backspace, shortcuts, focus
- `src/components/editor/BlockRenderer.tsx` — list block hover/selected effects
- `src/components/assistant/components/ChatMessage.tsx` — status fallback, Copy Transcript button
- `src/lib/bot/chainRouter.ts` — onStatus for all chains, transcript_md on return
- `src/lib/bot/transcript.ts` — NEW transcript builder
- `src/app/api/ai/chat/route.ts` — file write + SSE transcript_md
- `src/lib/bot/promptCache.ts` — TTLs 30min + per-chain cache
- `src/lib/bot/compilePrompt.ts` — use cached per-chain prompts
- `src/components/editor/SelectionToolbar.tsx` — NEW selection popup
- `src/components/editor/NoteEditor.tsx` — replace EditorToolbar with SelectionToolbar
- `src/data/store.types.ts` — transcript_md on AIMessage
- `src/data/store.ts` — SSE parser captures transcript_md
- `.gitignore` — /transcripts/

## Logs & transcripts
- `transcripts/ai-transcript-*.md` — per-request full transcripts
- Message logs now show 20 per page (was 50)
