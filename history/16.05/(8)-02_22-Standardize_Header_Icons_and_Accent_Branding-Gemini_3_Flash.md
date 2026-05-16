User request: "use accent for icons in header aswell and add incons too all cards that dont have icon"

### 0. Date and time of the request
16.05.2026 02:22

### 1. User request
"use accent for icons in header aswell and add incons too all cards that dont have icon"

### 2. Objective Reconstruction
1. Update the color of the category icons in the router card headers to use the theme's `accent` variable.
2. Ensure every router category (card) has a descriptive icon assigned to it.

### 3. Strategic Reasoning
This change continues the branding standardization effort by ensuring all visual elements in the router matrix follow the `accent` theme. Adding icons to the remaining categories (Advisor, Thinking, Regular, etc.) improves visual scanning and makes the interface feel more complete and professional.

### 4. Detailed Blueprint
- **File**: `src/components/admin/RouterManager.tsx`
- **Changes**:
    - Update `CATEGORY_ICONS` map to include icons for all active intent categories:
        - `THINKING` → `Sparkles`
        - `ORCHESTRATOR` → `Layers`
        - `CODING` → `MessageSquareCode`
        - `RESEARCH` → `GraduationCap`
        - `VISION` → `Eye`
        - `ADVISOR` → `ShieldCheck`
        - `IMAGE_UPSCALE` → `Maximize`
        - `PROMPT_EXPANSION` → `ArrowUpRight`
        - `IMAGE_NARRATION` → `Mic`
    - Update the `React.createElement` call in the header to use `text-accent` instead of a hardcoded hex.

### 5. Operational Trace
- Added necessary Lucide icon imports to `src/components/admin/RouterManager.tsx`.
- Expanded the `CATEGORY_ICONS` mapping to cover missing categories.
- Changed the icon class from `text-[#eea047]` to `text-accent`.

### 6. Status Assessment
- All router headers now feature icons.
- All header icons use the standardized `accent` color.
- UI consistency across the router matrix is significantly improved.
