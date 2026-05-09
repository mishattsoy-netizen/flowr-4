User request: "fix prompt and preset popups are under other chain cards"

Objective Reconstruction:
The user reported that the 'System Prompt' and 'Chain Presets' popups in the Router Orchestration dashboard were being overlapped by neighboring chain cards. The goal was to ensure these popups appear on top of all other grid elements.

Strategic Reasoning:
My first approach was to raise the 'z-index' of the entire parent card when a popup is open. By giving the active card 'z-[100]', it should theoretically sit on top of other cards in the grid. I also added 'transition-all' to ensure smooth layering changes.

Detailed Blueprint:
- Files involved:
    - `src/components/admin/RouterManager.tsx`
- Changes:
    - Added dynamic 'z-[100]' to the card container when 'isPromptOpen' or 'isPresetOpen' is true.

Operational Trace:
- Modified `RouterManager.tsx`: Updated the main `div` className to include `(isPromptOpen || isPresetOpen) ? "z-[100]" : "z-0"`.

Status Assessment:
Partial success. This raised the card's priority, but as seen in subsequent feedback, it didn't fully resolve the clipping issue due to complex stacking contexts in the sortable grid.
