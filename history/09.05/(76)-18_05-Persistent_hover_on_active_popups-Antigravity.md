User request: "when i open any popup, button that opened this popup should remain hover style like options button, this applies globally"

### Objective Reconstruction
Update the button styles for all dropdown/popup triggers in the router interface (the unified `RowOptionsDropdown` button, the `ProviderSelector` dot button, and the `OpenRouterRoutingProviderSelector` settings button) so that the active trigger button maintains its active hover background (`bg-white/5` and highlighted text/icon styles) for as long as its corresponding popup modal remains open.

### Strategic Reasoning
- **UI State Visual Feedback:** When a floating popup portal is open, keeping the trigger button in its hover/active state provides clear visual feedback connecting the open menu with the specific button that triggered it. This is a core UX best practice for context menus and select lists.

### Detailed Blueprint
- **Styling updates:**
  - Update `ProviderSelector.tsx` to apply `isOpen && "bg-white/5 text-bone-100"` to the trigger button class.
  - Update `OpenRouterRoutingProviderSelector.tsx` to apply `isOpen ? "bg-white/5 text-bone-100" : ...` to the trigger button and highlight the nested `Settings2` icon.

### Operational Trace
1. **Updated Provider Selector:** Added the active `isOpen` highlight class to the dot button trigger in [ProviderSelector.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/ProviderSelector.tsx).
2. **Updated OpenRouter Target Selector:** Added active `isOpen` highlights to both the button and the settings icon in [OpenRouterRoutingProviderSelector.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/OpenRouterRoutingProviderSelector.tsx).

### Status Assessment
- **Completed:** All popup trigger buttons now beautifully maintain their hover highlights whenever their associated popovers are active.
