# Cost Analytics Dashboard

## Summary

New admin page at `/admin/costs` for tracking model cost and token usage with timeframes and per-model breakdowns. Also wired up `logModelCost()` in `chainRouter.ts` so every model call writes actual cost data to the `cost_log` table.

## Files

### Modified
- **`src/lib/bot/chainRouter.ts`** — Added non-blocking `logModelCost()` calls after both main model success and vision model success paths. Writes actual token counts and computed cost to `cost_log` table.
- **`src/components/admin/Sidebar.tsx`** — Added "Cost Analytics" nav link (DollarSign icon) under Global Management, between Analytics Engine and Message Logs.

### Created
- **`src/app/admin/costs/page.tsx`** — Server component, `force-dynamic`, fetches initial 30-day data and renders `<CostDashboardClient>`.
- **`src/app/admin/costs/actions.ts`** — Three server actions:
  - `getCostSummary(days)` — Returns total cost, prompt/completion tokens, request count
  - `getCostSeries(days)` — Returns daily cost + token series for area chart
  - `getModelBreakdown(days)` — Returns per-model cost, tokens, requests, sorted by cost
- **`src/app/admin/costs/CostDashboardClient.tsx`** — Client component with:
  - Timeframe selector: [24h] [7d] [30d] [90d] [All]
  - 4 summary metric cards (Total Cost, Total Tokens, Requests, Avg Cost/Request + costliest model)
  - Cost Over Time area chart
  - Per-Model Breakdown sortable table (Model, Cost, Requests, Prompt Tokens, Completion Tokens)
- **`src/app/admin/costs/CostCharts.tsx`** — Recharts `CostSeriesChart` area chart with amber gradient

## Data Flow

```
chainRouter computes actualCost from provider token counts × model pricing
  → calls logModelCost() to write to cost_log table
    → Cost Analytics page queries cost_log with time range filters
      → Dashboard renders summary cards + chart + breakdown table
```

## Fallback

When `cost_log` is empty (no calls made yet), the dashboard shows "No cost data recorded yet" message.
