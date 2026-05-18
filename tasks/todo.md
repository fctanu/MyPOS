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

# Remove Transaction Product Metric Plan

## Plan
- [x] Review the transaction hero implementation and related CSS.
- [x] Remove the `Produk / Ready` metric tile from the transaction order UI.
- [x] Adjust the remaining cart metric layout so it fills the metric area cleanly.
- [x] Verify with type checking/build and the in-app browser.
- [x] Record the result in this review section.

## Review
- Removed the `Produk / Ready` metric tile from the transaction product-entry hero.
- Added `stats-pair--single` so the remaining `Keranjang / Aktif` tile fills the metric column cleanly.
- Verification passed with `npm run lint` and `npm run build`.
- In-app browser verification at `http://localhost:3000/transactions` confirmed `PRODUK / READY` is absent and the metric area contains only `Keranjang / Aktif`.

# Remove Transaction Cart Status Plan

## Plan
- [x] Locate the `Keranjang` metric status text in the transaction hero.
- [x] Remove the `Aktif` status text without changing the cart count.
- [x] Verify with type checking/build and the in-app browser.
- [x] Record the result in this review section.

## Review
- Removed the `Aktif` status line from the `Keranjang` metric tile.
- Verification passed with `npm run lint` and `npm run build`.
- In-app browser verification at `http://localhost:3000/transactions` confirmed the cart metric text is `Keranjang12` and no `.metric-status` remains in the tile.

# Resize Transaction Hero Metric Plan

## Plan
- [x] Inspect the transaction hero grid sizing.
- [x] Shorten the `Keranjang` metric column and let `Cari produk` use the freed width.
- [x] Verify with type checking/build and the in-app browser.
- [x] Record the result in this review section.

## Review
- Scoped the transaction order hero grid to `minmax(0, 1fr) 180px`, reducing the cart metric column from the inherited `300px` width.
- The `Cari produk` card now receives the freed horizontal space on transaction order screens.
- Verification passed with `npm run lint` and `npm run build`.
- In-app browser verification confirmed the updated CSS rule is loaded for `.transactions-order-expanded-page .hero-grid` and `.transactions-order-collapsed-page .hero-grid`.

# Keep Checkout Footer Visible Plan

## Plan
- [x] Inspect checkout panel markup and shared CSS.
- [x] Make the checkout panel a bounded vertical layout on transaction order screens.
- [x] Move overflow scrolling to the cart item list while keeping Total and Proses Pesanan visible.
- [x] Verify with type checking/build and the in-app browser using many cart items.
- [x] Record the result in this review section.

## Review
- The checkout panel is now a sticky, bounded flex column on transaction order screens.
- The header and footer are fixed-height flex items, while `checkout-panel__body` owns vertical scrolling.
- Verification passed with `npm run lint` and `npm run build`.
- In-app browser verification confirmed the active stylesheet contains the scoped sticky panel, fixed header/footer, and scrollable `checkout-panel__body` rules.

# Keep Transaction Catalog Controls Visible Plan

## Plan
- [x] Inspect catalog panel markup and shared CSS.
- [x] Make the transaction catalog panel a bounded vertical layout on order screens.
- [x] Move overflow scrolling to the product item list while keeping search/category controls visible.
- [x] Verify with type checking/build and the in-app browser.
- [x] Record the result in this review section.

## Review
- The transaction catalog panel is now a bounded flex column on order screens.
- The hero controls (`Cari produk`, cart metric, and category chips) stay fixed at the top of the catalog panel.
- The product list area now owns vertical scrolling through `.catalog-body`.
- Verification passed with `npm run lint` and `npm run build`.
- In-app browser verification confirmed the scoped transaction catalog scroll rules are loaded.

# Restrict Reports To Owner Plan

## Plan
- [x] Inspect sidebar navigation, login role text, and reports route.
- [x] Hide the Laporan sidebar link unless the active session role is owner.
- [x] Redirect non-owner sessions away from `/reports`.
- [x] Update employee login copy so it no longer advertises reports access.
- [x] Verify with type checking/build and browser/session checks.
- [x] Record the result in this review section.

## Review
- The sidebar now renders `Laporan` only when `session.role === "owner"`.
- Employee sessions are redirected from `/reports` to `/transactions`.
- The employee login card now says employees have access to transactions, refunds, and products only.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed employee nav is `Transaksi`, `Refund`, `Produk`, direct `/reports` redirects to `/transactions`, and owner nav includes `Laporan` with access to `/reports`.

# Hardcode Product Seed Data Plan

## Plan
- [x] Inspect current product/category seed shape.
- [x] Add the categories from the provided spreadsheet image to the initial seed.
- [x] Replace the 16-product seed with the provided hardcoded product rows.
- [x] Preserve net, grosir, and eceran values in the product model.
- [x] Verify with type checking/build and a source-level count check.
- [x] Record the result in this review section.

## Review
- Added hardcoded seed rows for 87 products from the provided spreadsheet image.
- Added the new initial categories: `SABUN & DETERJEN`, `GULA TEPUNG`, `KESEHATAN`, and `DESSERT`.
- Preserved `net`, `grosir`, and `eceran` as `netPrice`, `wholesalePrice`, and effective `retailPrice`; rows with `eceran` set to `0` use `grosir` as the displayed sale price when available.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the transaction catalog initializes with `Semua (87)` and category chips for all seeded categories.

# Fit Product Card Prices Plan

## Plan
- [x] Inspect product card CSS and transaction grid sizing.
- [x] Adjust transaction product cards so large prices fit within card bounds.
- [x] Keep product names/categories wrapping cleanly without changing other pages.
- [x] Verify with type checking/build and browser measurement.
- [x] Record the result in this review section.

## Review
- Transaction product cards now use a bounded flex layout with wrapping title/category text.
- Product prices are reduced from the shared 30px style to a transaction-scoped 26px with `max-width: 100%` and `overflow-wrap: anywhere`.
- Verification passed with `npm run lint` and `npm run build`.
- In-app browser verification confirmed the scoped product-card fit rules are active.

# Deduct Stock On Cart Add Plan

## Plan
- [x] Inspect cart and stock mutation paths.
- [x] Deduct one stock immediately when a product card or `+` is clicked.
- [x] Restore stock when quantity is reduced, an item is removed, or the cart is cleared.
- [x] Remove completion-time stock deduction to avoid double subtraction.
- [x] Prevent adding more units when stock is already zero.
- [x] Verify with type checking/build and browser behavior.
- [x] Record the result in this review section.

## Review
- Adding a product now immediately decrements its displayed stock by one.
- Increasing quantity with `+` also decrements remaining stock, and the `+` button is disabled when stock reaches zero.
- Decreasing quantity, removing an item, or clearing the cart restores the reserved stock.
- Completing a transaction no longer subtracts stock a second time; the cart is cleared after the sale is recorded.
- Verification passed with `npm run lint` and `npm run build`.

# Improve Forecast Report Metric Plan

## Plan
- [x] Inspect the report forecast table and current average daily sales calculation.
- [x] Replace the hard-to-read daily average decimal with a clearer owner-facing metric.
- [x] Keep the metric derived only from existing sales data.
- [x] Verify with type checking/build and browser output.
- [x] Record the result in this review section.

## Review
- Replaced `Rata-rata Penjualan Harian` with `Total Terjual` in the forecast report table.
- The value now shows direct unit counts from existing sales data, such as `8 item`, instead of decimal averages like `0.3`.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the forecast table headers are `Dibuat`, `Produk`, `Total Terjual`, and `Saran Restok`.

# Validate Report Period Dates Plan

## Plan
- [x] Inspect current report period inputs and generate action.
- [x] Change start and end period controls to native date inputs.
- [x] Add required/range validation for empty or reversed date ranges.
- [x] Verify with type checking/build and browser output.
- [x] Record the result in this review section.

## Review
- Changed both report period controls to native `type="date"` inputs so clicking opens the browser calendar picker.
- Added `required`, start-date `max`, end-date `min`, and submit-time validation for empty or reversed ranges.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed `Tanggal mulai` and `Tanggal selesai` are date inputs with the expected min/max constraints.

# Improve Owner Report Summary Plan

## Plan
- [x] Identify the duplicate/low-value report summary metrics.
- [x] Replace `Sales Selesai`, `Struk Dibagikan`, and `Share Rate Struk` with clearer owner metrics.
- [x] Derive the replacement metrics only from existing sales, refund, and product cost data.
- [x] Verify with type checking/build and browser output.
- [x] Record the result in this review section.

## Review
- Replaced the duplicate/low-value second report stat row with `Omzet Bersih`, `Rata-rata Belanja`, and `Estimasi Laba Kotor`.
- `Omzet Bersih` is total sales minus refunds.
- `Rata-rata Belanja` is total sales divided by transaction count.
- `Estimasi Laba Kotor` is calculated from sale item price minus product net price, multiplied by quantity.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the old receipt-sharing metrics are gone and the three new owner metrics render.
