User request: "fix unneccessary fade out effect, the effect must be appiled only when text doesnt fit/hiding"

### 0. Date and time of the request
12.05.2026 22:32

### 1. User request
"fix unneccessary fade out effect, the effect must be appiled only when text doesnt fit/hiding"

### 2. Objective Reconstruction
Modify the global text truncation system to ensure that the fade-out gradient (mask-image) is only applied when text is actually overflowing its container, rather than being applied unconditionally to all truncated elements.

### 3. Strategic Reasoning
The app uses a `FadeTextObserver` component to detect overflow via `ResizeObserver`, but the CSS was applying the fade mask to all `.truncate` and `.text-fade` elements by default. By moving the mask-image rule to a `[data-overflow="true"]` selector and ensuring the observer watches all relevant classes, we can achieve dynamic fading.

### 4. Detailed Blueprint
- Update `globals.css` to restrict `mask-image` to elements with `data-overflow="true"`.
- Update `FadeTextObserver.tsx` to observe `.truncate` and `.text-ellipsis` as well as `.text-fade`.
- Add a subpixel buffer (1px) to the overflow check to avoid flickering/unnecessary fades on nearly-fitting text.
- Mount `FadeTextObserver` in `RootLayout` since it was previously unmounted and inactive.
- Remove duplicate utility definitions in `globals.css`.

### 5. Operational Trace
- Edited `src/components/ui/FadeTextObserver.tsx` to expand class monitoring and add a 1px buffer.
- Edited `src/app/globals.css` to consolidate truncation styles and link the fade effect to the `data-overflow` attribute.
- Edited `src/app/layout.tsx` to import and mount `FadeTextObserver`.
- Removed duplicate `@utility text-fade` block at the end of `globals.css`.

### 6. Status Assessment
- **Completed**: Fade-out effect is now dynamic and only appears on overflowing text.
- **Improved**: System is more robust against subpixel rendering issues.
- **Fixed**: Enabled the previously inactive global overflow observer.
