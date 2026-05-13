User request: "what about super close to be clipped?"

### 0. Date and time of the request
12.05.2026 22:41

### 1. User request
"what about super close to be clipped?"

### 2. Objective Reconstruction
Address the edge case where text fits within the container but is so close to the boundary that it feels "cramped," potentially requiring a fade-out effect even without technical overflow.

### 3. Strategic Reasoning
Identified that adding a "near-miss" threshold causes auto-sizing elements (like tabs) to fade unnecessarily because their width matches their content width exactly. Reverting to strict overflow detection (`scrollWidth > clientWidth`) is the safest way to differentiate between "fits" and "clipped."

### 4. Detailed Blueprint
- Analyzed the conflict between auto-sizing containers and fixed-width containers.
- Decided to maintain strict overflow detection to avoid "fade everywhere" regressions.

### 5. Operational Trace
- Provided technical explanation of the `scrollWidth` vs `clientWidth` behavior in different layout contexts.

### 6. Status Assessment
- **Status**: Logic currently set to strict overflow.
- **Next Step**: Waiting for specific examples of "tight" fits that need a manual override or a smaller sub-pixel buffer.
