User request: "text is not centered in these buttons fit it" and "use orange accent color only for buttons with text, dont use it for icons, numbers ot turn off and on buttons"

Objective Reconstruction:
Address two visual polish issues in the admin UI: centering text within action buttons and refining the use of the orange accent color to be more intentional and restricted to primary text actions.

Strategic Reasoning:
For text centering, I audited the button styles and applied flexbox centering with standard height constraints. For the color refinement, I identified components using 'text-accent' or 'bg-accent' on non-text elements (like power icons or ID numbers) and reverted them to neutral/bone colors, reserving the vibrant accent only for labels and buttons that explicitly require user attention.

Detailed Blueprint:
- Files involved:
    - `src/components/admin/RouterManager.tsx`
    - `src/components/admin/ModelDropdown.tsx`
- Changes:
    - Standardized button heights and flex centering.
    - Replaced 'text-accent' with neutral colors on power toggles and model ID tags.

Operational Trace:
- Modified `RouterManager.tsx`: 
    - Updated Save buttons to use `h-7 flex items-center justify-center`.
    - Removed accent colors from the power toggle and the temperature display.
- Modified `ModelDropdown.tsx`: 
    - Updated model list items to use neutral tags unless selected.

Status Assessment:
Completed. The UI is now more visually balanced with centered text and a cleaner, more neutral color palette.
