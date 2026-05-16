User request: "use accent"

### 0. Date and time of the request
16.05.2026 02:20

### 1. User request
"use accent"

### 2. Objective Reconstruction
Revert all hardcoded orange hex colors and specific amber tokens back to the theme's `accent` CSS variable across the `RouterManager` and `OpenRouterRoutingProviderSelector` components.

### 3. Strategic Reasoning
The user preferred using the global theme variable `--accent` rather than specific hex codes or Tailwind tokens. This ensures that the UI remains themeable and consistent with the rest of the application's design system. I reverted the Keys/Models toggle, Temp input, OpenRouter provider selector, and the Paid Model icon to use the `accent` utility classes.

### 4. Detailed Blueprint
- **Files**:
    - `src/components/admin/RouterManager.tsx`
    - `src/components/admin/OpenRouterRoutingProviderSelector.tsx`
- **Changes**:
    - Replace all instances of `#eea047` and `amber-400` in the router controls with `accent`.
    - Restore the original `accent` opacity levels (10% background for pills, 5% for the provider selector).

### 5. Operational Trace
- Edited `src/components/admin/RouterManager.tsx`:
    - Reverted `fallbackMode` colors to `bg-accent/10 text-accent`.
    - Reverted Temp input color to `text-accent`.
    - Reverted Paid Model icon to `bg-accent/10 border-accent/20` and `text-accent`.
- Edited `src/components/admin/OpenRouterRoutingProviderSelector.tsx`:
    - Reverted active provider colors to `text-accent bg-accent/5`.

### 6. Status Assessment
- All router controls are now correctly using the theme's `accent` variable.
- UI consistency is maintained through centralized theme tokens.
