User request: "remove there warnigns and errors"

### 0. Date and time of the request
16.05.2026 02:21

### 1. User request
"remove there warnigns and errors"

### 2. Objective Reconstruction
Remove debug-related status pills and warning messages from the router category headers. Specifically, remove the "401?" Cloudflare warning and the "Free Pick" recommendation pill.

### 3. Strategic Reasoning
These pills were serving as temporary status indicators and debugging aids. Removing them cleans up the UI and removes visual clutter from the primary router interface, as requested.

### 4. Detailed Blueprint
- **File**: `src/components/admin/RouterManager.tsx`
- **Changes**:
    - Remove the conditional rendering logic for the `IMAGE_UPSCALE` "Free Pick" pill.
    - Remove the conditional rendering logic and tooltip for the Cloudflare "401?" warning.

### 5. Operational Trace
- Edited `src/components/admin/RouterManager.tsx`:
    - Deleted lines 558 to 575 which contained the `IMAGE_UPSCALE` and `cloudflare` warning logic.

### 6. Status Assessment
- Warning and status pills removed from all router headers.
- UI is now cleaner and focused on configuration controls.
