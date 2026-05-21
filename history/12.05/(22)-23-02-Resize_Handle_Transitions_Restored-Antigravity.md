User request: "keep resize hande animations but make it 200ms"

## 1. User request
"keep resize hande animations but make it 200ms"

## 2. Objective Reconstruction
Restore the transitions for sidebar resize handles and the sidebar background color shifts, setting them to a 200ms duration.

## 3. Strategic Reasoning
While the user previously requested the removal of all animations, they identified the resize handles as an exception where transitions are preferred for a smoother interaction feel. I restored the 	ransition-all and 	ransition-colors classes specifically for these structural elements, standardizing the duration to 200ms.

## 4. Detailed Blueprint
- **File**: src/components/layout/Shell.tsx L232, L237, L264, L273, L282.
- **Action**: Re-add 	ransition-all duration-200 and 	ransition-colors duration-200 to the resize handle divs and the sidebar background div.

## 5. Operational Trace
- Modified src/components/layout/Shell.tsx to restore 200ms transitions on resize handles and sidebar background.

## 6. Status Assessment
Resize handle animations are now active with a 200ms duration. All other UI elements remain subject to the 0ms instant mandate.
