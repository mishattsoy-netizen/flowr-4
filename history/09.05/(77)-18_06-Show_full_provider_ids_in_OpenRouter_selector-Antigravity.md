User request: "show full provider id's"

### Objective Reconstruction
Refactor the OpenRouter target provider popup selector to display the exact full, lowercase API provider identifiers (e.g. `google-ai-studio`, `deepseek`, `siliconflow`, etc.) rather than capitalized and abbreviated human-readable titles.

### Strategic Reasoning
- **API Schema Accuracy:** Displaying the exact API provider slug (such as `google-ai-studio` instead of `google` or capitalized "Google") makes it clear to the user exactly what string is being used in the payload and eliminates any confusion about what targeted routing parameter is sent to the backend.

### Detailed Blueprint
- **Constant update:** Change the default google entry inside `DEFAULT_ROUTING_PROVIDERS` inside `OpenRouterRoutingProviderSelector.tsx` from `'google'` to `'google-ai-studio'`.
- **Styling update:** Remove the `capitalize` text transformation class from the span rendering the provider ID to display the raw lowercase slugs exactly.

### Operational Trace
1. **Updated Default List:** Changed `'google'` to `'google-ai-studio'` inside `OpenRouterRoutingProviderSelector.tsx`.
2. **Removed Capitalization Class:** Removed `capitalize` from the span rendering the provider slug in the popup items list.

### Status Assessment
- **Completed:** OpenRouter routing provider popover now beautifully lists and displays the full lowercase API provider IDs.
