# Phase 07 — Trader Mode

## 1. Request Summary

Ship Trader Mode: a structured trading journal + analytics hub. Core surfaces: trade log, strategy vault, watchlist, PnL dashboard, emotion log, economic calendar stub, weekly review. Fills trader-specific tools in the agent (phase 06 stubs).

---

## 2. Codebase Context

**Relevant files**
- `src/modes/registry.ts` — fill `trader` entry
- `src/agent/tools/trader.ts` — fill stubs
- `src/modes/calendar/selectors.ts` — register trader calendar adapter
- `supabase/schema.sql`

**Architecture notes**
- Trades are structured records → dedicated table.
- Reuses canvas for chart/setup screenshots embedded in a trade.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Domain types
- **File:** `src/modes/trader/types.ts` (create)
- **Action:** create
- **What to do:**
  ```ts
  export type TradeSide = 'long' | 'short';
  export type TradeStatus = 'open' | 'closed' | 'cancelled';
  export interface Trade {
    id, workspaceId,
    symbol: string,
    side: TradeSide,
    status: TradeStatus,
    entryPrice: number, exitPrice?: number,
    quantity: number, leverage?: number,
    entryAt: string, exitAt?: string,
    strategyId?: string,
    pnl?: number, pnlPercent?: number, rr?: number,
    tags: string[],
    notes?: string,
    screenshotEntityIds: string[],  // link to canvas/note entities
    emotions?: { before?: string; during?: string; after?: string },
  }
  export interface Strategy { id, workspaceId, name, description: EditorBlock[], rules: string[], winRate?, expectancy?, tags: string[] }
  export interface WatchlistItem { id, workspaceId, symbol, note?, tags: string[], addedAt }
  ```

### Step 2 — Supabase tables
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** `trades`, `strategies`, `watchlist` tables with `workspace_id`, `mode_id`, `scheduled_at` (for planned trades), RLS via workspace ownership.

### Step 3 — Store slice + sync
- **File:** `src/modes/trader/store.ts`, `src/modes/trader/sync.ts`
- **Action:** create
- **What to do:** State + CRUD + selectors: `tradesBySymbol`, `openTrades`, `pnlByDay(range)`, `winRateByStrategy`, `equityCurve()`.

### Step 4 — Trade entry form
- **File:** `src/components/modes/trader/TradeEntryForm.tsx` (create)
- **Action:** create
- **What to do:** Fast form: symbol, side, entry, quantity, optional stop/target, screenshot upload (image canvas entity), tags, pre-trade notes. "Save as open" / "Save as closed now."

### Step 5 — Trade log view
- **File:** `src/components/modes/trader/TradeLog.tsx`
- **Action:** create
- **What to do:** Sortable/filterable table (symbol, date, side, PnL, strategy). Click row → trade detail drawer with screenshots, emotion log, post-trade reflection.

### Step 6 — PnL widgets
- **File:** `src/components/modes/trader/widgets/{PnLCard,EquityCurve,WinRateBreakdown,TagAnalytics}.tsx`
- **Action:** create
- **What to do:** Simple SVG charts (no heavy chart lib needed — line + bar). Use the derived selectors from Step 3.

### Step 7 — Strategy vault
- **File:** `src/components/modes/trader/StrategyVault.tsx`, `StrategyDrawer.tsx`
- **Action:** create
- **What to do:** Grid of strategies; each has rules list + linked trades + auto-computed win rate.

### Step 8 — Watchlist widget
- **File:** `src/components/modes/trader/widgets/Watchlist.tsx`
- **Action:** create
- **What to do:** Simple symbol list with notes. No live prices in beta.

### Step 9 — Economic calendar stub
- **File:** `src/components/modes/trader/widgets/EconCalendarWidget.tsx`
- **Action:** create
- **What to do:** For beta, users manually add high-impact events (existing calendar event with `modeId='trader'`, tag 'econ'). Post-beta integrate Investing.com / FRED feed.

### Step 10 — Emotion log
- **File:** `src/components/modes/trader/widgets/EmotionLogWidget.tsx`
- **Action:** create
- **What to do:** Daily emotion rating + note, similar to mood widget but trading-specific tags (FOMO, revenge, disciplined, tilt).

### Step 11 — Mode home layout + starter
- **File:** `src/modes/registry.ts`, `src/modes/trader/starter.ts`
- **Action:** modify + create
- **What to do:** Layout: PnL card + equity curve top, trade log middle, strategies + watchlist bottom, emotion + econ side. Starter seeds 1 example strategy and 2 example open trades that the user can delete.

### Step 12 — Calendar adapter
- **File:** `src/modes/trader/calendar.ts`
- **Action:** create
- **What to do:** Expose planned trades (`trade.scheduled_at`) + econ events to calendar as `CalendarItem`s with `source: 'trade' | 'econ'`.

### Step 13 — Agent tools
- **File:** `src/agent/tools/trader.ts`
- **Action:** modify
- **What to do:** Implement `log_trade`, `close_trade`, `create_strategy`, `add_to_watchlist`, `summarize_week`, `analyze_performance(range)`.

### Step 14 — Quick-capture route
- **File:** `src/modes/life/widgets/today/QuickCapture.tsx` integration
- **Action:** modify
- **What to do:** Register trader's parser: `/trade BTCUSD long @45000 qty 0.1` → structured trade call.

---

## 4. Verification Checklist
- [ ] Log a trade → appears in log + PnL updates.
- [ ] Close trade → PnL computed correctly.
- [ ] Strategy win rate updates after a closed trade.
- [ ] Calendar shows trader events filtered by 'Trader' chip.
- [ ] Agent: "Log a short on BTC at 45k quantity 0.5" → creates trade.
- [ ] Deactivating Trader hides all trader data + calendar chip.

## 5. Notes & Warnings
- Don't build price feeds in beta — they're expensive + broker-API specific. Users log manually.
- PnL math: standard long/short with optional leverage; write unit tests (1 pct move × leverage × qty).
- Screenshots: reuse `entities.canvas` with `mode_id='trader'`, avoid new storage code.
- Respect timezone for daily PnL grouping — use user's TZ.
