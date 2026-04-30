# MyPOS Figma Frame Checklist

Use this as the build order for recreating the current desktop UI in Figma.

## Page 00: Foundations

- [ ] Add color styles
  - `Primary / #0056D2`
  - `Secondary / #475569`
  - `Ink / #0F172A`
  - `Muted / #757780`
  - `Canvas / #F4F8FF`
  - `White / #FFFFFF`
- [ ] Add text styles
  - `Display / 30 / Bold`
  - `Display / 24 / Bold`
  - `Display / 18 / Bold`
  - `Body / 16 / Semibold`
  - `Body / 14 / Regular`
  - `Body / 12 / Uppercase tracking`
- [ ] Add effect styles
  - `Shadow / Panel`
  - `Shadow / Deep`
- [ ] Add radius tokens
  - `16`
  - `24`
  - `28`
  - `Full`

## Page 01: Shell

- [ ] Frame: `Desktop / Shell / Expanded`
- [ ] Frame: `Desktop / Shell / Collapsed`
- [ ] Component: `Shell / Sidebar`
- [ ] Component: `Shell / Header`
- [ ] Component: `Nav / Item / Expanded / Active`
- [ ] Component: `Nav / Item / Expanded / Default`
- [ ] Component: `Nav / Item / Collapsed / Active`
- [ ] Component: `Nav / Item / Collapsed / Default`
- [ ] Component: `Button / Logout`

## Page 02: Transactions

### Customer Lookup
- [ ] Frame: `Desktop / Transactions / Customer Lookup / Default`
- [ ] Frame: `Desktop / Transactions / Customer Lookup / Search Results`
- [ ] Frame: `Desktop / Transactions / Customer Lookup / No Results`
- [ ] Frame: `Desktop / Transactions / Customer Lookup / Create Customer Expanded`

### Order Input
- [ ] Frame: `Desktop / Transactions / Order Input / Sidebar Expanded`
- [ ] Frame: `Desktop / Transactions / Order Input / Sidebar Collapsed`
- [ ] Frame: `Desktop / Transactions / Order Input / Empty Cart`
- [ ] Frame: `Desktop / Transactions / Order Input / Populated Cart`
- [ ] Frame: `Desktop / Transactions / Order Input / Search Filtered`

### Payment
- [ ] Frame: `Desktop / Transactions / Payment / Loyalty Decision`
- [ ] Frame: `Desktop / Transactions / Payment / With Points`
- [ ] Frame: `Desktop / Transactions / Payment / Without Points`

### Receipt
- [ ] Frame: `Desktop / Transactions / Receipt / Success`
- [ ] Frame: `Desktop / Transactions / Receipt / Share Actions`

## Page 03: Products

- [ ] Frame: `Desktop / Products / Import`
- [ ] Frame: `Desktop / Products / Categories / Default`
- [ ] Frame: `Desktop / Products / Categories / Add Category`
- [ ] Frame: `Desktop / Products / Categories / Edit Category`
- [ ] Frame: `Desktop / Products / Stock / Default`
- [ ] Frame: `Desktop / Products / Stock / Adjust Stock`

## Page 04: Refunds

- [ ] Frame: `Desktop / Refunds / Search`
- [ ] Frame: `Desktop / Refunds / Form / Selected Sale`
- [ ] Frame: `Desktop / Refunds / Empty State`
- [ ] Frame: `Desktop / Refunds / Success Banner`
- [ ] Frame: `Desktop / Refunds / Error Banner`

## Page 05: Reports

- [ ] Frame: `Desktop / Reports / Default`
- [ ] Frame: `Desktop / Reports / Generated State`
- [ ] Frame: `Desktop / Reports / Tables Expanded`

## Page 06: Components

### Primitives
- [ ] `Button / Primary`
- [ ] `Button / Secondary`
- [ ] `Button / Ghost`
- [ ] `Field / Input`
- [ ] `Field / Select`
- [ ] `Field / TextArea`
- [ ] `Notice / Success`
- [ ] `Notice / Error`
- [ ] `Empty State`
- [ ] `Data Table`
- [ ] `Page Section`
- [ ] `Stat Card / Default`
- [ ] `Stat Card / Accent`
- [ ] `Stat Card / Success`

### Transactions
- [ ] `Transactions / Search Hero`
- [ ] `Transactions / Search Field with Icon`
- [ ] `Transactions / Stat Tile / Produk`
- [ ] `Transactions / Stat Tile / Keranjang`
- [ ] `Transactions / Category Chip / Selected`
- [ ] `Transactions / Category Chip / Default`
- [ ] `Transactions / Product Card`
- [ ] `Transactions / Checkout Panel`
- [ ] `Transactions / Cart Row`
- [ ] `Transactions / Quantity Stepper`
- [ ] `Transactions / Total Summary`
- [ ] `Transactions / Payment Card`
- [ ] `Transactions / Receipt Row`

### Products
- [ ] `Products / Tab Chip / Active`
- [ ] `Products / Tab Chip / Default`
- [ ] `Products / Stock Badge / Normal`
- [ ] `Products / Stock Badge / Low`

### Refunds
- [ ] `Refunds / Search Result Row`
- [ ] `Refunds / Quantity Input`

### Reports
- [ ] `Reports / Metric Card`
- [ ] `Reports / Generated Callout`

## Suggested Build Order

1. Foundations
2. Shell
3. Shared components
4. Transactions
5. Products
6. Refunds
7. Reports

## Suggested Review Passes

- [ ] Spacing pass
- [ ] Typography pass
- [ ] States pass
- [ ] Sidebar expanded/collapsed consistency pass
- [ ] Data-table consistency pass
