User request: "instead of showing VISION in pill and classifier under pill in llog chain. show model id in the pill and VISION under pill"

### 0. Date and time of the request
16.05.2026 02:00

### 1. User request
"instead of showing VISION in pill and classifier under pill in llog chain. show model id in the pill and VISION under pill"

### 2. Objective Reconstruction
The user wants to swap the display labels for Vision steps in the admin log chain trace. Currently, "VISION" is shown inside the pill (label) and "CLASSIFIER" is shown below (sublabel). The new requirement is to show the actual model ID in the pill and "VISION" as the sublabel.

### 3. Strategic Reasoning
I identified the `ChainPills` component in `LogsTable.tsx` as the source of this rendering. I swapped the hardcoded "VISION" label with the model ID from the trace, and replaced the "CLASSIFIER" sublabel with "VISION". I also updated the fallback logic for cases where full traces aren't available to maintain consistency.

### 4. Detailed Blueprint
- **File**: `src/app/admin/logs/LogsTable.tsx`
- **Component**: `ChainPills`
- **Logic**:
    - In the `visionTraces` loop, set `label` to `t.model` and `sublabel` to `'VISION'`.
    - In the fallback `modelChain` loop, updated the logic to prefer the model ID in the label and the intent (VISION/AI/TAG/KEYWORD) in the sublabel.

### 5. Operational Trace
- Modified `src/app/admin/logs/LogsTable.tsx`:
    - Updated `visionTraces` loop to use `t.model` for pill label and `'VISION'` for sublabel.
    - Updated fallback loop to use `model` for label and `upper` (intent) for sublabel.

### 6. Status Assessment
- Swapped Vision labels as requested.
- Updated fallback logic for consistency.
- The UI should now show model IDs in the pills for Vision steps.
