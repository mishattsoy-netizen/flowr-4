User request: "use it for all switches, selection boxes and progressbars"

## Objective Reconstruction
The objective was to unify the custom brand blue color `#2A78D6` (`var(--brand-blue)`) across all switches, active selection/drawing marquee frames, and progress indicator bars in the application.

## Strategic Reasoning
Establishing a unified design language is essential for a premium user experience. By linking all interactive feedback systems (toggles, marquee selectors, and loading/context progress indicators) to the identical custom brand blue `#2A78D6` (RGB `42, 120, 214`), the interface gains immense visual clarity, professional polish, and branding cohesion.

## Detailed Blueprint
- **Switches ([globals.css](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/app/globals.css))**: Modify the active state for `.toggle-switch` to use background and border colors of `#2A78D6`.
- **Marquee & Previews ([CanvasPage.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/canvas/CanvasPage.tsx))**: Change RGB colors from orange (`rgba(211,143,54,...)`) to custom brand blue (`rgba(42,120,214,...)`) for active multi-selection marquee fields and interactive drawing shape previews.
- **Progress Indicators ([AIAssistant.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/assistant/AIAssistant.tsx))**: Swap circular SVG progress indicators and memory token bar elements to use `text-brand-blue` and `bg-brand-blue`.
- **Mock Progress Bars ([SettingsModal.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/modals/SettingsModal.tsx))**: Replace accent mock-up lines with `bg-brand-blue/30`.

## Operational Trace
1. **Updated Switch Styles**: Changed active switch background and border color definitions to `#2A78D6` inside `globals.css`.
2. **Unified Canvas Elements**: Changed orange marquee frame values and drawing preview shapes to brand blue (`rgba(42, 120, 214)`) in `CanvasPage.tsx`.
3. **Unified AI Progress Indicators**: Swapped orange context bars to active brand blue inside `AIAssistant.tsx`.
4. **Updated Mock Progress Bars**: Changed mock-ups inside theme selections to use `bg-brand-blue/30` inside `SettingsModal.tsx`.
5. **Verified Typescript Compilation**: Validated that `npx tsc --noEmit` compiles cleanly with 0 errors.

## Status Assessment
- **Unified Branding Active**: All switches, selection frames, drawing previews, and progress bars now run beautifully on the premium `#2A78D6` brand blue theme.
- **Codebase Stability**: 100% compilation successful.
