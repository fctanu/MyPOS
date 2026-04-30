# MyPOS Employee-Focused Restructuring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the 12-menu POS system into a login-gated, 4-menu employee application with loyalty points support, multi-step transaction flows, and simplified product/refund/report management.

**Architecture:** Add authentication layer (login page + auth context + route guard) wrapping the existing app, simplify sidebar navigation to 4 menus conditional on role, rebuild Transactions page as a multi-step state machine (customer lookup → order input → loyalty decision → payment → receipt), enhance Refund/Product/Reports pages with explicit success/failure states and tabbed layouts. All data remains in localStorage via the existing repository pattern.

**Tech Stack:** React 18, TypeScript, react-router-dom v7, Tailwind CSS, Zod, localStorage, Vite

---

## Task 1: Add UserSession model and session storage key

**Files:**
- Modify: `src/domain/models/index.ts`
- Modify: `src/storage/local/keys.ts`

**Step 1: Add UserSession interface to models**

In `src/domain/models/index.ts`, after line 11 (after `export type DeliveryStatus`), add:

```typescript
export interface UserSession {
  id: string;
  role: Role;
  name: string;
  loginAt: string;
}
```

**Step 2: Add session storage key**

In `src/storage/local/keys.ts`, add to the `storageKeys` object:

```typescript
session: `mypos:${STORAGE_VERSION}:session`,
```

**Step 3: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS

---

## Task 2: Create Auth Provider

**Files:**
- Create: `src/app/providers/auth-provider.tsx`
- Modify: `src/app/App.tsx`

**Step 1: Create auth-provider.tsx**

Create `src/app/providers/auth-provider.tsx` with this content:

```typescript
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role, UserSession } from "@/domain/models";
import { loadJson, saveJson } from "@/storage/local/base";
import { storageKeys } from "@/storage/local/keys";
import { createId, nowIso } from "@/shared/lib/id";

interface AuthContextValue {
  session: UserSession | null;
  login: (role: Role, name: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): UserSession | null {
  return loadJson<UserSession | null>(storageKeys.session, null);
}

function saveSession(session: UserSession | null) {
  saveJson(storageKeys.session, session);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(loadSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoggedIn: session !== null,
      login: (role: Role, name: string) => {
        const newSession: UserSession = {
          id: createId("ses"),
          role,
          name: name.trim() || (role === "owner" ? "Pemilik" : "Karyawan"),
          loginAt: nowIso(),
        };
        setSession(newSession);
        saveSession(newSession);
      },
      logout: () => {
        setSession(null);
        saveSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
```

**Step 2: Wrap App with AuthProvider**

In `src/app/App.tsx`, replace entire file with:

```typescript
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/app/providers/auth-provider";
import { AppProvider } from "@/app/providers/app-provider";
import { router } from "@/app/router";

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}
```

**Step 3: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS

---

## Task 3: Create Auth Guard

**Files:**
- Create: `src/app/guards/auth-guard.tsx`

**Step 1: Create auth-guard.tsx**

Create `src/app/guards/auth-guard.tsx`:

```typescript
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import type { ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS

---

## Task 4: Create Login Page

**Files:**
- Create: `src/features/auth/login-page.tsx`

**Step 1: Create login-page.tsx**

Create `src/features/auth/login-page.tsx`:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import type { Role } from "@/domain/models";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState("");

  if (isLoggedIn) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogin = () => {
    if (!selectedRole) return;
    login(selectedRole, name);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <section className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-panel">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">POS Lokal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">MyPOS Sumber Kasih</h1>
          <p className="mt-2 text-sm text-muted">Pilih peran Anda untuk masuk</p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setSelectedRole("employee")}
            className={cn(
              "w-full rounded-2xl border-2 px-6 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              selectedRole === "employee"
                ? "border-primary bg-primary/6"
                : "border-secondary/12 hover:border-primary/30",
            )}
          >
            <div className="font-semibold text-ink">Karyawan</div>
            <div className="mt-1 text-sm text-muted">Akses ke transaksi, refund, produk, dan laporan</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("owner")}
            className={cn(
              "w-full rounded-2xl border-2 px-6 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              selectedRole === "owner"
                ? "border-primary bg-primary/6"
                : "border-secondary/12 hover:border-primary/30",
            )}
          >
            <div className="font-semibold text-ink">Pemilik</div>
            <div className="mt-1 text-sm text-muted">Akses penuh ke semua fitur</div>
          </button>
        </div>

        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm text-muted">
            <span>Nama (opsional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="rounded-2xl bg-canvas px-4 py-2.5 text-sm text-ink outline-none ring-1 ring-inset ring-secondary/12 focus-visible:ring-2 focus-visible:ring-primary/18"
            />
          </label>
        </div>

        <Button
          className="mt-6 w-full py-3 text-base"
          onClick={handleLogin}
          disabled={!selectedRole}
        >
          Masuk
        </Button>
      </section>
    </div>
  );
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS

---

## Task 5: Simplify Routing

**Files:**
- Modify: `src/app/router/index.tsx`

**Step 1: Replace entire router file**

Replace `src/app/router/index.tsx` with:

```typescript
import { createBrowserRouter } from "react-router-dom";
import { AuthGuard } from "@/app/guards/auth-guard";
import { AppShell } from "@/app/layouts/app-shell";
import { LoginPage } from "@/features/auth/login-page";
import { TransactionsPage } from "@/features/transactions/page";
import { RefundsPage } from "@/features/refunds/page";
import { ProductsPage } from "@/features/products/page";
import { ReportsPage } from "@/features/reports/page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <TransactionsPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "refunds", element: <RefundsPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);
```

**Step 2: Verify type errors** (expected — pages don't exist yet)

Run: `npx tsc --noEmit`
Expected: FAIL — TransactionsPage and ProductsPage not found

---

## Task 6: Simplify Sidebar to 4 Menus

**Files:**
- Modify: `src/app/layouts/app-shell.tsx`

**Step 1: Replace navItems array**

In `src/app/layouts/app-shell.tsx`, replace lines 168-181 (the `navItems` constant) with:

```typescript
const employeeNavItems = [
  { to: "/transactions", label: "Transaksi", icon: PosIcon },
  { to: "/refunds", label: "Refund", icon: RotateIcon },
  { to: "/products", label: "Produk", icon: BoxIcon },
  { to: "/reports", label: "Laporan", icon: ChartIcon },
];

const ownerNavItems = [
  { to: "/transactions", label: "Transaksi", icon: PosIcon },
  { to: "/refunds", label: "Refund", icon: RotateIcon },
  { to: "/products", label: "Produk", icon: BoxIcon },
  { to: "/reports", label: "Laporan", icon: ChartIcon },
];
```

**Step 2: Add conditional navItems in AppShell**

In the `AppShell` function, after `const { state } = useAppContext();`, add:

```typescript
const navItems = state.settings.activeRole === "owner" ? ownerNavItems : employeeNavItems;
```

**Step 3: Update header title fallback**

Change line 333 from:
```typescript
<h2 className="truncate font-display text-lg font-bold text-ink">{activeItem?.label ?? state.settings.storeName}</h2>
```
to:
```typescript
<h2 className="truncate font-display text-lg font-bold text-ink">{activeItem?.label ?? "Transaksi"}</h2>
```

**Step 4: Verify type errors** (expected — pages don't exist yet)

Run: `npx tsc --noEmit`
Expected: FAIL — TransactionsPage and ProductsPage not found

---

## Task 7: Add Loyalty Points Service Functions

**Files:**
- Modify: `src/domain/services/sales-service.ts`
- Modify: `src/app/providers/app-provider.tsx`

**Step 1: Add loyalty functions to sales-service.ts**

Add at the end of `src/domain/services/sales-service.ts` (after line 129):

```typescript
export function calculateLoyaltyEarn(total: number): number {
  return Math.floor(total * 0.01);
}

export function calculateLoyaltyDeduction(
  availablePoints: number,
  total: number,
): { pointsUsed: number; finalTotal: number } {
  if (availablePoints >= total) {
    return { pointsUsed: total, finalTotal: 0 };
  }
  return { pointsUsed: availablePoints, finalTotal: total - availablePoints };
}

export function applyLoyaltyPointsToSale(
  state: AppState,
  input: {
    cart: CartInput[];
    paymentMethod: PaymentMethod;
    customerId: string;
    cashierRole: AppState["settings"]["activeRole"];
    useLoyaltyPoints: boolean;
  },
) {
  const customer = state.customers.find((c) => c.id === input.customerId);
  if (!customer) {
    throw new Error("Pelanggan tidak ditemukan.");
  }

  const quoted = quoteCart(state, input.cart);
  if (!quoted.items.length) {
    throw new Error("Tambahkan minimal satu produk ke keranjang.");
  }

  for (const item of quoted.items) {
    const available = getProductStock(state, item.product.id);
    if (available < item.quantity) {
      throw new Error(`Stok untuk ${item.product.name} tidak mencukupi.`);
    }
  }

  let finalTotal = quoted.total;
  let pointsUsed = 0;
  let newLoyaltyPoints = customer.loyaltyPoints;

  if (input.useLoyaltyPoints && customer.loyaltyPoints > 0) {
    const deduction = calculateLoyaltyDeduction(customer.loyaltyPoints, quoted.total);
    pointsUsed = deduction.pointsUsed;
    finalTotal = deduction.finalTotal;
    newLoyaltyPoints = customer.loyaltyPoints - pointsUsed;
  }

  const earnedPoints = calculateLoyaltyEarn(quoted.total);
  newLoyaltyPoints += earnedPoints;

  const saleItems: SaleItem[] = quoted.items.map((item) => ({
    id: createId("sli"),
    productId: item.product.id,
    productName: item.product.name,
    sku: item.product.sku,
    quantity: item.quantity,
    unit: item.product.unit,
    unitPrice: item.unitPrice,
    priceMode: item.priceMode,
    subtotal: item.subtotal,
  }));

  const sale: Sale = {
    id: createId("sal"),
    receiptNumber: createSequence("RCPT", state.sales.length),
    customerId: customer.id,
    customerName: customer.name,
    items: saleItems,
    total: quoted.total,
    paymentMethod: input.paymentMethod,
    cashierRole: input.cashierRole,
    createdAt: nowIso(),
  };

  const stockEntries: StockLedgerEntry[] = saleItems.map((item) => ({
    id: createId("stk"),
    productId: item.productId,
    quantityDelta: item.quantity * -1,
    reason: "sale",
    referenceId: sale.id,
    note: `Penjualan ${sale.receiptNumber}`,
    createdAt: sale.createdAt,
  }));

  const withInventory = appendStockEntries(state, stockEntries);

  const updatedCustomers = withInventory.customers.map((c) =>
    c.id === customer.id ? { ...c, loyaltyPoints: newLoyaltyPoints, updatedAt: nowIso() } : c,
  );

  const nextState = {
    ...withInventory,
    sales: [sale, ...withInventory.sales],
    customers: updatedCustomers,
  };

  return { nextState, sale, pointsUsed, earnedPoints, finalTotal };
}
```

**Step 2: Add checkoutSaleWithLoyalty to app-provider.tsx**

In `src/app/providers/app-provider.tsx`, add to the `AppContextValue` interface (before the closing `}`):

```typescript
  checkoutSaleWithLoyalty: (input: { cart: Array<{ productId: string; quantity: number }>; paymentMethod: PaymentMethod; customerId: string; useLoyaltyPoints: boolean }) => { sale: AppState["sales"][number]; pointsUsed: number; earnedPoints: number; finalTotal: number };
```

In the import statement at the top, add `applyLoyaltyPointsToSale` to the sales-service import:

Change:
```typescript
import { prepareCheckoutSale } from "@/domain/services/sales-service";
```
to:
```typescript
import { prepareCheckoutSale, applyLoyaltyPointsToSale } from "@/domain/services/sales-service";
```

In the `useMemo` value object, add before the closing `}),`:

```typescript
      checkoutSaleWithLoyalty: (input) => {
        const { nextState, sale, pointsUsed, earnedPoints, finalTotal } = applyLoyaltyPointsToSale(state, {
          ...input,
          cashierRole: state.settings.activeRole,
        });
        applyState(nextState);
        return { sale, pointsUsed, earnedPoints, finalTotal };
      },
```

**Step 3: Verify type errors** (expected — pages don't exist yet)

Run: `npx tsc --noEmit`
Expected: FAIL — TransactionsPage and ProductsPage not found

---

## Task 8: Create Transactions Page

**Files:**
- Create: `src/features/transactions/page.tsx`

**Step 1: Create the Transactions page**

Create `src/features/transactions/page.tsx`. This is the largest file implementing the full multi-step flow. Due to file size, create it with the write tool using this content:

```typescript
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppContext } from "@/app/providers/app-provider";
import type { ShellOutletContext } from "@/app/layouts/app-shell";
import type { Customer, PaymentMethod, Sale } from "@/domain/models";
import { getProductStock } from "@/domain/services/inventory-service";
import { calculateLoyaltyEarn, quoteCart } from "@/domain/services/sales-service";
import { Button, EmptyState, Input, Notice, Select } from "@/shared/components/ui";
import { formatCurrency } from "@/shared/lib/format";
import { translatePriceMode } from "@/shared/lib/labels";
import { cn } from "@/shared/lib/cn";
import { useNotice } from "@/shared/hooks/use-notice";
import { printSaleReceipt } from "@/shared/lib/receipt";

type CartLine = { productId: string; quantity: number };
type FlowStep =
  | "customer-lookup"
  | "order-input"
  | "subtotal-loyalty"
  | "payment-with-points"
  | "payment-without-points"
  | "receipt";

export function TransactionsPage() {
  const { sidebarCollapsed = false } = useOutletContext<ShellOutletContext>();
  const { state, checkoutSale, createCustomer, checkoutSaleWithLoyalty } = useAppContext();
  const notice = useNotice();

  const [step, setStep] = useState<FlowStep>("customer-lookup");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [cart, setCart] = useState<CartLine[]>([]);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<"all" | string>("all");

  const matchingCustomers = useMemo(
    () =>
      state.customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.phone && c.phone.includes(searchQuery)),
      ),
    [searchQuery, state.customers],
  );

  const matches = useMemo(
    () =>
      state.products.filter(
        (product) =>
          product.active &&
          (activeCategoryId === "all" || product.categoryId === activeCategoryId) &&
          [product.name, product.sku].some((value) => value.toLowerCase().includes(query.toLowerCase())),
      ),
    [activeCategoryId, query, state.products],
  );

  const quoted = useMemo(() => quoteCart(state, cart), [cart, state]);
  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }
    setCart((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery("");
    setStep("order-input");
  };

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim()) {
      notice.failure(new Error("Nama pelanggan wajib diisi."));
      return;
    }
    try {
      createCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || undefined,
        address: newCustomerAddress.trim() || undefined,
      });
      notice.success("Pelanggan baru berhasil dibuat.");
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
      setShowCreateForm(false);
      setStep("customer-lookup");
    } catch (error) {
      notice.failure(error);
    }
  };

  const handleProcessOrder = () => {
    if (!quoted.items.length) {
      notice.failure(new Error("Tambahkan minimal satu produk ke keranjang."));
      return;
    }
    setStep("subtotal-loyalty");
  };

  const handleConfirmPayment = () => {
    notice.clear();
    try {
      if (!selectedCustomer) {
        throw new Error("Pilih pelanggan terlebih dahulu.");
      }

      if (useLoyaltyPoints) {
        const result = checkoutSaleWithLoyalty({
          cart,
          paymentMethod,
          customerId: selectedCustomer.id,
          useLoyaltyPoints: true,
        });
        setCompletedSale(result.sale);
        setPointsUsed(result.pointsUsed);
        setEarnedPoints(result.earnedPoints);
        setFinalTotal(result.finalTotal);
      } else {
        const sale = checkoutSale({
          cart,
          paymentMethod,
          customerId: selectedCustomer.id,
        });
        const earned = calculateLoyaltyEarn(sale.total);
        setCompletedSale(sale);
        setPointsUsed(0);
        setEarnedPoints(earned);
        setFinalTotal(sale.total);
      }

      setCart([]);
      setStep("receipt");
      notice.success("Transaksi berhasil diselesaikan.");
    } catch (error) {
      notice.failure(error);
    }
  };

  const handlePrintReceipt = () => {
    if (!completedSale) return;
    try {
      printSaleReceipt({
        storeName: state.settings.storeName,
        footer: state.settings.receiptFooter,
        sale: completedSale,
      });
    } catch (error) {
      notice.failure(error);
    }
  };

  const handleNewTransaction = () => {
    setSelectedCustomer(null);
    setCart([]);
    setCompletedSale(null);
    setPaymentMethod("cash");
    setUseLoyaltyPoints(false);
    setPointsUsed(0);
    setEarnedPoints(0);
    setFinalTotal(0);
    setSearchQuery("");
    setStep("customer-lookup");
  };

  const customerForOrder = selectedCustomer
    ? state.customers.find((c) => c.id === selectedCustomer.id) ?? selectedCustomer
    : null;

  if (step === "customer-lookup") {
    return (
      <div className="max-w-2xl space-y-6">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Data Pelanggan</h1>
          <p className="mt-1 text-sm text-muted">Cari pelanggan berdasarkan nama atau nomor telepon</p>

          <div className="mt-4">
            <Input
              label="Cari pelanggan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama atau telepon..."
            />
          </div>

          {searchQuery && matchingCustomers.length > 0 && (
            <div className="mt-4 space-y-2">
              {matchingCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full rounded-2xl bg-canvas px-4 py-3 text-left transition-colors hover:bg-primary/6"
                >
                  <div className="font-semibold text-ink">{customer.name}</div>
                  <div className="mt-1 text-sm text-muted">
                    {customer.phone && <span>{customer.phone}</span>}
                    {customer.loyaltyPoints > 0 && (
                      <span className="ml-2 text-primary">• {customer.loyaltyPoints} poin</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery && matchingCustomers.length === 0 && (
            <div className="mt-4 rounded-2xl bg-canvas px-4 py-3 text-sm text-muted">
              Pelanggan tidak ditemukan. Buat pelanggan baru.
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button onClick={() => setShowCreateForm(true)}>Buat Pelanggan Baru</Button>
            <Button variant="secondary" onClick={() => { setSelectedCustomer(null); setStep("order-input"); }}>
              Lewati (Pelanggan Umum)
            </Button>
          </div>
        </section>

        {showCreateForm && (
          <section className="rounded-[24px] bg-white p-6">
            <h2 className="font-display text-xl font-bold text-ink">Buat Pelanggan Baru</h2>
            <div className="mt-4 space-y-4">
              <Input label="Nama" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
              <Input label="Telepon" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} />
              <Input label="Alamat" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} />
              <div className="flex gap-3">
                <Button onClick={handleCreateCustomer}>Simpan</Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Batal</Button>
              </div>
            </div>
          </section>
        )}

        <Notice message={notice.message} />
        <Notice message={notice.error} tone="error" />
      </div>
    );
  }

  if (step === "order-input") {
    return (
      <>
        {customerForOrder && (
          <div className="mb-4 rounded-[24px] bg-primary/6 px-6 py-4">
            <div className="font-semibold text-ink">Pelanggan: {customerForOrder.name}</div>
            <div className="mt-1 text-sm text-muted">
              Saldo poin: {customerForOrder.loyaltyPoints} poin
            </div>
          </div>
        )}

        <div
          className={cn(
            "grid gap-4",
            sidebarCollapsed
              ? "xl:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]"
              : "xl:grid-cols-[minmax(0,2.45fr)_minmax(340px,1fr)]",
          )}
        >
          <section className="min-w-0 rounded-[24px] bg-white">
            <div className="border-b border-secondary/10 px-4 py-4 lg:px-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Input Pesanan</p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-ink">Pilih Produk</h1>
                </div>
                <div className="grid gap-3 xl:min-w-[520px] xl:grid-cols-[minmax(0,1fr)_180px]">
                  <Input
                    label="Cari produk"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari nama atau SKU..."
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-canvas px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-secondary">Produk</div>
                      <div className="mt-1 font-display text-xl font-bold text-ink">{matches.length}</div>
                    </div>
                    <div className="rounded-2xl bg-canvas px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-secondary">Keranjang</div>
                      <div className="mt-1 font-display text-xl font-bold text-ink">{cartCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId("all")}
                  className={cn(
                    "shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                    activeCategoryId === "all" ? "bg-primary text-white" : "bg-canvas text-secondary hover:bg-secondary/12",
                  )}
                >
                  Semua
                </button>
                {state.categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={cn(
                      "shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                      activeCategoryId === category.id ? "bg-primary text-white" : "bg-canvas text-secondary hover:bg-secondary/12",
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[calc(100vh-11.5rem)] overflow-y-auto px-4 py-4 lg:px-5 [content-visibility:auto]">
              {matches.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {matches.map((product) => {
                    const stock = getProductStock(state, product.id);
                    const category = state.categories.find((entry) => entry.id === product.categoryId);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="cursor-pointer rounded-[20px] bg-canvas px-3.5 py-3.5 text-left transition-colors duration-200 hover:bg-primary/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
                              {product.name}
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-secondary">
                            {stock}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="text-[11px] uppercase tracking-[0.12em] text-muted">
                            {category?.name ?? "Tanpa kategori"}
                          </div>
                          <div className="mt-2 font-display text-[1.9rem] font-bold leading-none text-primary">
                            {formatCurrency(product.retailPrice)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Produk tidak ditemukan"
                  description="Coba ubah kata kunci pencarian atau pilih kategori lain."
                />
              )}
            </div>
          </section>

          <aside className="min-h-0 xl:sticky xl:top-[4.75rem]">
            <section className="flex h-[calc(100vh-7.5rem)] min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-[24px] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-secondary/10 px-4 py-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Checkout</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-ink">Pesanan</h2>
                </div>
                <Button variant="ghost" onClick={() => setCart([])} disabled={!cart.length}>
                  Kosongkan
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {quoted.items.length ? (
                  <div className="divide-y divide-secondary/10">
                    {quoted.items.map((item) => (
                      <div key={item.product.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-ink">{item.product.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.12em] text-secondary">
                              {translatePriceMode(item.priceMode)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCart((current) => current.filter((line) => line.productId !== item.product.id))
                            }
                            className="rounded-xl px-2 py-1 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/10 hover:text-ink"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-ink">{formatCurrency(item.subtotal)}</div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-9 w-9 rounded-2xl bg-canvas text-secondary transition-colors hover:bg-secondary/12 hover:text-ink"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={cart.find((line) => line.productId === item.product.id)?.quantity ?? 1}
                              onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                              className="h-9 w-20 rounded-2xl bg-canvas px-3 text-center text-sm text-ink outline-none ring-1 ring-inset ring-secondary/12"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-9 w-9 rounded-2xl bg-canvas text-secondary transition-colors hover:bg-secondary/12 hover:text-ink"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Belum ada item"
                    description="Tambahkan produk dari panel kiri."
                  />
                )}
              </div>

              <div className="shrink-0 border-t border-secondary/10 bg-white px-4 py-4">
                <Notice message={notice.message} />
                <Notice message={notice.error} tone="error" />
                <div className="mt-3 rounded-[22px] bg-ink px-4 py-4 text-white">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Total</span>
                    <span className="tabular-nums">{cartCount} item</span>
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold">{formatCurrency(quoted.total)}</div>
                </div>
                <Button
                  className="mt-3 w-full py-3 text-base"
                  onClick={handleProcessOrder}
                  disabled={!quoted.items.length}
                >
                  Proses Pesanan
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </>
    );
  }

  if (step === "subtotal-loyalty") {
    const subtotal = quoted.total;
    const loyaltyBalance = customerForOrder?.loyaltyPoints ?? 0;
    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Subtotal & Poin Loyalitas</h1>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-canvas px-5 py-4">
              <div className="text-sm text-secondary">Subtotal Pesanan</div>
              <div className="mt-2 font-display text-3xl font-bold text-primary">{formatCurrency(subtotal)}</div>
            </div>

            <div className="rounded-2xl bg-canvas px-5 py-4">
              <div className="text-sm text-secondary">Saldo Poin Loyalitas</div>
              <div className="mt-2 font-display text-3xl font-bold text-ink">{loyaltyBalance} poin</div>
            </div>

            {loyaltyBalance > 0 && (
              <div className="rounded-2xl bg-primary/6 px-5 py-4">
                <div className="font-semibold text-ink">Gunakan poin loyalitas?</div>
                <div className="mt-1 text-sm text-muted">
                  Poin Anda akan mengurangi total pembayaran.
                </div>
                <div className="mt-3 flex gap-3">
                  <Button onClick={() => { setUseLoyaltyPoints(true); setStep("payment-with-points"); }}>
                    Ya, Gunakan Poin
                  </Button>
                  <Button variant="secondary" onClick={() => { setUseLoyaltyPoints(false); setStep("payment-without-points"); }}>
                    Tidak, Lanjutkan
                  </Button>
                </div>
              </div>
            )}

            {loyaltyBalance === 0 && (
              <div className="rounded-2xl bg-canvas px-5 py-4 text-sm text-muted">
                Pelanggan belum memiliki poin loyalitas.
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button variant="ghost" onClick={() => setStep("order-input")}>Kembali ke Pesanan</Button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "payment-with-points") {
    const subtotal = quoted.total;
    const loyaltyBalance = customerForOrder?.loyaltyPoints ?? 0;
    const deduction = loyaltyBalance >= subtotal
      ? { pointsUsed: subtotal, finalTotal: 0 }
      : { pointsUsed: loyaltyBalance, finalTotal: subtotal - loyaltyBalance };

    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Pembayaran dengan Poin</h1>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-canvas px-5 py-4">
              <div className="text-sm text-secondary">Subtotal</div>
              <div className="mt-1 font-display text-2xl font-bold text-ink">{formatCurrency(subtotal)}</div>
            </div>

            <div className="rounded-2xl bg-primary/6 px-5 py-4">
              <div className="text-sm text-primary">Poin Digunakan</div>
              <div className="mt-1 font-display text-2xl font-bold text-primary">-{deduction.pointsUsed} poin</div>
            </div>

            <div className="rounded-[22px] bg-ink px-5 py-4 text-white">
              <div className="text-sm text-white/70">Harga Setelah Potongan Poin</div>
              <div className="mt-2 font-display text-3xl font-bold">{formatCurrency(deduction.finalTotal)}</div>
            </div>

            <Select
              label="Metode Pembayaran"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="cash">Tunai</option>
              <option value="transfer">Transfer</option>
            </Select>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setStep("subtotal-loyalty")}>Kembali</Button>
            <Button onClick={handleConfirmPayment}>Konfirmasi Bayar</Button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "payment-without-points") {
    const subtotal = quoted.total;
    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Pembayaran</h1>

          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] bg-ink px-5 py-4 text-white">
              <div className="text-sm text-white/70">Total Pembayaran</div>
              <div className="mt-2 font-display text-3xl font-bold">{formatCurrency(subtotal)}</div>
            </div>

            <Select
              label="Metode Pembayaran"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="cash">Tunai</option>
              <option value="transfer">Transfer</option>
            </Select>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setStep("subtotal-loyalty")}>Kembali</Button>
            <Button onClick={handleConfirmPayment}>Konfirmasi Bayar</Button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "receipt") {
    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Transaksi Selesai</h1>

          {completedSale && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-canvas px-5 py-4">
                <div className="text-sm text-secondary">No. Struk</div>
                <div className="mt-1 font-display text-3xl font-bold text-ink">{completedSale.receiptNumber}</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-canvas px-5 py-4">
                  <div className="text-sm text-secondary">Total</div>
                  <div className="mt-1 font-display text-2xl font-bold text-primary">{formatCurrency(completedSale.total)}</div>
                </div>
                <div className="rounded-2xl bg-canvas px-5 py-4">
                  <div className="text-sm text-secondary">Item</div>
                  <div className="mt-1 font-display text-2xl font-bold text-ink">{completedSale.items.length}</div>
                </div>
              </div>

              {pointsUsed > 0 && (
                <div className="rounded-2xl bg-primary/6 px-5 py-4">
                  <div className="text-sm text-primary">Poin Digunakan</div>
                  <div className="mt-1 font-display text-xl font-bold text-primary">-{pointsUsed} poin</div>
                </div>
              )}

              <div className="rounded-2xl bg-secondary/10 px-5 py-4">
                <div className="text-sm text-secondary">Poin Didapatkan (1% dari total)</div>
                <div className="mt-1 font-display text-xl font-bold text-ink">+{earnedPoints} poin</div>
              </div>

              <div className="rounded-[24px] bg-white">
                <div className="border-b border-secondary/10 px-4 py-3 text-sm font-semibold text-ink">
                  Ringkasan Struk
                </div>
                <div className="max-h-[32vh] overflow-y-auto px-4 py-3">
                  <div className="divide-y divide-secondary/10">
                    {completedSale.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">{item.productName}</div>
                          <div className="mt-1 text-sm text-muted">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-ink">{formatCurrency(item.subtotal)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 py-3" onClick={handlePrintReceipt}>
                  Cetak Struk
                </Button>
                <Button className="flex-1 py-3" onClick={handleNewTransaction}>
                  Transaksi Baru
                </Button>
              </div>
            </div>
          )}
        </section>

        <Notice message={notice.message} />
        <Notice message={notice.error} tone="error" />
      </div>
    );
  }

  return null;
}
```

**Step 2: Verify type errors**

Run: `npx tsc --noEmit`
Expected: FAIL — ProductsPage not found (TransactionsPage should now pass)

---

## Task 9: Simplify Refund Page with Success/Failure States

**Files:**
- Modify: `src/features/refunds/page.tsx`

**Step 1: Add explicit success/failure state tracking**

In `src/features/refunds/page.tsx`, add a state variable after the existing `useState` calls:

```typescript
const [refundResult, setRefundResult] = useState<"success" | "failed" | null>(null);
const [refundError, setRefundError] = useState<string | null>(null);
```

**Step 2: Modify the refund submit handler**

Replace the `onClick` handler of the "Proses Refund" button with logic that sets `refundResult`:

Change the button's onClick from the inline function to:

```typescript
onClick={() => {
  notice.clear();
  setRefundResult(null);
  setRefundError(null);
  try {
    refundSale({
      saleId: selectedSale.id,
      reason,
      items: selectedSale.items.map((item) => ({
        saleItemId: item.id,
        quantity: quantities[item.id] ?? 0,
      })),
    });
    setQuantities({});
    setRefundResult("success");
  } catch (error) {
    setRefundResult("failed");
    setRefundError(error instanceof Error ? error.message : "Refund gagal.");
  }
}}
```

**Step 3: Add result banners after the button**

After the "Proses Refund" button and before the existing Notice components, add:

```typescript
{refundResult === "success" && (
  <div className="rounded-2xl bg-primary/8 px-4 py-3 text-sm text-primary font-semibold">
    Refund Berhasil — Pengembalian dana telah diproses.
  </div>
)}
{refundResult === "failed" && (
  <div className="rounded-2xl bg-ink/5 px-4 py-3 text-sm text-ink font-semibold">
    Refund Gagal — {refundError}
  </div>
)}
```

**Step 4: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: FAIL — ProductsPage not found

---

## Task 10: Create Product Page (Tabbed: Import, Categories, Stock)

**Files:**
- Create: `src/features/products/page.tsx`

**Step 1: Create the Products page**

Create `src/features/products/page.tsx` with this content:

```typescript
import { useRef, useState } from "react";
import { useAppContext } from "@/app/providers/app-provider";
import { getProductStock } from "@/domain/services/inventory-service";
import { Button, DataTable, EmptyState, Input, Notice, Select, TextArea } from "@/shared/components/ui";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { useNotice } from "@/shared/hooks/use-notice";

type Tab = "import" | "categories" | "stock";

export function ProductsPage() {
  const { state, createProduct, updateProduct, importProductsCsv, createCategory, updateCategory, adjustStock } = useAppContext();
  const notice = useNotice();
  const [activeTab, setActiveTab] = useState<Tab>("import");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import state
  const [importResult, setImportResult] = useState<"success" | "failed" | null>(null);
  const [importMessage, setImportMessage] = useState("");

  // Category state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDesc, setEditCategoryDesc] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [categoryResult, setCategoryResult] = useState<"success" | "failed" | null>(null);
  const [categoryMessage, setCategoryMessage] = useState("");

  // Stock state
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const tabs: { id: Tab; label: string }[] = [
    { id: "import", label: "Import Produk" },
    { id: "categories", label: "Kategori" },
    { id: "stock", label: "Stok" },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = importProductsCsv(text);

      if (result.successCount > 0) {
        setImportResult("success");
        setImportMessage(`${result.successCount} produk berhasil ditambahkan.`);
        notice.success(`${result.successCount} produk berhasil ditambahkan.`);
      }

      if (result.failedRows.length > 0) {
        setImportResult("failed");
        setImportMessage(`Ditemukan ${result.failedRows.length} baris gagal.`);
      }
    } catch (error) {
      setImportResult("failed");
      setImportMessage(error instanceof Error ? error.message : "Import gagal.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveCategory = () => {
    setCategoryResult(null);
    try {
      if (editingCategoryId) {
        updateCategory(editingCategoryId, { name: editCategoryName, description: editCategoryDesc });
        setCategoryResult("success");
        setCategoryMessage("Kategori berhasil diperbarui.");
        setEditingCategoryId(null);
      } else {
        createCategory({ name: newCategoryName, description: newCategoryDesc });
        setCategoryResult("success");
        setCategoryMessage("Kategori baru berhasil disimpan.");
        setShowAddCategory(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
      }
    } catch (error) {
      setCategoryResult("failed");
      setCategoryMessage(error instanceof Error ? error.message : "Gagal menyimpan kategori.");
    }
  };

  const handleStartEditCategory = (categoryId: string) => {
    const cat = state.categories.find((c) => c.id === categoryId);
    if (cat) {
      setEditingCategoryId(cat.id);
      setEditCategoryName(cat.name);
      setEditCategoryDesc(cat.description ?? "");
    }
  };

  const handleAdjustStock = (productId: string) => {
    try {
      const qty = parseInt(adjustQty, 10);
      if (isNaN(qty) || qty === 0) {
        throw new Error("Jumlah penyesuaian tidak valid.");
      }
      adjustStock({ productId, quantityDelta: qty, note: adjustNote || undefined });
      notice.success("Stok berhasil diperbarui.");
      setAdjustProductId(null);
      setAdjustQty("");
      setAdjustNote("");
    } catch (error) {
      notice.failure(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-2xl px-5 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-white text-secondary hover:bg-secondary/8",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "import" && (
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Import Produk</h1>
          <p className="mt-1 text-sm text-muted">Upload file CSV untuk menambahkan produk secara massal</p>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-secondary file:mr-4 file:rounded-2xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
            />
          </div>

          <div className="mt-2 text-xs text-muted">
            Format CSV harus memiliki header: id, name, category, harga
          </div>

          {importResult === "success" && (
            <div className="mt-4 rounded-2xl bg-primary/8 px-4 py-3 text-sm text-primary font-semibold">
              Produk berhasil ditambahkan — {importMessage}
            </div>
          )}
          {importResult === "failed" && (
            <div className="mt-4 rounded-2xl bg-ink/5 px-4 py-3 text-sm text-ink font-semibold">
              Masalah ditemukan, input gagal — {importMessage}
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink">Daftar Produk ({state.products.length})</h2>
            <div className="mt-4">
              <DataTable headers={["SKU", "Nama", "Kategori", "Harga Retail", "Stok"]}>
                {state.products.slice(0, 20).map((product) => {
                  const category = state.categories.find((c) => c.id === product.categoryId);
                  const stock = getProductStock(state, product.id);
                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{category?.name ?? "-"}</td>
                      <td className="px-4 py-3">{formatCurrency(product.retailPrice)}</td>
                      <td className="px-4 py-3">{stock}</td>
                    </tr>
                  );
                })}
              </DataTable>
            </div>
          </div>

          <Notice message={notice.message} />
          <Notice message={notice.error} tone="error" />
        </section>
      )}

      {activeTab === "categories" && (
        <section className="rounded-[24px] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Manajemen Kategori</h1>
              <p className="mt-1 text-sm text-muted">Tambah atau edit kategori produk</p>
            </div>
            <Button onClick={() => { setShowAddCategory(true); setEditingCategoryId(null); setCategoryResult(null); }}>
              Tambah Kategori
            </Button>
          </div>

          {(showAddCategory || editingCategoryId) && (
            <div className="mt-4 rounded-2xl bg-canvas p-5 space-y-4">
              <h2 className="font-semibold text-ink">
                {editingCategoryId ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h2>
              <Input
                label="Nama Kategori"
                value={editingCategoryId ? editCategoryName : newCategoryName}
                onChange={(e) => editingCategoryId ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
              />
              <TextArea
                label="Deskripsi"
                value={editingCategoryId ? editCategoryDesc : newCategoryDesc}
                onChange={(e) => editingCategoryId ? setEditCategoryDesc(e.target.value) : setNewCategoryDesc(e.target.value)}
              />
              <div className="flex gap-3">
                <Button onClick={handleSaveCategory}>Simpan</Button>
                <Button variant="ghost" onClick={() => { setShowAddCategory(false); setEditingCategoryId(null); setCategoryResult(null); }}>
                  Batal
                </Button>
              </div>
            </div>
          )}

          {categoryResult === "success" && (
            <div className="mt-4 rounded-2xl bg-primary/8 px-4 py-3 text-sm text-primary font-semibold">
              Berhasil disimpan ke database — {categoryMessage}
            </div>
          )}
          {categoryResult === "failed" && (
            <div className="mt-4 rounded-2xl bg-ink/5 px-4 py-3 text-sm text-ink font-semibold">
              Gagal — {categoryMessage}
            </div>
          )}

          <div className="mt-6">
            <DataTable headers={["Nama", "Deskripsi", "Jumlah Produk", ""]}>
              {state.categories.map((category) => {
                const productCount = state.products.filter((p) => p.categoryId === category.id).length;
                return (
                  <tr key={category.id}>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3">{category.description || "-"}</td>
                    <td className="px-4 py-3">{productCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" onClick={() => handleStartEditCategory(category.id)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </div>
        </section>
      )}

      {activeTab === "stock" && (
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">Manajemen Stok</h1>
          <p className="mt-1 text-sm text-muted">Lihat dan sesuaikan stok produk</p>

          <div className="mt-4">
            <DataTable headers={["SKU", "Nama", "Stok Saat Ini", "Threshold", ""]}>
              {state.products.map((product) => {
                const stock = getProductStock(state, product.id);
                const isLow = stock <= product.lowStockThreshold;
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded-full px-2 py-1 text-xs font-semibold",
                        isLow ? "bg-ink/5 text-ink" : "bg-primary/8 text-primary",
                      )}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">{product.lowStockThreshold}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" onClick={() => { setAdjustProductId(product.id); setAdjustQty(""); setAdjustNote(""); }}>
                        Sesuaikan
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </div>

          {adjustProductId && (
            <div className="mt-4 rounded-2xl bg-canvas p-5 space-y-4">
              <h2 className="font-semibold text-ink">
                Sesuaikan Stok: {state.products.find((p) => p.id === adjustProductId)?.name}
              </h2>
              <Input
                label="Jumlah (positif = tambah, negatif = kurangi)"
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
              />
              <Input
                label="Catatan (opsional)"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
              />
              <div className="flex gap-3">
                <Button onClick={() => handleAdjustStock(adjustProductId)}>Simpan Stok</Button>
                <Button variant="ghost" onClick={() => setAdjustProductId(null)}>Batal</Button>
              </div>
            </div>
          )}

          <Notice message={notice.message} />
          <Notice message={notice.error} tone="error" />
        </section>
      )}
    </div>
  );
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS

---

## Task 11: Enhance Monthly Report Page

**Files:**
- Modify: `src/features/reports/page.tsx`

**Step 1: Add loading state and improve flow**

In `src/features/reports/page.tsx`, add after the existing `useState` calls:

```typescript
const [isGenerating, setIsGenerating] = useState(false);
const [reportGenerated, setReportGenerated] = useState(false);
```

**Step 2: Modify the generate button to show loading**

Replace the "Simpan Snapshot Laporan" button with:

```typescript
<div className="self-end">
  <Button
    className="w-full"
    disabled={isGenerating}
    onClick={() => {
      setIsGenerating(true);
      setReportGenerated(false);
      setTimeout(() => {
        createMonthlyReport(periodStart, periodEnd);
        setIsGenerating(false);
        setReportGenerated(true);
      }, 1500);
    }}
  >
    {isGenerating ? "Membuat laporan..." : "Generate Laporan Bulanan"}
  </Button>
</div>
```

**Step 3: Add generated report display**

After the stat cards section and before the saved reports table, add:

```typescript
{reportGenerated && (
  <section className="rounded-[24px] bg-primary/6 p-6">
    <h2 className="font-display text-xl font-bold text-ink">Laporan Berhasil Dibuat</h2>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-white px-5 py-4">
        <div className="text-sm text-secondary">Periode</div>
        <div className="mt-1 font-semibold text-ink">{periodStart} s/d {periodEnd}</div>
      </div>
      <div className="rounded-2xl bg-white px-5 py-4">
        <div className="text-sm text-secondary">Total Penjualan</div>
        <div className="mt-1 font-display text-xl font-bold text-primary">{formatCurrency(summary.metrics.salesTotal)}</div>
      </div>
    </div>
    <div className="mt-4">
      <Button onClick={() => setReportGenerated(false)}>Simpan Laporan</Button>
    </div>
  </section>
)}
```

**Step 4: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: PASS

---

## Task 12: Final Verification and Dev Server Test

**Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 2: Start dev server**

Run: `npm run dev`
Expected: Vite starts on port 5173 with no errors

**Step 3: Manual test checklist**

1. Navigate to http://localhost:5173 — should redirect to /login
2. Select "Karyawan" role, enter optional name, click "Masuk" — should redirect to dashboard
3. Sidebar should show only 4 menus: Transaksi, Refund, Produk, Laporan
4. Click Transaksi — should show customer lookup page
5. Search for existing customer, select them — should go to order input
6. Add products to cart, click "Proses Pesanan" — should show subtotal + loyalty
7. If customer has points, try "Ya, Gunakan Poin" — should show price after deduction
8. Confirm payment — should show receipt with points earned (+1%)
9. Click "Transaksi Baru" — should return to customer lookup
10. Click Refund — should show search + form with success/failure banners
11. Click Produk — should show 3 tabs: Import, Kategori, Stok
12. Click Laporan — should show date range picker with loading state

---

## Summary of File Changes

| Action | File Path |
|--------|-----------|
| Modify | `src/domain/models/index.ts` |
| Modify | `src/storage/local/keys.ts` |
| Create | `src/app/providers/auth-provider.tsx` |
| Modify | `src/app/App.tsx` |
| Create | `src/app/guards/auth-guard.tsx` |
| Create | `src/features/auth/login-page.tsx` |
| Modify | `src/app/router/index.tsx` |
| Modify | `src/app/layouts/app-shell.tsx` |
| Modify | `src/domain/services/sales-service.ts` |
| Modify | `src/app/providers/app-provider.tsx` |
| Create | `src/features/transactions/page.tsx` |
| Modify | `src/features/refunds/page.tsx` |
| Create | `src/features/products/page.tsx` |
| Modify | `src/features/reports/page.tsx` |

**Total: 4 new files, 10 modified files**
