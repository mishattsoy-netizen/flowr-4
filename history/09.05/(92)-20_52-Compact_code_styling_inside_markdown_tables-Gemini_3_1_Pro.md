User request: "fix 4th row, mak it look better"

## Objective Reconstruction
Identify and rectify the rendering conflict in the chat message markdown table where code blocks inside table cells are rendered as massive, heavy containerized cards with headers. Transition to a compact, inline-influenced aesthetic for multiline code that seamlessly fits within the constraints of table row padding.

## Strategic Reasoning
- Standardizing parent-child styling relationship via static CSS doesn't work well for conditional structural components in React.
- Utilized a lightweight `InTableContext` React Provider to pass context down through the `ReactMarkdown` processing tree.
- The code renderer can consume this context to instantly detect nesting inside a `<table>` and gracefully downgrade full-width container cards into simple, background-rounded `code` blocks with proper `whitespace-pre-wrap` flow. This elegantly maintains functionality without the visual overhead.

## Detailed Blueprint
- Added `createContext`/`useContext` imports in `ChatMessage.tsx`.
- Initialized `InTableContext` at the module level.
- Wrapped the final rendering mapping of `table: ({ children })` with `<InTableContext.Provider value={true}>`.
- Inserted logic branch in `code: ({ node })` allowing it to render a specific compact snippet block instead of executing the card routine whenever `inTable === true`.

## Operational Trace
- Examined component definitions to isolate structural conflict.
- Configured context wrapper and hook deployment.
- Dispatched single non-contiguous chunk edit to propagate imports, variables, and component branches simultaneously.

## Status Assessment
Completed. Table layout hierarchy is strictly maintained. Code examples nested inside tables will now manifest as neat inline blocks without heavy bordering or header bars.
