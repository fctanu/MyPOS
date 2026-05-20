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

# Keep Old Color Palette Plan

## Plan
- [x] Confirm the old palette hex values from the shared CSS tokens.
- [x] Remove the theme-change button and state from the protected shell.
- [x] Remove the new palette override so the app always uses the old palette.
- [x] Verify with type checking/build and source search.
- [x] Record the result in this review section.

## Review
- The app now uses only the old palette from `html-css-version/css/base.css`.
- Removed the sidebar `Ganti Tema` button and the `theme-new` state/class toggle.
- Removed the `body.theme-new` CSS token override from `src/index.css`.
- Verification passed with `npm run lint`, `npm run build`, and source search for the removed theme references.

# Keep Sidebar Footer Fixed Plan

## Plan
- [x] Inspect the shared shell/sidebar CSS and protected page layout.
- [x] Constrain the desktop app shell to the viewport.
- [x] Keep the left sidebar footer fixed at the bottom of the sidebar.
- [x] Move vertical scrolling to the right-side content area.
- [x] Preserve the existing mobile single-column layout.
- [x] Verify with type checking/build and browser layout checks.
- [x] Record the result in this review section.

## Review
- The desktop app shell now uses a fixed `100vh` frame with hidden shell overflow.
- The sidebar stays full-height, with its header and footer fixed inside the left column.
- The sidebar nav can scroll independently if it overflows.
- The right-side `.page-content` is now the vertical scrolling region, so page scrolling no longer pushes the sidebar footer off-screen.
- Mobile widths keep the existing single-column natural page scroll behavior.
- Verification passed with `npm run lint` and `npm run build`.
- Browser checks on `/refunds`, `/products`, and `/reports` confirmed document height equals viewport height, the sidebar footer remains at the viewport bottom, and `.page-content` owns vertical scrolling.

# Improve Sidebar Toggle Plan

## Plan
- [x] Inspect the current sidebar toggle icon, markup, and CSS.
- [x] Replace the toggle glyph with a clearer collapse/expand icon.
- [x] Improve header alignment and button styling in expanded and collapsed states.
- [x] Verify with type checking/build and browser layout checks.
- [x] Record the result in this review section.

## Review
- Replaced the old panel-box glyph with clearer collapse/expand icons that show the sidebar direction.
- Enlarged the toggle to a 44px circular control with token-based blue styling, subtle inset highlight, shadow, hover state, and keyboard focus ring.
- Improved header spacing so the toggle no longer feels cramped against the brand text.
- Centered the toggle cleanly in the collapsed 84px sidebar.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the expanded button is 44x44 with a 25px gap from the brand, and the collapsed button is centered with `aria-label="Buka sidebar"`.

# Simplify Sidebar Toggle Icon Plan

## Plan
- [x] Replace the sidebar toggle glyphs with plain left/right arrows.
- [x] Verify with type checking/build and browser icon state checks.
- [x] Record the result in this review section.

## Review
- Simplified the sidebar toggle to plain arrow icons only.
- Expanded sidebar now shows a left arrow for closing.
- Collapsed sidebar now shows a right arrow for opening.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed each state renders exactly two SVG paths for the simple arrow glyph.

# Improve Sidebar Brand Lockup Plan

## Plan
- [x] Split the sidebar brand into a two-line lockup.
- [x] Style `MyPOS` as the primary line and `Sumber Kasih` as a smaller secondary line.
- [x] Verify with type checking/build and browser layout checks.
- [x] Record the result in this review section.

## Review
- Replaced the single-line `MyPOS Sumber Kasih` title with a two-line brand lockup.
- `MyPOS` remains the primary display line; `Sumber Kasih` is now a smaller secondary line.
- Removed the truncation behavior for the expanded sidebar brand so `Sumber Kasih` no longer appears as `Sumb...`.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed both brand lines fit without overflow and maintain clear spacing from the sidebar toggle.

# Expand Product List Editing Plan

## Plan
- [x] Inspect the current Daftar Produk table and product state shape.
- [x] Show every product row instead of only the first 10.
- [x] Add a right-aligned Edit toggle beside the Daftar Produk heading.
- [x] Enable inline editing for product information.
- [x] Verify with type checking/build and browser row/action checks.
- [x] Record the result in this review section.

## Review
- `Daftar Produk` now renders the full product list instead of `products.slice(0, 10)`.
- Added a right-aligned `Edit` button beside `Daftar Produk`; it toggles to `Selesai` while editing.
- Edit mode enables inline editing for product name, category, net price, grosir price, retail price, and stock.
- Product name edits also regenerate the SKU from the new name.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed `Daftar Produk (87)` renders 87 rows and edit mode exposes editable controls for every row.

# Improve Category Form Inputs Plan

## Plan
- [x] Inspect the shared input and category form styling.
- [x] Add scoped visual styling for the category name and description fields.
- [x] Verify with type checking/build and browser computed-style checks.
- [x] Record the result in this review section.

## Review
- Added scoped visual styling for `#category-form` so the category inputs feel more polished without changing every form in the app.
- `Nama Kategori` and `Deskripsi` now use a soft white/blue filled surface, subtle border, and shadow.
- Labels in the category form now read as stronger uppercase field labels.
- Focus state now uses the old palette primary blue with a visible ring and soft shadow.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the new background, border, label transform, and focus styles are active on the category form fields.

# Improve Category Cancel Button Plan

## Plan
- [x] Scope the cancel button visual change to the category form.
- [x] Restyle the `Batal` ghost button so it separates from the soft panel background.
- [x] Verify with type checking/build and browser computed-style checks.
- [x] Record the result in this review section.

## Review
- Scoped the `Batal` button styling to `#category-form .button--ghost`.
- Changed the button to a white neutral surface with a slate border/text color and subtle shadow so it no longer blends into the soft panel background.
- Added a hover state that brightens the surface and darkens the text.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the `Batal` button uses the new background, border, color, and shadow.

# Improve Forecast Snapshot Meter Plan

## Plan
- [x] Inspect the current `Snapshot Perkiraan` report table.
- [x] Rename the section to `Snapshot Forecasting`.
- [x] Replace the plain restock value with a stock-health meter per product.
- [x] Add red/orange/green status thresholds around the restock threshold of 50.
- [x] Verify with type checking/build and browser checks.
- [x] Record the result in this review section.

## Review
- Renamed `Snapshot Perkiraan` to `Snapshot Forecasting`.
- Replaced the plain `Saran Restok` number with a stock-health meter per forecast product.
- Added current stock, status, and restock suggestion columns.
- Forecast status is red `Restock` when stock is below 50, orange `Perlu Dipantau` for stock 50-69, and green `Aman` for stock 70+.
- Restock suggestions now show `Restock N item` only when stock is below 50; otherwise they show `Stok cukup`.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the renamed heading, 3 forecast rows, green success meters for healthy products, and red restock meter for a product below 50.

# Set Forecast Stock Threshold Plan

## Plan
- [x] Inspect product seed stock and current forecast status logic.
- [x] Set every seeded/imported product stock baseline to 50.
- [x] Calculate restock threshold as 30% of baseline stock.
- [x] Mark products as `Restock` when stock is at or below the calculated threshold.
- [x] Sort restock forecast rows to the top.
- [x] Verify with type checking/build and browser checks.
- [x] Record the result in this review section.

## Review
- Added stock constants so the default product stock is `50` and the calculated restock threshold is `ceil(50 * 30%) = 15`.
- Seeded products and imported products now start with stock `50` and low-stock threshold `15`.
- Forecasting now uses each product's calculated low-stock threshold instead of a hardcoded status cutoff.
- Products with stock at or below threshold are marked `Restock`; warning status applies up to 1.5x the threshold; healthy stock is `Aman`.
- Forecast rows are sorted with `Restock` first, then warning, then healthy rows.
- Added a `Threshold` column to make the 30% calculation visible in the report.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed the stock table has 87 rows with unique stock `[50]` and unique threshold `[15]`, and the forecasting table places the current `Restock` row first.

# Randomize Forecast Stock Range Plan

## Plan
- [x] Inspect current stock seed, transaction stock display, and forecasting stock lookup.
- [x] Seed products with deterministic stock values from 30-50 in multiples of 5.
- [x] Keep imported product stock at 50.
- [x] Calculate each product restock threshold as 30% of its seeded stock.
- [x] Ensure forecasting uses the same product stock/threshold data as transactions.
- [x] Verify with type checking/build and browser checks.
- [x] Record the result in this review section.

## Review
- Seeded product stock now cycles deterministically through `30`, `35`, `40`, `45`, and `50`.
- Imported products still start at stock `50`.
- Each product's low-stock threshold is calculated as `ceil(stock * 30%)`, producing visible stock/threshold pairs `30:9`, `35:11`, `40:12`, `45:14`, and `50:15`.
- Forecasting continues to read the same `products` state used by transactions, so stock changes in transactions affect report forecasting.
- Fixed legacy seed transaction item references so forecasting no longer falls back to stock `0` for a sold product that is missing from the product list.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed transaction product cards show only stock values `[30,35,40,45,50]`, the stock table has 87 valid rows with matching 30% thresholds, and Snapshot Forecasting no longer contains fallback `0 item` rows.

# Reset Quantity Forecast List Plan

## Plan
- [x] Inspect sidebar footer, stock reset helpers, and forecast row source.
- [x] Add a sidebar `Reset Quantity` button above the owner area.
- [x] Reset every product stock to the deterministic 30-50 range and recalculate minimum thresholds.
- [x] Change forecast label from `Threshold` to `Minimum`.
- [x] List every product in Snapshot Forecasting.
- [x] Verify with type checking/build and browser checks.
- [x] Record the result in this review section.

## Review
- Added a `Reset Quantity` button in the sidebar footer above the owner/session info.
- The button resets all current products to the deterministic `30`, `35`, `40`, `45`, `50` stock pattern and recalculates each product's 30% minimum threshold.
- `Snapshot Forecasting` now lists all products instead of only sold/top products.
- Renamed the forecasting table column from `Threshold` to `Minimum`.
- Forecast rows use stable product IDs as keys so duplicate product names render correctly.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification confirmed `Reset Quantity` appears above the owner area, Snapshot Forecasting has 87 rows, `Minimum` appears in the header, stock values are `[30,35,40,45,50]`, minimum values are `[9,11,12,14,15]`, and Reset Quantity restores stock after a transaction click changes it.

# Auto Return After Receipt Print Plan

## Plan
- [x] Inspect the receipt print handler and transaction reset flow.
- [x] Schedule a 5-second return to the initial transaction screen after `Cetak Struk`.
- [x] Clear the pending return timer if the receipt screen is left early.
- [x] Verify with type checking/build and browser flow checks.
- [x] Record the result in this review section.

## Review
- Added a receipt return timer that starts after `Cetak Struk` successfully opens the print window.
- The receipt status now tells the user the page will return to transactions in 5 seconds.
- After 5 seconds, the flow calls `resetTransaction()` and returns to the initial customer lookup screen.
- Pending return timers are cleared when the transaction is reset manually or the component unmounts.
- Verification passed with `npm run lint` and `npm run build`.
- Browser verification completed a transaction, clicked `Cetak Struk`, confirmed the 5-second return message, and confirmed the page returned to `Data Pelanggan` with the receipt screen gone after the timeout.

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
