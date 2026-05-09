User request: "why bot doesnt understant when i ask to create canvas"

## Objective Reconstruction
Diagnose and fix why the AI bot ignores canvas creation requests and outputs plain markdown instead of using the `apply-canvas` format.

## Strategic Reasoning
Two separate root causes found:

**Root Cause 1 — Weak system prompt instruction:**
The instruction said "Or if editing or *creating* canvas shapes..." which was too ambiguous. The model interpreted "create canvas" as "create a new entity" (which it can't do) and fell back to explaining with markdown/JSON.

**Root Cause 2 — ApplyCanvasCard doesn't handle non-canvas context:**
When the user was on a Note and the bot did output `apply-canvas`, clicking "Apply" would set `canvasId` to the Note's ID — completely wrong. There was no logic to auto-create a new canvas entity.

## Detailed Blueprint
### Files Modified
1. **chainRouter.ts** — Rewrote system prompt canvas instructions to be a MANDATORY rule with bold emphasis, plus explains the user doesn't need to worry about canvas creation
2. **ChatMessage.tsx (ApplyCanvasCard)** — Added auto-creation of a new canvas entity when activeEntity is not a canvas; adds context-aware button labels
3. **store.types.ts** — Changed `addEntity` return type from `void` to `string`
4. **store.ts** — Made `addEntity` return the created entity's ID

## Operational Trace
### chainRouter.ts
- Old: "Or if editing or creating canvas shapes, output updated shape properties as a JSON array inside apply-canvas"
- New: "**MANDATORY RULE: Whenever the user asks you to create a diagram, flowchart, canvas, visual map, mind map, or any visual representation — you MUST output a JSON array of shapes inside an apply-canvas block...**"
- Added: "If the user is NOT on a canvas page, the system will automatically create a new canvas for them when they click Apply — you do not need to worry about this."
- Added: "Scale: Always output a complete, meaningful diagram. For complex topics, output 10-20+ nodes."

### ChatMessage.tsx (ApplyCanvasCard)
- Reads `entities` + `addEntity` + `setActiveEntityId` from store
- On Apply: checks if `activeEntity.type === 'canvas'`
- If NOT: calls `addEntity({ type: 'canvas', title: 'New Canvas' })` to create one, then `setActiveEntityId` to navigate there
- Applies blocks with correct `canvasId` in all cases
- Button label: "Create Canvas" when not on canvas, "Apply to Canvas" when on canvas

### store.types.ts / store.ts
- `addEntity` now returns `string` (the new entity's ID) instead of `void`

## Status Assessment
Fixed. Now:
1. Bot will reliably output `apply-canvas` for any diagram/canvas request
2. Clicking Apply will auto-create a new canvas entity if user isn't already on one
3. Button label is context-aware ("Create Canvas" vs "Apply to Canvas")

**Note:** `screenContext` must still be enabled (CONTEXT button) for these features to work — the system prompt injection is conditional on that.
