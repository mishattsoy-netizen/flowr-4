User request: "cost is incorrect"

### Objective Reconstruction
Address the incorrect model pricing representation in both the Model Discovery and Registered Models tables. Displays per-token costs (e.g. $0.00000025 for Claude Haiku) were suffering from rounding errors due to fixed 6-decimal truncations (producing $0.000000) and were extremely difficult for humans to read. The objective is to standardize all pricing representations to "cost per 1 Million tokens" ($0.25 / $1.25 per 1M), which is the industry standard format, and eliminate rounding/truncation bugs entirely.

### Strategic Reasoning
- **Per-Million Tokens Standardization**: Created a centralized `formatCostPerMillion` helper function. Multiplying the per-token price by 1,000,000 converts small decimals like `0.00000025` to highly readable numbers like `0.25`.
- **Dynamic Precision & Zero-Stripping**: The helper uses `toFixed(4)` but wraps it in `parseFloat().toString()` to dynamically strip trailing zeros, producing beautifully formatted values like `$3` (instead of `$3.0000`) and `$0.075` for ultra-precise micro-pricing.
- **Unified Presentation**: Shared the formatting helper across both the Model Discovery table, Registry table, and addition confirmation dialogs for absolute UX consistency.

### Detailed Blueprint
1. **Helper Function**: Implement `formatCostPerMillion` in `src/components/admin/ModelsTable.tsx`.
2. **Models Admin Table**: Apply the helper inside the `EditableRow` and standard table row pricing cells of `src/components/admin/ModelsTable.tsx`.
3. **Model Discovery Client**: Import the helper and apply it to the discovery results table and confirmation alert inside `src/app/admin/discover/DiscoverClient.tsx`.
4. **Verification**: Run TypeScript build to confirm zero compilation errors.

### Operational Trace
- Modified `src/components/admin/ModelsTable.tsx` to add `formatCostPerMillion` helper under `MODALITY_OPTIONS`.
- Updated `EditableRow` and standard row pricing cells in `src/components/admin/ModelsTable.tsx` to utilize `formatCostPerMillion`.
- Modified `src/app/admin/discover/DiscoverClient.tsx` to import `formatCostPerMillion` from `@/components/admin/ModelsTable`.
- Updated pricing cells and paid-model alert dialogs inside `src/app/admin/discover/DiscoverClient.tsx` to utilize `formatCostPerMillion`.
- Successfully ran Next.js build (`npm run build`) with zero errors.

### Status Assessment
- **Status**: Completed successfully.
- **Verification**: Verified successfully using the Next.js production build system.
- **Next Steps**: Standard development cycle.
