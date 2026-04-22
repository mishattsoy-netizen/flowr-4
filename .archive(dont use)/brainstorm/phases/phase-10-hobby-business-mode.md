# Phase 10 — Hobby-Business Mode

## 1. Request Summary

Ship Hobby-Business Mode for **dropshipping + digital products + app/site launches**. Core: product pipeline, suppliers/stack, ad creatives, experiments (A/B), revenue tracker, launch checklists, competitor watch.

---

## 2. Codebase Context
- `src/modes/registry.ts`, `src/agent/tools/hobby-business.ts`
- Reuse canvas (ad creative boards), tracker (launch checklist Kanban)
- `supabase/schema.sql`

## 3. Step-by-Step Implementation Plan

### Step 1 — Types
- **File:** `src/modes/hobby/types.ts`
- **Action:** create
- **What to do:**
  ```ts
  export type BusinessKind = 'dropshipping'|'digital-product'|'app'|'site'|'other';
  export type ProductStage = 'idea'|'research'|'building'|'marketing'|'launched'|'archived';
  export interface Product { id, workspaceId, name, kind: BusinessKind, stage: ProductStage, price?, cost?, marginPercent?, description?, launchDate?, tags: string[], moodboardEntityId? }
  export interface Supplier { id, workspaceId, productId?, name, contact?, url?, notes?, rating?: 1..5 }
  export interface AdCreative { id, workspaceId, productId?, platform, mediaUrl, hook?, cta?, metrics?: { spend?, impressions?, clicks?, conversions? }, status: 'draft'|'live'|'paused'|'archived' }
  export interface Experiment { id, workspaceId, productId, hypothesis, variantA, variantB, metric, status, resultNote? }
  export interface RevenueEntry { id, workspaceId, productId?, date, amount: number, source?: string, type: 'revenue'|'cost' }
  export interface LaunchChecklist { id, workspaceId, productId, items: { id, label, done, order }[] }
  export interface Competitor { id, workspaceId, productId?, name, url?, notes?, priceBenchmark? }
  ```

### Step 2 — Supabase tables
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** `products`, `suppliers`, `ad_creatives`, `experiments`, `revenue_entries`, `launch_checklists`, `competitors`; workspace-scoped RLS.

### Step 3 — Store + sync
- **File:** `src/modes/hobby/store.ts`, `sync.ts`
- **Action:** create
- **What to do:** CRUD + selectors: `productsByStage`, `revenueByProduct(range)`, `adROI(creativeId)`, `checklistProgress(id)`.

### Step 4 — Product pipeline (Kanban)
- **File:** `src/components/modes/hobby/ProductPipeline.tsx`
- **Action:** create
- **What to do:** Columns = `ProductStage`. Card shows name, kind icon, price, launch date.

### Step 5 — Product detail drawer
- **File:** `src/components/modes/hobby/ProductDrawer.tsx`
- **Action:** create
- **What to do:** Tabs: Overview | Suppliers | Ads | Experiments | Launch Checklist | Competitors | Revenue.

### Step 6 — Ad creative board (canvas)
- **File:** `src/components/modes/hobby/AdBoard.tsx`
- **Action:** create
- **What to do:** Reuse canvas with image blocks per ad. Click ad → ad detail (metrics entry).

### Step 7 — Revenue tracker
- **File:** `src/components/modes/hobby/widgets/RevenueWidget.tsx`
- **Action:** create
- **What to do:** This-month revenue vs cost, per-product breakdown, 30-day sparkline.

### Step 8 — Launch checklist
- **File:** `src/components/modes/hobby/LaunchChecklist.tsx`
- **Action:** create
- **What to do:** Reorderable checklist per product. Preset templates (physical product / digital / app / site).

### Step 9 — Experiment tracker
- **File:** `src/components/modes/hobby/ExperimentTable.tsx`
- **Action:** create
- **What to do:** Table of experiments; status chips; result note field.

### Step 10 — Competitor wall
- **File:** `src/components/modes/hobby/CompetitorWall.tsx`
- **Action:** create
- **What to do:** Card grid; price benchmark vs our price highlighted.

### Step 11 — Calendar adapter
- **File:** `src/modes/hobby/calendar.ts`
- **Action:** create
- **What to do:** Expose product `launchDate`, ad `status change` dates as calendar items.

### Step 12 — Mode home + starter
- **File:** `src/modes/registry.ts`, `src/modes/hobby/starter.ts`
- **Action:** modify + create
- **What to do:** Home: Revenue widget + Pipeline + Live ads + Launch progress bars. Starter seeds 1 sample product in 'idea' stage + empty launch checklist template.

### Step 13 — Agent tools
- **File:** `src/agent/tools/hobby-business.ts`
- **Action:** modify
- **What to do:** `create_product`, `advance_product_stage`, `log_revenue`, `create_ad_creative`, `log_ad_metrics`, `suggest_experiment(product)`, `draft_launch_checklist(productKind)`, `summarize_performance(range)`.

---

## 4. Verification Checklist
- [ ] Revenue widget sums correctly; negative numbers = cost.
- [ ] Launch checklist progress updates live as items check.
- [ ] Ad creative metrics calc ROI correctly.
- [ ] Pipeline drag updates stage.
- [ ] Agent: "Draft a launch checklist for a digital product" → populates template.

## 5. Notes & Warnings
- Revenue math must treat cost as negative — unit test.
- Do NOT plug in Shopify/Stripe/Meta Ads APIs in beta — scope creep. Manual entry only.
- Ad creative images: if >5 MB, compress client-side before upload.
- ROI = (revenue-spend)/spend; undefined when spend = 0 (display "—" not NaN).
