User request: "button now dont fit the row, reduce gaps between buttons"

### Objective Reconstruction
Refactor the flex container spacing inside the Admin Router UI model rows to reduce the horizontal gap between elements from `gap-2.5` (10px) to `gap-1.5` (6px). This ensures that the RPD counter, OpenRouter target provider selector (or spacer), standard provider selector dot, and unified more options dropdown fit comfortably and beautifully inside the row without expanding beyond its boundaries.

### Strategic Reasoning
- **Snug Visual Layout:** The addition of the OpenRouter targeted routing selector (or spacer) increased the overall width of row elements. Reducing the gap to `gap-1.5` packs the elements closer together, allowing them to fit perfectly without pushing out the options button or clipping the margins.

### Detailed Blueprint
- **Layout adjustment:** Modify the right-hand action container class in [RouterManager.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/RouterManager.tsx) to use `gap-1.5` instead of `gap-2.5`.

### Operational Trace
1. **Reduced Gap Width:** Updated `gap-2.5` to `gap-1.5` in the flex container inside `RouterManager.tsx`.

### Status Assessment
- **Completed:** Row element gaps have been reduced to `gap-1.5`, making all buttons snug, elegant, and perfectly sized for the row cards.
