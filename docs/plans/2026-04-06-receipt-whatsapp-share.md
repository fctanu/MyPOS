# Receipt WhatsApp Share Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the existing receipt-success moment into a lightweight share loop by letting staff send a digital receipt through WhatsApp or copy it for reuse, then measure share rate locally.

**Architecture:** Add a small receipt-share helper for message and URL generation, a local growth-metrics store keyed in browser storage, and wire both into the current transaction receipt state and reports page. Reuse the existing transaction success UI, local storage layer, buttons, notices, and reports surface.

**Tech Stack:** React 18, TypeScript, React Router, Vitest, localStorage

---

### Task 1: Define receipt share behavior with tests

**Files:**
- Create: `src/test/receipt-share.test.ts`
- Create: `src/test/growth-metrics.test.ts`

**Step 1: Write the failing test**

Add tests covering:
- WhatsApp receipt text includes store name, receipt number, totals, and loyalty info when present.
- WhatsApp URL normalizes Indonesian customer phone numbers.
- Growth metrics increment and persist `sale_completed` and `receipt_share_clicked`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/test/receipt-share.test.ts src/test/growth-metrics.test.ts`
Expected: FAIL because receipt-share and growth-metrics modules do not exist yet.

### Task 2: Add the minimal share and metrics modules

**Files:**
- Modify: `src/storage/local/keys.ts`
- Create: `src/shared/lib/receipt-share.ts`
- Create: `src/shared/lib/growth-metrics.ts`

**Step 1: Write minimal implementation**

Add:
- A new storage key for growth metrics.
- Receipt-share helpers for message formatting, WhatsApp URL generation, and phone normalization.
- A tiny local metrics store with load/track helpers and a browser event for updates.

**Step 2: Run tests to verify they pass**

Run: `npm test -- src/test/receipt-share.test.ts src/test/growth-metrics.test.ts`
Expected: PASS.

### Task 3: Wire the feature into the transaction receipt surface

**Files:**
- Modify: `src/features/transactions/page.tsx`

**Step 1: Add share entry point**

Use the completed transaction state to:
- Track `sale_completed` after successful checkout.
- Add a WhatsApp share button and a copy button on the receipt screen.
- Reuse notices for success/error messaging.

**Step 2: Run focused verification**

Run: `npm test -- src/test/receipt-share.test.ts src/test/growth-metrics.test.ts`
Expected: PASS.

### Task 4: Surface measurement in reports

**Files:**
- Modify: `src/features/reports/page.tsx`

**Step 1: Add minimal metric readout**

Show:
- Completed sales count
- Receipt shares count
- Share rate derived from both metrics

**Step 2: Run project verification**

Run:
- `npm test`
- `npm run build`

Expected: PASS with no TypeScript or build errors.
