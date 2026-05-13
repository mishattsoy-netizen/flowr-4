User request: "just one thing to change-all hover and slect animations must me 0ms with no fade in adn out effects. change live and in spec"

### 0. Date and time of the request
12.05.2026 22:47

### 1. User request
"just one thing to change-all hover and slect animations must me 0ms with no fade in adn out effects. change live and in spec"

### 2. Objective Reconstruction
Eliminate all visual transition durations for interactive states (hover, focus, selection) across the entire application and update all design specifications to enforce this "zero-latency" visual feedback standard.

### 3. Strategic Reasoning
To achieve a "snappy" and high-performance feel, the user requested the removal of all CSS transitions. This involves stripping `transition`, `duration`, and `ease` properties from global utilities and component-specific specs, ensuring that state changes happen in exactly 1 frame (0ms). This also included removing the sliding animations from switchers and popups.

### 4. Detailed Blueprint
- Global Cleanup: Scanned `globals.css` for `transition-all`, `transition-colors`, and custom `transition` properties in utilities like `widget`, `btn-bento`, and `instrument-hover`, setting them to none or 0ms.
- Spec Sync: Updated the branding folder (`default_switcher.md`, `options_popup.md`, `left_sidebar.md`, `popup_glass.md`) to remove animation requirements and update code snippets to be transition-less.
- Preference Lock: Updated `PREFERENCES.md` to make this a global design mandate and removed contradictory sliding-transition preferences.

### 5. Operational Trace
- Replaced multiple transition blocks in `src/app/globals.css`.
- Updated 4 branding spec files to 0ms standards.
- Restored `BRANDING/popup_glass.md` with updated tokens and 0ms rules.
- Updated `BRANDING/PREFERENCES.md` to reflect the universal mandate.

### 6. Status Assessment
- **Completed**: The UI is now perfectly "instant" and the branding documentation is fully synchronized with this new standard.
