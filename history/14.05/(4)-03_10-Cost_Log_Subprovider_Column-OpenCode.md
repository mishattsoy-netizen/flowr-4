# Subprovider Column in Cost Logs

## Summary

Added `subprovider` column to `cost_log` table to track which actual provider OpenRouter routed requests to (e.g., "google", "groq", "together"). Displayed in the Recent Usage tab.

## Changes

- **`supabase/migrations/20260514_cost_log_subprovider.sql`** — `ALTER TABLE cost_log ADD COLUMN subprovider TEXT`
- **`src/app/admin/models/actions.ts`** — `logModelCost()` accepts optional `subprovider`
- **`src/lib/bot/chainRouter.ts`** — Both call sites pass `(response as any).provider ?? null` as subprovider
- **`src/app/admin/costs/actions.ts`** — `CostLogEntry` type and query include `subprovider`
- **`src/app/admin/costs/CostDashboardClient.tsx`** — Added "Sub" column between Provider and Chain in the recent usage table

The data comes from the OpenRouter `x-openrouter-provider` response header, already captured in the response object as `response.provider` or `visionRes.provider`.
