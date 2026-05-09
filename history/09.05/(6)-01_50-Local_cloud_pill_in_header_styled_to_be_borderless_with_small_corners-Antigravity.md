User request: "change local cloud pill style in header, remove borders and use small corners"

## 1. Objective Reconstruction
The objective was to update the styling of the cloud sync / local-only toggle pill in the header area (`HeaderBar`) to have small corners (matching the custom toolbar buttons) and remove all border treatments, creating a cleaner, borderless, and more visually integrated header element.

---

## 2. Strategic Reasoning
- **Visual Harmonization:** Changing the pill rounding from `rounded-full` (large capsule) to `rounded-[var(--radius-small)]` matches the surrounding tab elements and toolbar controls, unifying the layout.
- **De-cluttering:** Removing borders around the active and inactive states of the pill prevents visual clutter, allowing the muted background color of the pill (`var(--bone-6)`) to naturally define the element bounds.

---

## 3. Detailed Blueprint
- **`src/components/layout/HeaderBar.tsx`**:
  - Locate the cloud toggle `<button>` inside the save status section.
  - Swap the `rounded-full` rounding class for `rounded-[var(--radius-small)]`.
  - Remove all border-related Tailwind classes (`border`, `border-accent/20`, and `border-[var(--bone-10)]`).

---

## 4. Operational Trace
- Edited `HeaderBar.tsx` using `replace_file_content` to apply the cleaner, borderless style:
  ```typescript
  "flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-small)] transition-all",
  cloudSyncEnabled 
    ? "bg-accent/10 text-accent" 
    : "bg-[var(--bone-6)] text-[var(--bone-40)] hover:text-[var(--bone-100)]"
  ```

---

## 5. Status Assessment
- **Fully completed:** The local cloud sync pill is beautifully styled as requested.
- **Verified in Browser:** A browser subagent navigated to an active canvas page to capture and confirm that the pill renders borderless and with small corners, blending seamlessly into the UI.
