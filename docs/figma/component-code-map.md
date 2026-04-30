# MyPOS Component-to-Code Map

This document maps the Figma reconstruction to the source files that define current behavior and styling.

## 1. Shell

### `Shell / Sidebar`
- Source: [src/app/layouts/app-shell.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\app\layouts\app-shell.tsx)
- Responsibilities:
  - expanded/collapsed sidebar
  - mobile drawer behavior
  - nav item rendering
  - footer user section

### `Shell / Header`
- Source: [src/app/layouts/app-shell.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\app\layouts\app-shell.tsx)
- Responsibilities:
  - route title
  - live time
  - date display

### `Nav / Item`
- Source: [src/app/layouts/app-shell.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\app\layouts\app-shell.tsx)
- States:
  - expanded active
  - expanded default
  - collapsed active
  - collapsed default

## 2. Shared Primitives

### `Page Section`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)

### `Stat Card`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)
- Variants:
  - `default`
  - `accent`
  - `success`

### `Input`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)

### `Select`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)

### `TextArea`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)

### `Button`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)
- Variants:
  - `primary`
  - `secondary`
  - `ghost`

### `Notice`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)
- Variants:
  - success
  - error

### `Data Table`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)

### `Empty State`
- Source: [src/shared/components/ui.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\components\ui.tsx)

## 3. Foundations

### Color and font tokens
- Source: [tailwind.config.ts](C:\Users\fctan\Desktop\projects\MyPOS\tailwind.config.ts)

### Root background and font defaults
- Source: [src/index.css](C:\Users\fctan\Desktop\projects\MyPOS\src\index.css)

## 4. Login

### `Login / Role Card`
- Source: [src/features/auth/login-page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\auth\login-page.tsx)

### `Login / Name Field`
- Source: [src/features/auth/login-page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\auth\login-page.tsx)

### `Login / Primary CTA`
- Source: [src/features/auth/login-page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\auth\login-page.tsx)

## 5. Transactions

### `Transactions / Customer Lookup`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- State key:
  - `step === "customer-lookup"`

### `Transactions / Customer Search Result Row`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)

### `Transactions / Create Customer Form`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- Trigger:
  - `showCreateForm === true`

### `Transactions / Search Hero`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- Contains:
  - search card
  - stat tiles
  - category chips

### `Transactions / Search Input with Icon`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- Icon source:
  - local `SearchIcon`

### `Transactions / Stat Tile`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- Tiles:
  - `Produk`
  - `Keranjang`

### `Transactions / Category Chip`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- States:
  - selected
  - default

### `Transactions / Product Card`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- Layout changes with sidebar state through `sidebarCollapsed`

### `Transactions / Checkout Panel`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)

### `Transactions / Cart Row`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)

### `Transactions / Quantity Stepper`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)

### `Transactions / Payment Screens`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- State keys:
  - `subtotal-loyalty`
  - `payment-with-points`
  - `payment-without-points`

### `Transactions / Receipt Success`
- Source: [src/features/transactions/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\transactions\page.tsx)
- State key:
  - `receipt`

### `Transactions / Receipt HTML`
- Source: [src/shared/lib/receipt.ts](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\lib\receipt.ts)
- Use this for the printed receipt artifact, not the in-app receipt summary card.

### `Transactions / Receipt Share`
- Source: [src/shared/lib/receipt-share.ts](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\lib\receipt-share.ts)
- In-app CTA placement lives in the transactions page.

## 6. Products

### `Products / Tab Navigation`
- Source: [src/features/products/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\products\page.tsx)

### `Products / Import`
- Source: [src/features/products/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\products\page.tsx)

### `Products / Category Management`
- Source: [src/features/products/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\products\page.tsx)

### `Products / Stock Management`
- Source: [src/features/products/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\products\page.tsx)

## 7. Refunds

### `Refunds / Search`
- Source: [src/features/refunds/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\refunds\page.tsx)

### `Refunds / Refund Form`
- Source: [src/features/refunds/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\refunds\page.tsx)

### `Refunds / Empty State`
- Source: [src/features/refunds/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\refunds\page.tsx)

## 8. Reports

### `Reports / Period Controls`
- Source: [src/features/reports/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\reports\page.tsx)

### `Reports / Core Metrics`
- Source: [src/features/reports/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\reports\page.tsx)
- Built with shared `StatCard`

### `Reports / Growth Metrics`
- Source: [src/features/reports/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\reports\page.tsx)
- Data source:
  - [src/shared/lib/growth-metrics.ts](C:\Users\fctan\Desktop\projects\MyPOS\src\shared\lib\growth-metrics.ts)

### `Reports / Generated Callout`
- Source: [src/features/reports/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\reports\page.tsx)
- Trigger:
  - `reportGenerated === true`

### `Reports / Tables`
- Source: [src/features/reports/page.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\features\reports\page.tsx)

## 9. Data and State Sources to Mention in Figma Notes

### App-wide state
- Source: [src/app/providers/app-provider.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\app\providers\app-provider.tsx)

### Auth/session state
- Source: [src/app/providers/auth-provider.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\app\providers\auth-provider.tsx)

### Routing
- Source: [src/app/router/index.tsx](C:\Users\fctan\Desktop\projects\MyPOS\src\app\router\index.tsx)

## 10. Recommended Annotation Pattern in Figma

For each frame or component, attach a note like:

- `Source file`
- `Route`
- `Major state`
- `Reused component?`

Example:

- `Source: src/features/transactions/page.tsx`
- `Route: /transactions`
- `State: order-input`
- `Uses: Button, Input, EmptyState, Notice`
