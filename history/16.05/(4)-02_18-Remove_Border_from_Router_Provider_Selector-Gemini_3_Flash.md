User request: "remove border from this orange button"

### 0. Date and time of the request
16.05.2026 02:18

### 1. User request
"remove border from this orange button"

### 2. Objective Reconstruction
Remove the orange (accent) border from the OpenRouter routing provider selector button (the sliders icon) in the model row container.

### 3. Strategic Reasoning
The button was using `border border-accent/20` when a provider value was set. Removing this class makes the button look cleaner and less "heavy" compared to the other controls in the row, while still retaining its accent color for text and background.

### 4. Detailed Blueprint
- **File**: `src/components/admin/OpenRouterRoutingProviderSelector.tsx`
- **Changes**:
    - Remove `border border-accent/20` from the button's dynamic class list.

### 5. Operational Trace
- Edited `src/components/admin/OpenRouterRoutingProviderSelector.tsx`:
    - Modified line 109: changed `(value ? "text-accent bg-accent/5 border border-accent/20" : "text-bone-40")` to `(value ? "text-accent bg-accent/5" : "text-bone-40")`.

### 6. Status Assessment
- Border removed from the routing provider selector button.
- Button still highlights in orange when active/configured, but with a softer look.
