User request: "fix openrouter row layout"

### Objective Reconstruction
Align the action buttons and indicator dots across all router rows so that non-OpenRouter rows match the horizontal layout of OpenRouter rows perfectly. This is accomplished by rendering a fixed-size invisible spacer block (`div` with class `w-6 h-6 shrink-0`) in place of the `<OpenRouterRoutingProviderSelector>` button when the row is powered by a different provider.

### Strategic Reasoning
- **Layout Alignment Symmetry:** In the previous design, rows with non-OpenRouter providers lacked the target provider settings button. This caused the provider dot and the three-dots options button to shift leftwards, resulting in jagged horizontal alignment. Introducing an invisible matching spacer keeps elements in every row perfectly horizontally aligned.

### Detailed Blueprint
- **Layout refactoring:** Update [RouterManager.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/RouterManager.tsx) to use a ternary operator for the targeted routing selector block:
  - If `provider === 'openrouter'`: render `<OpenRouterRoutingProviderSelector ... />` (width `w-6 h-6`).
  - Otherwise: render `<div className="w-6 h-6 shrink-0" />`.

### Operational Trace
1. **Applied Conditional Spacer:** Replaced the short-circuit evaluation conditional block for the target selector with a ternary operator rendering the selector or an empty `w-6 h-6` spacer block.

### Status Assessment
- **Completed:** OpenRouter row alignment is perfectly resolved, and all action columns across rows align with pristine symmetry.
