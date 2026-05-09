User request: "not same style"

Objective Reconstruction:
The user indicated that the previous attempt to standardize admin popups was insufficient. The goal was to refine the `ModelDropdown` and `ProviderSelector` to achieve 1:1 visual parity with the global `ContextMenu.tsx`, specifically regarding padding, spacing, and iconography.

Strategic Reasoning:
I performed a deep audit of `src/components/layout/ContextMenu.tsx` to extract exact spacing values (`p-1.5`, `gap-[3px]`) and item layouts (`gap-2`, `px-3`, `py-1.5`). I then implemented these precise values in the admin components and added mirroring iconography (Cpu/Star icons) to match the visual language of the application's native menus.

Detailed Blueprint:
- Files involved:
    - `src/components/admin/ModelDropdown.tsx`
    - `src/components/admin/ProviderSelector.tsx`
- Changes:
    - Adjusted container padding to `p-1.5` and gap to `gap-[3px]`.
    - Adjusted item padding to `px-3 py-1.5` and gap to `gap-2`.
    - Added leading icons to model list items.
    - Aligned provider dots with the standard icon container size.

Operational Trace:
- Modified `ModelDropdown.tsx`: Added leading `Cpu` icons to models, used `Star` for favorites, and strictly matched the context menu padding/gap pattern.
- Modified `ProviderSelector.tsx`: Wrapped provider dots in a `w-4 h-4` container and updated item spacing to match the global standard.

Status Assessment:
Completed. The admin selection popups now exactly replicate the feeling and layout of the system's context menus.
