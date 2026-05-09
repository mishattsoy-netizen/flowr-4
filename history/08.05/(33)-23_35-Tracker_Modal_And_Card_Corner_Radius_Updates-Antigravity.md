User request: "change tasks window corners to 16 and12 in the knban"

### 1. Objective Reconstruction
- Set the corner radius of the expanded task window (modal) in the Kanban board to exactly `16px`.
- Set the corner radius of the task cards (and dragging placeholders) in the Kanban board to exactly `12px`.

### 2. Strategic Reasoning
- Consistent corner roundedness is crucial for design systems to feel intentional and premium. Setting the modal container corners to `16px` and card corners to `12px` aligns perfectly with modern, sleek design aesthetics.

### 3. Detailed Blueprint
- **`TrackerPage.tsx`**: Change expanded task modal container from `rounded-[var(--radius-medium)]` to `rounded-[16px]`.
- **`TaskCard.tsx`**:
  - Change card container classes from `rounded-[16px]` to `rounded-[12px]`.
  - Change dragging placeholder container classes from `rounded-[var(--radius-medium)]` to `rounded-[12px]`.

### 4. Operational Trace
1. Updated `TrackerPage.tsx` to use `rounded-[16px]` on the modal container around line 237.
2. Updated `TaskCardUI` in `TaskCard.tsx` to use `rounded-[12px]` on the card container around line 52.
3. Updated `TaskCard` in `TaskCard.tsx` to use `rounded-[12px]` on the dragging placeholder container around line 193.

### 5. Status Assessment
- **Completed**: Adjusted all corners as requested to exactly `16px` for the expanded window and `12px` for the cards.
