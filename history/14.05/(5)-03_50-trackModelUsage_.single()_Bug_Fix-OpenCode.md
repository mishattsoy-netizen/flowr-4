# trackModelUsage .single() Bug Fix

## Summary

Fixed `trackModelUsage()` in `chainRouter.ts` using `.single()` which throws PGRST116 when a model doesn't exist in the `models` table. The caught error caused the entire function to bail out, preventing the `increment_model_usage` RPC from ever running. This meant `last_reset_date` was never set for any model, showing stale dates (May 10 instead of today).

## Fix

Changed `.single()` to `.maybeSingle()` so that absent models return `{ data: null, error: null }` instead of throwing. The global reset is skipped for models not yet in the table, but the RPC still runs and creates/updates the row with `last_reset_date = CURRENT_DATE`.

## File

- `src/lib/bot/chainRouter.ts` — line 40: `.single()` → `.maybeSingle()`, added `fetchError` to guard the reset logic
