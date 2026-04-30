# MyPOS Desktop UI Figma Handoff Spec

Source of truth: current React/Tailwind code in this repo.
Scope: desktop only.
Goal: recreate the current shipped UI in Figma as accurately as possible before any redesign.

## 1. Product Surface

### Routes
- `/login`
- `/transactions`
- `/refunds`
- `/products`
- `/reports`

### Core UX model
- Local-first POS app with role-based login.
- Shared desktop shell with left sidebar and top header.
- Primary cashier flow lives in `Transactions`.
- Owner/admin workflows live in `Products`, `Refunds`, and `Reports`.

## 2. Design Tokens

### Colors
- `Primary`: `#0056D2`
- `Secondary`: `#475569`
- `Ink`: `#0F172A`
- `Muted`: `#757780`
- `Canvas`: `#F4F8FF`
- `White`: `#FFFFFF`

### Typography
- `Display`: `"Space Grotesk"` for page titles, large totals, stat numbers.
- `Body`: `"Instrument Sans"` for everything else.

### Border Radius
- Shell cards: `24px`
- Hero/search panels and login shell: `28px`
- Buttons/inputs/selects/textareas: `16px`
- Pills/chips: full radius / rounded-full
- Small badges: `12px` to full radius depending on context

### Shadows
- Standard panel shadow: `0 18px 48px rgba(15, 23, 42, 0.10)`
- Stronger custom shadows appear in the transactions page header/search/stat area and collapsed sidebar active icon.

### Spacing Rhythm
- Common card padding: `24px`
- Dense sub-sections: `16px` to `20px`
- Page content padding desktop: `24px`
- Common gaps: `8px`, `12px`, `16px`, `24px`

## 3. App Shell

### Desktop Frame
- Use a desktop master frame around `1440 x 1024` for Figma recreation.
- Layout is fluid horizontally, but these fixed shell dimensions matter:
  - Expanded sidebar width: `244px`
  - Collapsed sidebar width: `84px`
  - Header height: `64px`

### Structure
- Left sidebar
- Top header
- Main content area with `24px` padding

### Sidebar
- Background: white
- Right divider: subtle `secondary/10`
- Expanded state:
  - Brand block at top
  - Navigation list with icon + text
  - Footer user info + logout button
- Collapsed state:
  - Only icon tiles
  - Tooltip labels on hover
  - Active state uses color on the icon tile, not a larger item box

### Sidebar Nav Item
- Container height: `48px`
- Icon tile: `40 x 40`
- Expanded active:
  - Blue row background
  - White text
  - Icon tile uses translucent white background
- Expanded inactive:
  - White background
  - Secondary text
  - Icon tile uses `secondary/10` background and primary icon
- Collapsed active:
  - Transparent outer row
  - Blue icon tile
  - White icon
- Collapsed inactive:
  - Transparent outer row
  - Soft gray icon tile
  - Primary icon

### Top Header
- Sticky
- Background: canvas with slight transparency/backdrop blur
- Left: current route title
- Right: live clock and date

## 4. Screen Inventory

### Screen A: Login
Source: `src/features/auth/login-page.tsx`

#### Frame
- Centered single card on canvas background
- Card width: about `448px max`

#### Content
- Brand kicker: `POS Lokal`
- Title: store name
- Subtitle: role selection prompt
- Two stacked role cards:
  - `Karyawan`
  - `Pemilik`
- Optional name input
- Full-width primary CTA `Masuk`

#### States
- Role card default
- Role card selected
- CTA disabled until role chosen

### Screen B: Transactions, Step 1, Customer Lookup
Source: `TransactionsPage`, `step === "customer-lookup"`

#### Frame
- Single main content card
- Width constrained to approximately `max-w-2xl`

#### Content
- Title: `Data Pelanggan`
- Subtitle: search instruction
- One labeled input: `Cari pelanggan`
- Search results list appears below when query exists
- Empty search-result notice if no customer matches
- CTA row:
  - `Buat Pelanggan Baru`
  - `Lewati (Pelanggan Umum)`

#### Secondary State
- Inline create-customer form card beneath lookup card
- Fields:
  - Nama
  - Telepon
  - Alamat
- Actions:
  - Simpan
  - Batal

#### States
- Initial state
- Searching with matches
- Searching with no results
- Create customer expanded
- Notice success/error below cards

### Screen C: Transactions, Step 2, Order Input
Source: `TransactionsPage`, `step === "order-input"`

This is the most important screen to reconstruct faithfully.

#### Overall Layout
- Two-column desktop grid
- Main catalog column + sticky checkout column
- Grid ratios:
  - Expanded sidebar: `minmax(0, 2.45fr) / 340px`
  - Collapsed sidebar: `minmax(0, 3fr) / 320px`

#### Left Column, Section 1: Search / Category Header Panel
- Rounded white parent section
- Top inner hero panel with subtle blue/ink/white gradient
- Row 1:
  - Search card on left
  - Two stat cards on right
- Row 2:
  - Horizontal category chips

#### Search Card
- Label: `Cari produk`
- Large search input with leading search icon
- If customer selected:
  - Small secondary text line below input with customer name and loyalty points

#### Stat Cards
- Card 1: `Produk`
  - White card
  - Large number
  - Small status text `Ready`
- Card 2: `Keranjang`
  - Dark ink card
  - Large number
  - Small status text `Aktif`

#### Category Chips
- Horizontal, scrollable
- Selected chip: blue background, white text
- Unselected chip: white/soft background, secondary text

#### Left Column, Section 2: Product Grid
- Product cards on canvas-tinted background inside white section
- Grid behavior:
  - `sm`: 2 columns
  - `lg`: 3 columns
  - `xl`: 4 columns when sidebar expanded
  - `xl`: 5 columns when sidebar collapsed

#### Product Card
- Rounded card on canvas background
- Top row:
  - Product name
  - Stock pill on right
- Bottom:
  - Category label in tiny uppercase muted text
  - Large primary price in display type

#### Right Column: Checkout Panel
- Sticky white panel
- Header:
  - Kicker `Checkout`
  - Title `Pesanan`
  - `Kosongkan` ghost button
- Scrollable list of cart rows
- Bottom summary area:
  - Notice blocks if present
  - Dark total card with total and item count
  - Full-width CTA `Proses Pesanan`

#### Cart Row
- Product name
- Price mode label
- Remove action
- Quantity stepper:
  - minus button
  - numeric field
  - plus button

#### States
- Empty cart
- Populated cart
- Category selected
- Search filtered
- Sidebar expanded
- Sidebar collapsed

### Screen D: Transactions, Step 3, Payment
Source: `subtotal-loyalty`, `payment-with-points`, `payment-without-points`

#### Frame
- Narrow centered card, approximately `max-w-2xl`

#### Common Elements
- Back button with icon
- Title
- Financial summary cards
- Payment method select
- Primary CTA

#### Variant D1: Subtotal + Loyalty Decision
- Subtotal card
- Loyalty balance card if customer has points
- Decision card:
  - `Ya, Gunakan Poin`
  - `Tidak`
- Result card if points applied
- Earned points info card

#### Variant D2: Payment With Points
- Subtotal
- Points used
- Final payable total
- Payment method select
- CTA `Print Struk`

#### Variant D3: Payment Without Points
- Single dark total card
- Payment method select
- CTA `Print Struk`

### Screen E: Transactions, Step 4, Receipt Success
Source: `step === "receipt"`

#### Frame
- Narrow centered card

#### Content
- Title `Transaksi Selesai`
- Receipt number card
- Two-up stat cards:
  - Total
  - Item count
- Optional points used card
- Earned points card
- Receipt summary list
- Primary action: `Cetak Struk`
- Secondary action row:
  - `Bagikan ke WhatsApp`
  - `Salin Teks Struk`
- Informational helper text card about WhatsApp share behavior

### Screen F: Products
Source: `src/features/products/page.tsx`

#### Layout
- Top tab switcher:
  - `Import Produk`
  - `Kategori`
  - `Stok`
- One active content card below

#### Variant F1: Import Produk
- Title + subtitle
- Native file input
- Tiny helper text describing CSV format
- Success or failure banner
- Data table preview of first 20 products

#### Variant F2: Kategori
- Header with title/subtitle and `Tambah Kategori` button
- Inline add/edit category panel when active
- Success/failure banner
- Data table with category rows

#### Variant F3: Stok
- Title + subtitle
- Data table with stock badges
- Inline stock adjustment panel when active
- Notice blocks

### Screen G: Refunds
Source: `src/features/refunds/page.tsx`

#### Layout
- Stacked page sections

#### Section 1: Pencarian Refund
- Single search input
- Data table of matching sales
- Row CTA `Pilih`

#### Section 2: Form Refund
- If no selected sale:
  - empty state
- If selected sale:
  - table of sale items
  - quantity input per row
  - refund reason textarea
  - CTA `Proses Refund`
  - inline success/failure banners
  - notice blocks

### Screen H: Reports
Source: `src/features/reports/page.tsx`

#### Section 1: Kontrol Periode
- Two date inputs
- `Generate Laporan Bulanan`
- `Buat Perkiraan`

#### Section 2: Core Metric Cards
- Total Penjualan
- Total Refund
- Jumlah Transaksi
- Pergerakan Stok

#### Section 3: Growth Metric Cards
- Sales Selesai
- Struk Dibagikan
- Share Rate Struk

#### Section 4: Generated Report Success Panel
- Appears only after report generation
- Period summary
- Total penjualan
- `Simpan Laporan`

#### Section 5: Snapshot Tables
- Saved reports table
- Forecast table

## 5. Component Inventory

### Global Components
- `App Shell`
- `Sidebar`
- `Top Header`
- `Sidebar Nav Item`
- `Tooltip`
- `Page Section`
- `Stat Card`
- `Data Table`
- `Empty State`
- `Notice`

### Form Controls
- `Button`
  - Variants: `primary`, `secondary`, `ghost`
  - States: default, hover, focus, disabled
- `Input`
  - States: default, placeholder, focus
- `Select`
  - States: default, focus
- `TextArea`
  - States: default, focus

### Transactions-Specific Components
- `Customer Result Row`
- `Create Customer Form Card`
- `Search Hero Panel`
- `Search Input with Leading Icon`
- `Stat Tile / Metric Tile`
- `Category Chip`
- `Product Card`
- `Checkout Panel`
- `Cart Item Row`
- `Quantity Stepper`
- `Total Summary Card`
- `Payment Summary Card`
- `Loyalty Decision Card`
- `Receipt Summary Row`
- `Share Action Row`

### Products-Specific Components
- `Tab Chip`
- `File Upload Row`
- `Category Form Card`
- `Stock Adjustment Card`
- `Stock Badge`

### Refunds-Specific Components
- `Sale Search Result Table`
- `Refund Quantity Input Row`
- `Refund Result Banner`

### Reports-Specific Components
- `Date Range Control Row`
- `Metric Card Grid`
- `Report Generated Callout`
- `Reports Table`

## 6. Component Variants and States

### Sidebar
- Expanded
- Collapsed
- Mobile drawer open
- Mobile drawer closed

### Buttons
- Primary
- Secondary
- Ghost
- Disabled
- Full-width CTA

### Chips
- Category chip selected
- Category chip unselected

### Cards
- White standard card
- Canvas-tinted card
- Dark ink summary card
- Accent card with primary tint

### Notices and Banners
- Success
- Error

### Empty States
- No products found
- No cart items
- No refund selection

### Transaction Flow States
- Customer lookup
- Create customer expanded
- Order input
- Payment summary with loyalty
- Payment summary without loyalty
- Receipt complete

## 7. Figma File Structure Recommendation

### Pages
- `00 Foundations`
- `01 Shell`
- `02 Transactions`
- `03 Products`
- `04 Refunds`
- `05 Reports`
- `06 Components`

### 00 Foundations
- Color styles
- Text styles
- Radius reference
- Spacing reference
- Shadow reference

### 01 Shell
- Sidebar expanded
- Sidebar collapsed
- Header
- Full shell layout

### 02 Transactions
- Customer lookup
- Customer create expanded
- Order input
- Order input with sidebar collapsed
- Payment: loyalty decision
- Payment: with points
- Payment: without points
- Receipt success

### 03 Products
- Import tab
- Categories tab
- Stock tab

### 04 Refunds
- Refund search + form selected
- Refund empty state

### 05 Reports
- Reports dashboard
- Reports with generated callout

### 06 Components
- All reusable primitives and screen-specific atoms/molecules

## 8. Naming Recommendation for Figma Layers

### Frame naming
- `Desktop / Transactions / Customer Lookup`
- `Desktop / Transactions / Order Input / Sidebar Expanded`
- `Desktop / Transactions / Order Input / Sidebar Collapsed`
- `Desktop / Transactions / Payment / Loyalty`
- `Desktop / Transactions / Receipt`
- `Desktop / Products / Import`
- `Desktop / Products / Categories`
- `Desktop / Products / Stock`
- `Desktop / Refunds / Search + Form`
- `Desktop / Reports / Default`

### Component naming
- `Shell / Sidebar`
- `Shell / Header`
- `Nav / Item`
- `Button / Primary`
- `Button / Secondary`
- `Button / Ghost`
- `Field / Input`
- `Field / Select`
- `Field / TextArea`
- `Card / Product`
- `Card / Stat`
- `Card / Summary`
- `Chip / Category`
- `Table / Data`
- `Notice / Success`
- `Notice / Error`

## 9. Notes for Reconstruction Accuracy

### Important behavioral details to preserve visually
- The app relies heavily on rounded geometry and soft separation rather than hard borders.
- Blue is the strongest accent and should be reserved for selected/active emphasis, totals, and primary CTAs.
- Dark ink cards are used sparingly to signal important financial summaries.
- Typography hierarchy is clear:
  - display font for titles and big numbers
  - body font for labels and support copy
- Desktop layouts are fluid, but shell dimensions and card radii are consistent enough to systematize in Figma.

### Known current-product quirks to document, not redesign
- Customer lookup remains a single-column flow.
- Products tab uses native file input styling for import.
- Reports page mixes metric cards and raw tables rather than a more editorial dashboard pattern.
- Some transaction and receipt helper copy is operational rather than polished; preserve as-is if this is a strict reconstruction.

## 10. Suggested Next Artifact

After recreating these frames in Figma, the next useful document would be:
- `Component-to-code map`

That would map each Figma component/frame back to:
- source file
- route
- major states
- reusable primitives
