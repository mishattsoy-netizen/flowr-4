User request: "add ability to delete existing providers"

### Objective Reconstruction
Add functionality to allow users to delete any custom routing provider they have previously added to the OpenRouter targeted routing list. A sleek hover action button (using the `X` icon) is displayed next to each custom provider in the popover list, allowing users to remove it instantly from the locally-persisted list and reset the row configuration if that provider was currently selected.

### Strategic Reasoning
- **Data Lifecycle Management:** Giving users the ability to add custom items also necessitates giving them the ability to delete them so they can clean up typos, obsolete backends, or unused entries, thereby preventing clutter and maintaining an optimized experience.
- **Micro-Interactions on Hover:** Showing the delete button only on hover (`opacity-0 group-hover/item:opacity-100`) keeps the list clean, uncluttered, and premium-feeling while maintaining high discoverability.

### Detailed Blueprint
- **Import update:** Import `X` from `lucide-react` inside `OpenRouterRoutingProviderSelector.tsx`.
- **State function handler:** Add `handleDeleteCustom(p)` to filter out the provider from `customProviders` state and update `localStorage`.
- **Render adjustment:** Wrap the provider button inside a flex container. If the provider is part of `customProviders`, render a small, styled `X` delete button that appears on hover and calls `handleDeleteCustom`.

### Operational Trace
1. **Added Import:** Added `X` import inside `OpenRouterRoutingProviderSelector.tsx`.
2. **Added Delete Handler:** Implemented the `handleDeleteCustom` state function to filter list and save to `localStorage`.
3. **Structured Hover Actions:** Nested list items inside a `group/item` row and displayed the delete trigger dynamically on custom provider elements.

### Status Assessment
- **Completed:** Users can now add and delete custom OpenRouter routing providers at will with a premium, sleek hover action.
