User request: "wait something just happened and fade out appeared again everywhere"

### 0. Date and time of the request
12.05.2026 22:39

### 1. User request
"wait something just happened and fade out appeared again everywhere"

### 2. Objective Reconstruction
Fix the regression where the fade-out effect was appearing on all truncated elements, even those that fit perfectly within their containers.

### 3. Strategic Reasoning
The previous attempt used a negative threshold to trigger the fade "early." However, in modern web layouts, many elements (like buttons, tabs, and auto-sized cells) have a `scrollWidth` exactly equal to their `clientWidth`. A negative threshold causes these "perfect fits" to trigger the overflow state. Reverting to a strict `scrollWidth > clientWidth` check ensures the fade only appears when content is actually being hidden.

### 4. Detailed Blueprint
- Update `checkOverflow` in `FadeTextObserver.tsx` to use strict inequality without any negative buffer.

### 5. Operational Trace
- Modified `src/components/ui/FadeTextObserver.tsx` to set `overflowing = el.scrollWidth > el.clientWidth`.

### 6. Status Assessment
- **Completed**: Unnecessary fades on tabs and short text are removed.
- **Verified**: The fade will still appear on any text that is truly clipped by its container.
