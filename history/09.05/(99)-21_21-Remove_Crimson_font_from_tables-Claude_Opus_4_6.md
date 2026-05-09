User request: "dont use crimson in tables in chat"

## Objective Reconstruction
Remove the Crimson Text serif font from bold and italic text when rendered inside markdown tables in the chat view, keeping the table's sans-serif aesthetic consistent.

## Strategic Reasoning
The `strong` and `em` markdown components applied `fontFamily: '"Crimson Text"'` unconditionally. Inside tables (which use `font-sans`), this created a jarring serif/sans-serif mix. Leveraged the existing `InTableContext` React Context to conditionally skip Crimson when rendering inside a table.

## Detailed Blueprint
- `strong` component: Added `useContext(InTableContext)` check; set `fontFamily` to `undefined` when inside a table.
- `em` component: Same treatment.

## Operational Trace
- Both `strong` and `em` components now consume `InTableContext` and conditionally apply Crimson Text only outside tables.

## Status Assessment
Complete. Table text now stays in the inherited sans-serif font family throughout.
