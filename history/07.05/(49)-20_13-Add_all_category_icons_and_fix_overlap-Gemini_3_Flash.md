User request: "add icons in the header to all chains"

### Objective Reconstruction
Complete the iconography for the router matrix by adding representative icons to all orchestration categories, including new and uninitialized ones.

### Strategic Reasoning
Visual consistency is key for a premium administrative interface. Syncing the icon mappings between the management components and the initialization buttons ensures a cohesive user experience.

### Detailed Blueprint
- **Components**: 
    - Update `RouterManager.tsx` with full icon mapping.
    - Update `AddCategoryButton.tsx` to display category-specific icons.
    - Clean up unused imports and constants in `page.tsx`.
- **UX**: Relocate the drag handle to the top-right to avoid overlapping the new icons.

### Operational Trace
- Updated `RouterManager.tsx` with icons for Vision, Coding, Research, Orchestrator, etc.
- Modified `AddCategoryButton.tsx` to use the same `CATEGORY_ICONS` registry.
- Moved `GripVertical` handle in `SortableRouterGrid.tsx` to `top-2.5 right-2.5`.
- Removed redundant `CATEGORY_ICONS` from `src/app/admin/router/page.tsx`.

### Status Assessment
- **Completed**: All orchestration chains now have distinct visual icons in their headers.
- **Improved**: "Add Category" buttons are now more informative with visual cues.
- **Fixed**: Drag handle no longer overlaps with title text.
