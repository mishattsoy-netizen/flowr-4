User request: "show shortcuts in the lists"

## Objective Reconstruction
The user requested that context menu items within the Editor's Slash Command Menu explicitly display their trigger keyboard shortcuts/markdown prefixes (e.g., # for Title, --- for Divider). This creates a discoverability vector allowing users to learn efficient block generation while browsing the command list visually.

## Strategic Reasoning
Since the menu component and shortcuts definitions were separate, the `SlashCommand` interface needed a new `shortcut` metadata string property. To keep the shortcuts conceptually aligned with live editor triggers, they were extracted directly from existing logic in `BlockRenderer.tsx`. A modern, high-density split layout was adopted for UI integration (using space-between, flex shrink safeguards, and a custom styling wrapper to render discrete shortcut badges on the extreme right edge of hover rows).

## Detailed Blueprint
1. Locate SlashCommandMenu.tsx and expand `SlashCommand` type interface.
2. Map appropriate trigger characters into defined command objects (e.g., `#`, `-`, `[]`, `/table`).
3. Refactor item rendering loop to employ a flex `justify-between` container.
4. Style sub-capsules utilizing `font-mono`, muted transparencies, and explicit containment metrics to prevent breaking standard list row density.

## Operational Trace
- Verified syntax compatibility in `SlashCommandMenu.tsx`.
- Altered standard `commands` list values to pass relevant string constants into shortcut fields.
- Updated `.popup-item` iteration render blocks to push a styled span anchor to the right-side flex boundary.
- Ran standard `npx tsc --noEmit` compile pass to guarantee absolute build safety.

## Status Assessment
Complete. Slash command entries now visually expose shortcuts aligned consistently against the trailing column. The code passes all structural validation checks.
