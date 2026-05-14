# Free Model Toggle in Cost Analytics

## Summary

Added ability to flag models as "free" in the cost analytics page. When flagged, the model's costs are excluded from summary, chart, and breakdown table — showing $0.00 instead. Toggle persists in localStorage.

## Files Changed

### Modified
- **`src/app/admin/costs/actions.ts`** — Added optional `excludeModelIds: string[]` parameter to `getCostSummary`, `getCostSeries`, `getModelBreakdown`, and `getRecentCostLogs`. Added `excludeModels()` helper that chains `.neq()` filters.
- **`src/app/admin/costs/CostDashboardClient.tsx`** — Added:
  - `getFreeModels()` / `saveFreeModels()` helpers reading/writing localStorage under `cost-analytics-free-models` key
  - `freeModels` state (Set<string>) initialized from localStorage
  - `toggleFreeModel()` callback
  - Passes `excludeModelIds` to all server action calls, triggering re-fetch on toggle
  - Toggle button ($ icon) on each model row — shows as green "$0" badge when free, hover "$" button when paid
  - Free rows show reduced opacity, green "$0.00" cost text
  - Summary cards, chart, and recent usage tab all update when free model set changes
