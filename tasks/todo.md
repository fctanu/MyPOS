# React Flow Implementation Plan

## Plan
- [x] Confirm the reference screens and shared CSS structure from `html-css-version`.
- [x] Replace the iframe/static viewer with a real routed React app that follows the reference designs.
- [x] Implement working flows for login, transactions, products, refunds, and reports using shared app state.
- [x] Extend products import to support drag-and-drop and `.xlsx` uploads.
- [x] Align product import headers with the provided Excel template (`Name`, `Kriteria`, `Net Price`, `Grosir Price`, `Eceran Price`).
- [x] Fix transaction catalog filtering so uploaded products display correctly in `All` and per-category views.
- [x] Verify navigation, interactions, and build/lint output on the React implementation.
- [x] Record the implementation result and remaining gaps in this review section.

## Review
- Products import now supports both click-to-select and drag-and-drop uploads.
- Supported formats now include `.csv`, `.xlsx`, and `.xls`.
- The import parser now accepts the provided Excel template headers: `Name`, `Kriteria`, `Net Price`, `Grosir Price`, and `Eceran Price`, while still keeping the older generic headers as fallback.
- Imported spreadsheet rows map `Kriteria` to product category and `Eceran Price` to the app selling price, with `Net Price` and `Grosir Price` also preserved on imported products.
- The upload area was upgraded into a real dropzone while staying inside the existing visual system.
- The transaction catalog now defaults to `Semua` with an empty search query, so newly uploaded products are visible immediately instead of being hidden by the old hardcoded `mie` filter.
- Category chips in transactions are now derived from categories that actually have products, show product counts, and safely fall back to `Semua` when a previously selected category is no longer valid.
- Verification passed with `npm run lint`. `npm run build` also passed after the upload enhancement, with an expected bundle-size warning because the spreadsheet parser increases the client bundle size.
