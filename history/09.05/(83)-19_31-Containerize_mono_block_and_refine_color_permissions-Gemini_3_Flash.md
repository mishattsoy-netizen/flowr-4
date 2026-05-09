User request: "change mono block style, it should ook like text block with filled bacgkround, so whole block acts like container/card same as table block. also dont color option for this type of blocks(database, simple tables, Media blocks, embed blocks...)"

## Objective Reconstruction
1. Redesign the `mono` text style into a fully encapsulated container block card resembling structural layouts like database tables.
2. Restrict user access to foreground/background coloration tools for structural container block archetypes (e.g., Table, Database, Media, Embed, and the upgraded Mono container).

## Strategic Reasoning
- In `BlockRenderer`, moving style encapsulation from the inner text span up to the outer `flex-1` flexbox layer creates consistent block-level boundary boxes matching high-level components. This unifies aesthetics across structural blocks without fracturing semantic hierarchy.
- Inside `BlockOptionsMenu`, generating an array blacklist of `isStructuralBlock` definitions efficiently handles rendering gates for the color popover trigger without bloating internal conditional states.

## Detailed Blueprint
- Modify `BlockRenderer.tsx`: Replaced conditional class lists on the primary content wrapper to capture and render a subtle bordered/tinted background specifically when `effectiveStyle === 'mono'`. Trimmed redundant inner background styles.
- Modify `BlockOptionsMenu.tsx`: Integrated dynamic lookup array to target specific high-level block types and wrapped the logic-derived `Color` menu sub-nav button in an exclusion wrapper.

## Operational Trace
- Applied multiple discrete file updates across rendering components.
- Finalized code with TypeScript regression validation to prevent syntax disruption.

## Status Assessment
Fully operational. `mono` is robustified into a card container view, and strict blocking prevents unintended coloration operations on component wrappers.
