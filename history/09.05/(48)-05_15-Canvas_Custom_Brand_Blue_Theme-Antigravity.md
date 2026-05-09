User request: "add this color in the global css #2A78D6 and use it as only blue color for app elements"

## Objective Reconstruction
The objective was to register `#2A78D6` as the unified system brand blue color in the global styles, and apply it exclusively for all canvas selection outlines, hovered block borders, dragging/resizing states, and resize handles.

## Strategic Reasoning
Defining brand colors via a single CSS variable is a vital front-end architecture best practice. In Tailwind CSS v4, defining `--color-brand-blue: #2A78D6` inside `:root` automatically registers the color across the utility ecosystem (`border-brand-blue`, `text-brand-blue`, `bg-brand-blue`, etc.), ensuring full consistency and making style adjustments exceptionally clean.

## Detailed Blueprint
- **Global Styles ([globals.css](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/app/globals.css))**: Define `--color-brand-blue: #2A78D6` and `--brand-blue: #2A78D6` inside the `:root` pseudo-class.
- **Selection Outlines ([CanvasBlock.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/canvas/CanvasBlock.tsx))**: Swap all active `blue-500` classes to `brand-blue`.
- **Resize Handles ([ResizeHandle.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/canvas/ResizeHandle.tsx))**: Replace `border-blue-500` with `border-brand-blue`.

## Operational Trace
1. **Added CSS Variable**: Defined custom brand blue (`#2A78D6`) in `src/app/globals.css`.
2. **Unified Canvas Selection**: Replaced standard tailwind blue classes with unified `brand-blue` classes in `CanvasBlock.tsx`.
3. **Unified Resize Handles**: Replaced handle border classes with `border-brand-blue` in `ResizeHandle.tsx`.
4. **Verified Typescript Compilation**: Validated clean compilation with `npx tsc --noEmit`.

## Status Assessment
- **Unified Brand Blue**: Fully complete. The custom brand blue `#2A78D6` is now active and governs all interactive canvas highlights and resize handles.
- **Codebase Stability**: 100% compilation successful.
