User request: "chnage openrouter model provider to same style as regular provider button. sware icon button that opens popup with ability to select saved providers or add new one"

### Objective Reconstruction
Refactor the OpenRouter custom target provider input in the Admin Router UI from a text input inside the Model ID column to a sleek square icon button next to the regular ProviderSelector dot. When clicked, this button opens a floating popup modal where users can select from a curated list of saved OpenRouter routing providers or add their own custom provider slugs (persisted in local storage).

### Strategic Reasoning
- **Premium UI Aesthetics:** Removing the text input field from the model selector column and representing it as a square settings icon button aligns perfectly with the visual density and clean design language of the regular provider selector dot.
- **Convenient Selection & Persistence:** Users can easily click to choose from prominent OpenRouter backends (e.g., google, deepseek, siliconflow, groq, etc.) or type any custom slug. Custom slugs are persisted locally in `localStorage` for future use.

### Detailed Blueprint
- **New Component:** Create `src/components/admin/OpenRouterRoutingProviderSelector.tsx` to handle the button state, popup portal rendering, list of standard backends, custom backend addition, and local storage persistence.
- **Router UI update:** Replace the `<input>` element inside `RouterManager.tsx`'s model column with `<OpenRouterRoutingProviderSelector>` positioned right next to the standard `<ProviderSelector>` component on the right side of the row.

### Operational Trace
1. **Component Created:** Built [OpenRouterRoutingProviderSelector.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/OpenRouterRoutingProviderSelector.tsx) with a compact `w-6 h-6` square button rendering a `Settings2` icon, a searchable list of default backends (google, deepseek, together, etc.), and custom additions.
2. **Integrated into Router Manager:**
   - Imported the selector in [RouterManager.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/RouterManager.tsx).
   - Removed the text input field from the Model ID column.
   - Inserted the new custom routing provider selector inside the right-hand action container next to `ProviderSelector`.

### Status Assessment
- **Completed:** The OpenRouter custom provider selector has been fully upgraded to a gorgeous, premium square icon button with a list and search/add capability.
