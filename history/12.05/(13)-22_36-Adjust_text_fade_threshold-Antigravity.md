User request: "good! but also add it to texts that are super close to being hidden like in the example"

### 0. Date and time of the request
12.05.2026 22:35

### 1. User request
"good! but also add it to texts that are super close to being hidden like in the example"

### 2. Objective Reconstruction
Refine the text overflow detection to trigger the fade-out effect earlier—specifically when the text is nearing the edge of its container but hasn't technically overflowed yet. This provides a "breathing room" fade for tight fits.

### 3. Strategic Reasoning
By setting the threshold to `clientWidth - 5px`, we ensure that any text occupying more than the available width minus a 5px margin will trigger the `data-overflow="true"` attribute. Since the CSS mask starts fading 24px from the edge, this creates a soft, progressive disappearance for text that is nearly out of space.

### 4. Detailed Blueprint
- Modify `checkOverflow` in `FadeTextObserver.tsx` to use a 5px "near-miss" threshold.

### 5. Operational Trace
- Updated `src/components/ui/FadeTextObserver.tsx` to use `el.scrollWidth > el.clientWidth - 5`. (Initially set to 12px, then refined to 5px per user preference).

### 6. Status Assessment
- **Completed**: Text now fades gracefully when it gets within 5px of the container edge.
- **Improved**: The UI feels more polished as text no longer "cramps" against borders or icons before disappearing.
