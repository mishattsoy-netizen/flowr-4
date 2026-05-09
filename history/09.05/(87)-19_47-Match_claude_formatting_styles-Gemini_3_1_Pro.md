User request: "make flowr same as claude"

## Objective Reconstruction
Revamp the AI's chat message markdown rendering engine to emulate Claude's structured editorial design. This involves enforcing typographic hierarchy for headings, containerizing code blocks with explicit top bars, fixing list indentation spacing, and improving the contrast and spacing of tables and dividers.

## Strategic Reasoning
The previous monolithic and flat styling approach of Flowr AI was identified as a readability bottleneck for complex responses. By updating `ChatMessage.tsx`'s `markdownComponents`:
- Custom `<h1/h2/h3>` components inject strict scaling and boldness.
- Non-inline `<code>` components are now conditionally wrapped in distinct `bg-black/40` rounded containers featuring a dedicated header bar with the language tag and a "Copy" utility action.
- Bulleted and numbered lists (`<ul>`, `<ol>`) are reinstated with standard external list markers (`list-disc`, `list-decimal`) and padding, removing the flawed internal flexbox structure.
- Tables (`<table>`) inherit stronger text styling, padding, and border isolation.

## Detailed Blueprint
Modified the `react-markdown` custom renderers in `src/components/assistant/components/ChatMessage.tsx`:
- **Headings**: Introduced specific Tailwind styling for `h1`, `h2`, `h3` utilizing `Crimson Text` weight 700 and scaled font sizes.
- **Lists**: Stripped custom flex alignments. Restored `list-outside` logic to `ul/ol` with defined margin/padding properties for native HTML indentation behavior.
- **Code Blocks**: Formatted `!inline` code block matching logic to return a comprehensive HTML layout containing a header row, `navigator.clipboard.writeText` copy functionality, and an `overflow-x-auto` code well.
- **Tables & Dividers**: Expanded vertical margins and border opacities on `hr` and `table` variants for better visual partitioning.

## Operational Trace
Injected the new component map via `multi_replace_file_content`. Validated the structure using the TypeScript compiler `npx tsc --noEmit` to ensure proper DOM element properties and React `any` typings were maintained.

## Status Assessment
Complete. Flowr AI's chat window will now parse Markdown strings into a highly structured, editorial UI resembling Claude's structural hierarchy, greatly enhancing scannability and context separation.
