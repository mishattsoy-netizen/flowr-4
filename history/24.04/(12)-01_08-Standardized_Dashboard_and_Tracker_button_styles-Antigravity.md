User request: "does these buttons have same style and animations as nav buttons?" (referring to Dashboard/Tracker)

## 1. Objective Reconstruction
The user inquired about the stylistic and behavioral parity between the top-level navigation buttons (Dashboard, Tracker) and the individual list items (Notes, Folders) in the sidebar. Upon investigation, they did not match, so the objective was to unify them.

## 2. Strategic Reasoning
- **Interaction Consistency**: All primary navigation should feel identical to the touch. By adding the `.sidebar-item-row` class to the Dashboard and Tracker buttons, they now trigger the same soft `0.99` scale animation as the rest of the sidebar.
- **Visual Alignment**: The top buttons were previously using `radius-small` (5px), while list items used `radius-8` (8px). Aligning them to 8px creates a more cohesive visual hierarchy where all primary interactive "rows" share the same corner language.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`: The rendering logic for both expanded and collapsed sidebar states.
- **Plan**:
  - Add the `.sidebar-item-row` class to Dashboard and Tracker buttons in both expanded and collapsed views.
  - Update expanded buttons to use `rounded-[var(--radius-8)]` instead of `radius-small`.

## 4. Operational Trace
1. Modified `Sidebar.tsx` (Expanded View):
   - Added `.sidebar-item-row` to Dashboard and Tracker buttons.
   - Changed rounding from `radius-small` to `radius-8`.
2. Modified `Sidebar.tsx` (Collapsed View):
   - Added `.sidebar-item-row` to Dashboard and Tracker icons.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Primary navigation is now fully standardized. Every main button in the sidebar now has the same 8px corners and satisfying tactile click effect.
- **Recommendation**: None.
