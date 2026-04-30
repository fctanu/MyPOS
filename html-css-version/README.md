# MyPOS HTML and CSS Version

This folder contains a standalone static export of the current shipped MyPOS UI for Figma HTML-to-Design workflows.

## Files

| File | Route / State | Source |
| --- | --- | --- |
| `login.html` | `/login` | `src/features/auth/login-page.tsx` |
| `transactions-customer-lookup.html` | `/transactions` - customer lookup | `src/features/transactions/page.tsx` |
| `transactions-customer-create.html` | `/transactions` - create customer expanded | `src/features/transactions/page.tsx` |
| `transactions-order-input-expanded.html` | `/transactions` - order input, sidebar expanded | `src/features/transactions/page.tsx` |
| `transactions-order-input-collapsed.html` | `/transactions` - order input, sidebar collapsed | `src/features/transactions/page.tsx` |
| `transactions-payment-loyalty.html` | `/transactions` - subtotal and loyalty choice | `src/features/transactions/page.tsx` |
| `transactions-payment-with-points.html` | `/transactions` - payment with loyalty points | `src/features/transactions/page.tsx` |
| `transactions-payment-without-points.html` | `/transactions` - payment without loyalty points | `src/features/transactions/page.tsx` |
| `transactions-receipt.html` | `/transactions` - receipt success | `src/features/transactions/page.tsx` |
| `products-import.html` | `/products` - import tab | `src/features/products/page.tsx` |
| `products-categories.html` | `/products` - categories tab | `src/features/products/page.tsx` |
| `products-stock.html` | `/products` - stock tab | `src/features/products/page.tsx` |
| `refunds-empty.html` | `/refunds` - no sale selected | `src/features/refunds/page.tsx` |
| `refunds-selected.html` | `/refunds` - selected sale | `src/features/refunds/page.tsx` |
| `reports-default.html` | `/reports` - default state | `src/features/reports/page.tsx` |
| `reports-generated.html` | `/reports` - generated report callout | `src/features/reports/page.tsx` |

## CSS Structure

- `css/base.css`: shared design tokens, shell, components, tables, cards, buttons, form controls, and layout primitives
- `css/<page-or-state>.css`: small page-specific styling hooks for each exported HTML file

## Notes

- All files are static HTML and CSS only.
- There are no scripts, framework bundles, or Tailwind dependencies in this export.
- Primary navigation and key flow CTAs link to sibling HTML files so the exported states can be browsed directly from disk.
- Content is fixed and representative, based on the current UI copy, screenshots, and seeded demo state.
