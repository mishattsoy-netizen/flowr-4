User request: "make mode pupup same style as opthion popups"

Objective Reconstruction:
The user requested that the dropdowns and floating popups in the Admin Router Orchestration interface (e.g., model and provider selectors) be updated to match the visual style of the application's global "option popups" (context menus).

Strategic Reasoning:
To ensure UI consistency, I utilized the project's existing design tokens and utility classes (`popup-glass-small` and `popup-item`). This approach ensures that any future changes to the global popup style will automatically propagate to these admin elements, adhering to the "Brand Guardian" principle.

Detailed Blueprint:
- Files involved:
    - `src/components/admin/ModelDropdown.tsx`
    - `src/components/admin/ProviderSelector.tsx`
    - `src/components/admin/RouterManager.tsx`
- Changes:
    - Replace custom `bg-panel` containers with `popup-glass-small`.
    - Replace individual item styling with the `popup-item` utility.
    - Adjust corner radii from `16px`/`rounded-big` to the standard `12px` (`radius-regular`).

Operational Trace:
- Updated `ModelDropdown.tsx`: Applied `popup-glass-small` to the dropdown container and `popup-item` to the model list entries.
- Updated `ProviderSelector.tsx`: Applied `popup-glass-small` and standardized the provider items.
- Updated `RouterManager.tsx`: Standardized the floating **System Prompt** and **Preset Manager** panels to use the same glassmorphism and corner radius.

Status Assessment:
Completed. All admin "mode" selection popups now share the same visual DNA as the main application's context menus.
