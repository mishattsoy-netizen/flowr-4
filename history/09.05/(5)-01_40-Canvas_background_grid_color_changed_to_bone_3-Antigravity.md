User request: "chnage color to bone 3"

## 1. Objective Reconstruction
The objective was to adjust the newly implemented canvas square grid pattern's line color from `rgba(233,233,226,0.04)` to `var(--bone-3)` (which is `rgba(233,233,226,0.03)` as defined in the global design system) to create a beautifully subtle, professional grid overlay.

---

## 2. Strategic Reasoning
- **Design Token Harmonization:** Using the `var(--bone-3)` CSS variable rather than a hardcoded rgba value ensures strict adherence to the application's central styling palette defined in `globals.css` and simplifies global color maintenance.
- **Improved Contrast and Clarity:** Lowering the grid line opacity from `0.04` to `0.03` (`bone 3`) reduces background visual noise, providing a more professional, premium canvas environment where blocks, connections, and shapes stand out beautifully.

---

## 3. Detailed Blueprint
- **`src/components/canvas/CanvasPage.tsx`**:
  - Update `backgroundImage` linear gradients to use `var(--bone-3)` for both horizontal and vertical mesh gridlines.

---

## 4. Operational Trace
- Replaced occurrences of `rgba(233,233,226,0.04)` with `var(--bone-3)` inside the inline `style` attribute of the viewport wrapper inside `CanvasPage.tsx`.

---

## 5. Status Assessment
- **Fully completed:** The canvas background square grid lines are styled with `var(--bone-3)`.
- **Verified in Browser:** A browser subagent successfully ran validation on `http://localhost:3000` to confirm that the square grid lines are subtly rendered with `var(--bone-3)` and integrate perfectly under the canvas elements.
