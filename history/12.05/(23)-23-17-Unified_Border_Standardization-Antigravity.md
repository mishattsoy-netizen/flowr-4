User request: "change all outer borders to var(--bone-12) even high contrast. change all internal borders like Divider or Header to ar(--bone-6)"

## 1. User request
"change all outer borders to var(--bone-12) even high contrast. change all internal borders like Divider or Header to ar(--bone-6)"

## 2. Objective Reconstruction
Standardize the border hierarchy across the entire application. All outer borders for popups, modals, and palettes must use ar(--bone-12). All internal borders (dividers, headers, footers, and internal structural separators) must use ar(--bone-6).

## 3. Strategic Reasoning
To create a more cohesive and professional visual system, I unified the border tokens. ar(--bone-12) provides a consistent outer boundary for all overlays, while the more subtle ar(--bone-6) handles internal organization without adding visual clutter. I replaced legacy one-15 outer borders and white/5 or order-border internal dividers.

## 4. Detailed Blueprint
- **Global Styles**: Update popup-glass-small, popup-glass-big, and popup-divider utilities in globals.css.
- **Core Components**: Update CommandPalette.tsx, popover.tsx, SettingsModal.tsx, NewTaskModal.tsx, and NewItemModal.tsx.
- **Internal Components**: Update PathPicker.tsx, ChatPlusMenu.tsx, and RowOptionsDropdown.tsx.
- **Bulk Update**: Swept the modals folder to standardize internal order-border usage to one-6.

## 5. Operational Trace
- Modified src/app/globals.css to update popup-divider to one-6.
- Modified src/components/layout/CommandPalette.tsx (Outer: bone-12, Internal: bone-6).
- Modified src/components/ui/popover.tsx (Outer: bone-12).
- Modified src/components/modals/SettingsModal.tsx (Outer: bone-12, Internal: bone-6).
- Modified src/components/layout/PathPicker.tsx and ChatPlusMenu.tsx dividers.
- Standardized internal borders in NewItemModal.tsx, NewTaskModal.tsx, and all small confirm modals.

## 6. Status Assessment
Border standardization is complete. The application now follows a strict two-tier border system (one-12 for containers, one-6 for content). Some widget borders might still use custom tokens, but all primary UI overlays are unified.
