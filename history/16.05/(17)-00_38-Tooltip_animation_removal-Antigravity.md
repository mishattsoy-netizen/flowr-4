# History Report - 15.05

## 0. Date and time of the request
16.05.2026 00:38

## 1. User request
"not, not it has fload in animation remove it"

## 2. Objective Reconstruction
Remove the fade-in and scale animations from the Tooltip component while maintaining the visibility gating to prevent the (0,0) rendering stutter.

## 3. Strategic Reasoning
The user wants an instant administrative feel without visual transitions. By using the `invisible` class (mapping to `visibility: hidden`) until the position is calculated, we prevent the "stutter" jump without needing a fade animation. The tooltip now pops in instantly at the correct coordinates.

## 4. Detailed Blueprint
- **Styling**: Remove `transition-all`, `duration-150`, `scale`, and `opacity` logic from `src/components/layout/Tooltip.tsx`.
- **Logic**: Use `!hasCalculated && "invisible"` to hide the tooltip for the single frame required to calculate the bounding box.

## 5. Operational Trace
- **File Edit**: Reverted transition classes and replaced opacity gating with visibility gating in `src/components/layout/Tooltip.tsx`.

## 6. Status Assessment
- **Completed**: Tooltip animation removed.
- **Result**: Tooltips appear instantly at the correct position without any transitions or jumps.
