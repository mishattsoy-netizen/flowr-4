User request: "fix three button on the right the last one doesnt fit in the model row container make them fit but dont change them"

### 0. Date and time of the request
16.05.2026 02:15

### 1. User request
"fix three button on the right the last one doesnt fit in the model row container make them fit but dont change them"

### 2. Objective Reconstruction
Resolve horizontal overflow in the model router rows. Specifically, ensure that the right-side controls (RPD, provider dot, routing sliders, and options dots) fit within the card container without being cut off on narrow screens, while maintaining the existing design of the buttons themselves.

### 3. Strategic Reasoning
The overflow was caused by a combination of fixed widths and gaps that exceeded the available space in a 3-column grid layout. To fix this without changing the appearance of the buttons, I:
1. Reduced the spacing (`gap-2` to `gap-1`) between the right-side icons to save 12px.
2. Narrowed the RPD display column (`w-16` to `w-12`) to save another 16px.
3. Slightly adjusted the model name column (`w-[200px]` to `w-[190px]`) to give the controls more room to breathe.

These surgical adjustments provide ~38px of extra horizontal clearance, which prevents the "triple dot" button from being pushed off the edge of the card.

### 4. Detailed Blueprint
- **File**: `src/components/admin/RouterManager.tsx`
- **Changes**:
    - Update model ID container width from `w-[200px]` to `w-[190px]`.
    - Update right-side buttons container gap from `gap-2` to `gap-1`.
    - Update RPD display container width from `w-16` to `w-12`.

### 5. Operational Trace
- Edited `src/components/admin/RouterManager.tsx`:
    - Modified line 706: changed `w-[200px]` to `w-[190px]`.
    - Modified line 720: changed `gap-2` to `gap-1`.
    - Modified line 722: changed `w-16` to `w-12`.

### 6. Status Assessment
- The buttons now fit within the row container even in narrow grid columns.
- The design of the individual buttons and icons remains unchanged.
- Truncation of long model names occurs slightly earlier to prioritize control visibility.
