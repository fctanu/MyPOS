import { useAuth } from "@/app/providers/auth-provider";
import { useMemo, useState, type ReactNode } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppContext } from "@/app/providers/app-provider";
import type { ShellOutletContext } from "@/app/layouts/app-shell";
import type { Customer, PaymentMethod, Sale } from "@/domain/models";
import { getProductStock } from "@/domain/services/inventory-service";
import {
  calculateLoyaltyEarn,
  quoteCart,
} from "@/domain/services/sales-service";
import {
  Button,
  EmptyState,
  Input,
  Notice,
  Select,
} from "@/shared/components/ui";
import { formatCurrency } from "@/shared/lib/format";
import { translatePriceMode } from "@/shared/lib/labels";
import { cn } from "@/shared/lib/cn";
import { useNotice } from "@/shared/hooks/use-notice";
import { printSaleReceipt } from "@/shared/lib/receipt";
import { trackGrowthEvent } from "@/shared/lib/growth-metrics";
import {
  buildReceiptShareMessage,
  buildReceiptWhatsappUrl,
} from "@/shared/lib/receipt-share";

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

type CartLine = { productId: string; quantity: number };
type FlowStep =
  | "customer-lookup"
  | "order-input"
  | "subtotal-loyalty"
  | "payment-with-points"
  | "payment-without-points"
  | "receipt";

export function TransactionsPage() {
  const { session } = useAuth();
  const { sidebarCollapsed = false } = useOutletContext<ShellOutletContext>();
  const {
    state,
    checkoutSale,
    createCustomer,
    checkoutSaleWithLoyalty,
    checkoutSaleWithEarnedPoints,
  } = useAppContext();
  const notice = useNotice();

  const [step, setStep] = useState<FlowStep>("customer-lookup");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
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
  const [isPrinting, setIsPrinting] = useState(false);

  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<"all" | string>(
    "all",
  );

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
          (activeCategoryId === "all" ||
            product.categoryId === activeCategoryId) &&
          [product.name, product.sku].some((value) =>
            value.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [activeCategoryId, query, state.products],
  );

  const quoted = useMemo(() => quoteCart(state, cart), [cart, state]);
  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) =>
        current.filter((item) => item.productId !== productId),
      );
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
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
      if (useLoyaltyPoints && selectedCustomer) {
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
      } else if (selectedCustomer) {
        const result = checkoutSaleWithEarnedPoints({
          cart,
          paymentMethod,
          customerId: selectedCustomer.id,
        });
        setCompletedSale(result.sale);
        setPointsUsed(0);
        setEarnedPoints(result.earnedPoints);
        setFinalTotal(result.sale.total);
      } else {
        const sale = checkoutSale({
          cart,
          paymentMethod,
        });
        const earned = calculateLoyaltyEarn(sale.total);
        setCompletedSale(sale);
        setPointsUsed(0);
        setEarnedPoints(earned);
        setFinalTotal(sale.total);
      }

      setCart([]);
      setStep("receipt");
      trackGrowthEvent("sale_completed");
      notice.success("Transaksi berhasil diselesaikan.");

      setTimeout(() => {
        handlePrintReceipt();
      }, 500);
    } catch (error) {
      notice.failure(error);
    }
  };

  const handlePrintReceipt = () => {
    if (!completedSale) return;

    // get customer for points
    const customer = completedSale.customerId
      ? state.customers.find((c) => c.id === completedSale.customerId)
      : undefined;

    try {
      setIsPrinting(true);
      printSaleReceipt({
        storeName: state.settings.storeName,
        footer: state.settings.receiptFooter,
        sale: completedSale,
        pointsUsed: pointsUsed > 0 ? pointsUsed : undefined,
        earnedPoints: earnedPoints > 0 ? earnedPoints : undefined,
        employeeName:
          session?.name ||
          (state.settings.activeRole === "owner" ? "Pemilik" : "Karyawan"),
        customerName: completedSale.customerName,
        currentPointBalance: customer
          ? customer.loyaltyPoints - pointsUsed + earnedPoints
          : undefined,
      });

      setTimeout(() => {
        setIsPrinting(false);
        handleNewTransaction();
      }, 2000);
    } catch (error) {
      setIsPrinting(false);
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
    ? (state.customers.find((c) => c.id === selectedCustomer.id) ??
      selectedCustomer)
    : null;

  const handleShareReceiptToWhatsapp = () => {
    if (!completedSale) {
      return;
    }

    const shareUrl = buildReceiptWhatsappUrl({
      storeName: state.settings.storeName,
      sale: completedSale,
      customerName: customerForOrder?.name,
      customerPhone: customerForOrder?.phone,
      earnedPoints,
      footer: state.settings.receiptFooter,
    });

    const shareWindow = window.open(shareUrl, "_blank", "noopener,noreferrer");
    if (!shareWindow) {
      notice.failure(
        new Error(
          "Popup WhatsApp diblokir browser. Izinkan pop-up lalu coba lagi.",
        ),
      );
      return;
    }

    trackGrowthEvent("receipt_share_clicked");
    notice.success(
      customerForOrder?.phone
        ? "WhatsApp dibuka untuk membagikan struk langsung ke pelanggan."
        : "WhatsApp dibuka. Pilih kontak tujuan untuk membagikan struk digital.",
    );
  };

  const handleCopyReceiptShare = async () => {
    if (!completedSale) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      notice.failure(new Error("Clipboard tidak tersedia di browser ini."));
      return;
    }

    try {
      await navigator.clipboard.writeText(
        buildReceiptShareMessage({
          storeName: state.settings.storeName,
          sale: completedSale,
          customerName: customerForOrder?.name,
          earnedPoints,
          footer: state.settings.receiptFooter,
        }),
      );
      trackGrowthEvent("receipt_share_clicked");
      notice.success(
        "Teks struk berhasil disalin. Tempel ke WhatsApp atau status toko.",
      );
    } catch (error) {
      notice.failure(error);
    }
  };

  if (step === "customer-lookup") {
    return (
      <div className="max-w-2xl space-y-6">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Data Pelanggan
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cari pelanggan berdasarkan nama atau nomor telepon
          </p>

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
                      <span className="ml-2 text-primary">
                        • {customer.loyaltyPoints} poin
                      </span>
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
            <Button onClick={() => setShowCreateForm(true)}>
              Buat Pelanggan Baru
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedCustomer(null);
                setStep("order-input");
              }}
            >
              Lewati (Pelanggan Umum)
            </Button>
          </div>
        </section>

        {showCreateForm && (
          <section className="rounded-[24px] bg-white p-6">
            <h2 className="font-display text-xl font-bold text-ink">
              Buat Pelanggan Baru
            </h2>
            <div className="mt-4 space-y-4">
              <Input
                label="Nama"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <Input
                label="Telepon"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
              <Input
                label="Alamat"
                value={newCustomerAddress}
                onChange={(e) => setNewCustomerAddress(e.target.value)}
              />
              <div className="flex gap-3">
                <Button onClick={handleCreateCustomer}>Simpan</Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Batal
                </Button>
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
              <div className="rounded-[28px] border border-secondary/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.035),rgba(37,99,235,0.07),rgba(255,255,255,0.9))] p-4 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.28)] lg:p-5">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_320px] xl:items-stretch">
                  <div className="rounded-[24px] bg-white/92 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)] backdrop-blur lg:p-5">
                    <label className="block text-sm font-semibold uppercase tracking-[0.26em] text-secondary">
                      Cari produk
                    </label>
                    <div className="relative mt-3">
                      <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-primary/65" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari nama produk, SKU, atau kata kunci..."
                        className="h-16 rounded-[22px] border-0 bg-canvas pl-14 pr-5 text-base shadow-[inset_0_0_0_1px_rgba(37,99,235,0.22)] placeholder:text-muted/90 focus-visible:ring-[3px] focus-visible:ring-primary/15"
                      />
                    </div>
                    {customerForOrder ? (
                      <div className="mt-3 text-sm text-secondary">
                        {`Pelanggan: ${customerForOrder.name} • ${customerForOrder.loyaltyPoints} poin`}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[26px] bg-white px-5 py-4 shadow-[0_18px_40px_-30px_rgba(37,99,235,0.75)] ring-1 ring-inset ring-primary/10">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-secondary">
                        Produk
                      </div>
                      <div className="mt-5">
                        <div className="font-display text-[2.4rem] font-bold leading-none text-ink">
                          {matches.length}
                        </div>
                        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/75">
                          Ready
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] bg-ink px-5 py-4 text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.85)]">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/68">
                        Keranjang
                      </div>
                      <div className="mt-5">
                        <div className="font-display text-[2.4rem] font-bold leading-none text-white">
                          {cartCount}
                        </div>
                        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/68">
                          Aktif
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryId("all")}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                      activeCategoryId === "all"
                        ? "bg-ink text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.9)]"
                        : "bg-white/88 text-secondary ring-1 ring-inset ring-secondary/12 hover:bg-white hover:text-ink",
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
                        "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                        activeCategoryId === category.id
                          ? "bg-primary text-white shadow-[0_12px_30px_-18px_rgba(37,99,235,0.92)]"
                          : "bg-white/88 text-secondary ring-1 ring-inset ring-secondary/12 hover:bg-white hover:text-ink",
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-11.5rem)] overflow-y-auto px-4 py-4 lg:px-5 [content-visibility:auto]">
              {matches.length ? (
                <div
                  className={cn(
                    "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
                    sidebarCollapsed ? "xl:grid-cols-5" : "xl:grid-cols-4",
                  )}
                >
                  {matches.map((product) => {
                    const stock = getProductStock(state, product.id);
                    const category = state.categories.find(
                      (entry) => entry.id === product.categoryId,
                    );
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
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
                    Checkout
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                    Pesanan
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCart([])}
                  disabled={!cart.length}
                >
                  Kosongkan
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {quoted.items.length ? (
                  <div className="divide-y divide-secondary/10">
                    {quoted.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-ink">
                              {item.product.name}
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.12em] text-secondary">
                              {translatePriceMode(item.priceMode)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCart((current) =>
                                current.filter(
                                  (line) => line.productId !== item.product.id,
                                ),
                              )
                            }
                            className="rounded-xl px-2 py-1 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/10 hover:text-ink"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-ink">
                            {formatCurrency(item.subtotal)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              className="h-9 w-9 rounded-2xl bg-canvas text-secondary transition-colors hover:bg-secondary/12 hover:text-ink"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={
                                cart.find(
                                  (line) => line.productId === item.product.id,
                                )?.quantity ?? 1
                              }
                              onChange={(e) =>
                                updateQuantity(
                                  item.product.id,
                                  Number(e.target.value),
                                )
                              }
                              className="h-9 w-20 rounded-2xl bg-canvas px-3 text-center text-sm text-ink outline-none ring-1 ring-inset ring-secondary/12"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
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
                  <div className="mt-2 font-display text-3xl font-bold">
                    {formatCurrency(quoted.total)}
                  </div>
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
    const earnedPoints = calculateLoyaltyEarn(subtotal);
    const deduction =
      loyaltyBalance >= subtotal
        ? { pointsUsed: subtotal, finalTotal: 0 }
        : { pointsUsed: loyaltyBalance, finalTotal: subtotal - loyaltyBalance };

    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStep("order-input")}>
              <BackIcon className="mr-1" /> Kembali
            </Button>
            <h1 className="font-display text-2xl font-bold text-ink">
              Pembayaran
            </h1>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-canvas px-5 py-4">
              <div className="text-sm text-secondary">Subtotal Pesanan</div>
              <div className="mt-2 font-display text-3xl font-bold text-primary">
                {formatCurrency(subtotal)}
              </div>
            </div>

            {loyaltyBalance > 0 && (
              <>
                <div className="rounded-2xl bg-canvas px-5 py-4">
                  <div className="text-sm text-secondary">
                    Saldo Poin Loyalitas
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-ink">
                    {loyaltyBalance} poin
                  </div>
                </div>

                <div className="rounded-2xl bg-primary/6 px-5 py-4">
                  <div className="font-semibold text-ink">
                    Gunakan poin loyalitas?
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    Poin Anda akan mengurangi total pembayaran.
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Button
                      onClick={() => setUseLoyaltyPoints(true)}
                      className={useLoyaltyPoints ? "ring-2 ring-white/40" : ""}
                    >
                      Ya, Gunakan Poin
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setUseLoyaltyPoints(false)}
                      className={
                        !useLoyaltyPoints ? "ring-2 ring-primary/20" : ""
                      }
                    >
                      Tidak
                    </Button>
                  </div>
                </div>

                {useLoyaltyPoints && (
                  <div className="rounded-[22px] bg-ink px-5 py-4 text-white">
                    <div className="text-sm text-white/70">
                      Harga Setelah Potongan Poin
                    </div>
                    <div className="mt-2 font-display text-3xl font-bold">
                      {formatCurrency(deduction.finalTotal)}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      Poin digunakan: {deduction.pointsUsed}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-secondary/10 px-5 py-4">
                  <div className="text-sm text-secondary">
                    Poin Didapatkan dari Transaksi Ini (1%)
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-ink">
                    +{earnedPoints} poin
                  </div>
                </div>
              </>
            )}

            {loyaltyBalance === 0 && (
              <div className="rounded-2xl bg-secondary/10 px-5 py-4">
                <div className="text-sm text-secondary">
                  Poin Loyalitas Didapatkan dari Transaksi Ini (1%)
                </div>
                <div className="mt-2 font-display text-3xl font-bold text-ink">
                  +{earnedPoints} poin
                </div>
              </div>
            )}

            <Select
              label="Metode Pembayaran"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              <option value="cash">Tunai</option>
              <option value="transfer">Transfer</option>
            </Select>
          </div>

          <div className="mt-6">
            <Button
              className="w-full py-3 text-base"
              onClick={handleConfirmPayment}
            >
              Print Struk
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "payment-with-points") {
    const subtotal = quoted.total;
    const loyaltyBalance = customerForOrder?.loyaltyPoints ?? 0;
    const deduction =
      loyaltyBalance >= subtotal
        ? { pointsUsed: subtotal, finalTotal: 0 }
        : { pointsUsed: loyaltyBalance, finalTotal: subtotal - loyaltyBalance };

    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStep("subtotal-loyalty")}>
              <BackIcon className="mr-1" /> Kembali
            </Button>
            <h1 className="font-display text-2xl font-bold text-ink">
              Pembayaran dengan Poin
            </h1>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-canvas px-5 py-4">
              <div className="text-sm text-secondary">Subtotal</div>
              <div className="mt-1 font-display text-2xl font-bold text-ink">
                {formatCurrency(subtotal)}
              </div>
            </div>

            <div className="rounded-2xl bg-primary/6 px-5 py-4">
              <div className="text-sm text-primary">Poin Digunakan</div>
              <div className="mt-1 font-display text-2xl font-bold text-primary">
                -{deduction.pointsUsed} poin
              </div>
            </div>

            <div className="rounded-[22px] bg-ink px-5 py-4 text-white">
              <div className="text-sm text-white/70">
                Harga Setelah Potongan Poin
              </div>
              <div className="mt-2 font-display text-3xl font-bold">
                {formatCurrency(deduction.finalTotal)}
              </div>
            </div>

            <Select
              label="Metode Pembayaran"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              <option value="cash">Tunai</option>
              <option value="transfer">Transfer</option>
            </Select>
          </div>

          <div className="mt-6">
            <Button onClick={handleConfirmPayment}>Print Struk</Button>
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStep("subtotal-loyalty")}>
              <BackIcon className="mr-1" /> Kembali
            </Button>
            <h1 className="font-display text-2xl font-bold text-ink">
              Pembayaran
            </h1>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] bg-ink px-5 py-4 text-white">
              <div className="text-sm text-white/70">Total Pembayaran</div>
              <div className="mt-2 font-display text-3xl font-bold">
                {formatCurrency(subtotal)}
              </div>
            </div>

            <Select
              label="Metode Pembayaran"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              <option value="cash">Tunai</option>
              <option value="transfer">Transfer</option>
            </Select>
          </div>

          <div className="mt-6">
            <Button onClick={handleConfirmPayment}>Print Struk</Button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "receipt") {
    return (
      <div className="max-w-2xl">
        <section className="rounded-[24px] bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Transaksi Selesai
          </h1>

          {completedSale && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-canvas px-5 py-4">
                <div className="text-sm text-secondary">No. Struk</div>
                <div className="mt-1 font-display text-3xl font-bold text-ink">
                  {completedSale.receiptNumber}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-canvas px-5 py-4">
                  <div className="text-sm text-secondary">Total</div>
                  <div className="mt-1 font-display text-2xl font-bold text-primary">
                    {formatCurrency(completedSale.total)}
                  </div>
                </div>
                <div className="rounded-2xl bg-canvas px-5 py-4">
                  <div className="text-sm text-secondary">Item</div>
                  <div className="mt-1 font-display text-2xl font-bold text-ink">
                    {completedSale.items.length}
                  </div>
                </div>
              </div>

              {pointsUsed > 0 && (
                <div className="rounded-2xl bg-primary/6 px-5 py-4">
                  <div className="text-sm text-primary">Poin Digunakan</div>
                  <div className="mt-1 font-display text-xl font-bold text-primary">
                    -{pointsUsed} poin
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-secondary/10 px-5 py-4">
                <div className="text-sm text-secondary">
                  Poin Didapatkan (1% dari total)
                </div>
                <div className="mt-1 font-display text-xl font-bold text-ink">
                  +{earnedPoints} poin
                </div>
              </div>

              <div className="rounded-[24px] bg-white">
                <div className="border-b border-secondary/10 px-4 py-3 text-sm font-semibold text-ink">
                  Ringkasan Struk
                </div>
                <div className="max-h-[32vh] overflow-y-auto px-4 py-3">
                  <div className="divide-y divide-secondary/10">
                    {completedSale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">
                            {item.productName}
                          </div>
                          <div className="mt-1 text-sm text-muted">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-ink">
                          {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Button
                  className="w-full py-3"
                  onClick={handlePrintReceipt}
                  disabled={isPrinting}
                >
                  {isPrinting ? "Printing Struk..." : "Cetak Struk"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  className="py-3"
                  onClick={handleShareReceiptToWhatsapp}
                >
                  Bagikan ke WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  className="py-3"
                  onClick={() => void handleCopyReceiptShare()}
                >
                  Salin Teks Struk
                </Button>
              </div>

              <div className="rounded-2xl bg-canvas px-4 py-3 text-sm text-muted">
                {customerForOrder?.phone
                  ? `Struk digital akan diarahkan ke nomor ${customerForOrder.phone} dan tetap bisa diteruskan pelanggan.`
                  : "Pilih pelanggan dengan nomor WhatsApp untuk kirim langsung, atau pakai salin teks untuk bagikan manual."}
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
