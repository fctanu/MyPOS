import { useAuth } from "@/app/providers/auth-provider";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppContext } from "@/app/providers/app-provider";
import type { ShellOutletContext } from "@/app/layouts/app-shell";
import type { PaymentMethod, Sale } from "@/domain/models";
import { getProductStock } from "@/domain/services/inventory-service";
import { quoteCart } from "@/domain/services/sales-service";
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

type CartLine = { productId: string; quantity: number };
type DeliveryPreset = {
  id: string;
  label: string;
  address: string;
  phone: string;
};

const DELIVERY_PRESETS: DeliveryPreset[] = [
  {
    id: "delivery-kios-kencana",
    label: "Kios Kencana - Kebon Jeruk",
    address: "Jl. Kebon Jeruk Raya No. 18, Jakarta Barat",
    phone: "0812-0000-1001",
  },
  {
    id: "delivery-toko-mawar",
    label: "Toko Mawar - Grogol",
    address: "Jl. Dr. Susilo II No. 25, Grogol, Jakarta Barat",
    phone: "0812-0000-1002",
  },
  {
    id: "delivery-warung-sejahtera",
    label: "Warung Sejahtera - Palmerah",
    address: "Jl. Palmerah Utara No. 9, Jakarta Barat",
    phone: "0812-0000-1003",
  },
  {
    id: "delivery-kedai-mitra",
    label: "Kedai Mitra - Cengkareng",
    address: "Jl. Daan Mogot KM 13 No. 7, Cengkareng, Jakarta Barat",
    phone: "0812-0000-1004",
  },
];

export function SalesPage() {
  const { session } = useAuth();
  const { sidebarCollapsed = false } = useOutletContext<ShellOutletContext>();
  const { state, checkoutSale, createDeliveryOrder } = useAppContext();
  const notice = useNotice();
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<"all" | string>(
    "all",
  );
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [checkoutCustomerId, setCheckoutCustomerId] = useState("");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] =
    useState<PaymentMethod>("cash");
  const [selectedDeliveryPresetId, setSelectedDeliveryPresetId] = useState("");

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
  const categoryCounts = useMemo(
    () =>
      state.categories.map((category) => ({
        ...category,
        count: state.products.filter(
          (product) => product.active && product.categoryId === category.id,
        ).length,
      })),
    [state.categories, state.products],
  );
  const eligibleForDelivery = quoted.total >= state.settings.deliveryThreshold;
  const selectedDeliveryPreset = useMemo(
    () =>
      DELIVERY_PRESETS.find((preset) => preset.id === selectedDeliveryPresetId),
    [selectedDeliveryPresetId],
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

  const openCheckoutModal = () => {
    if (!quoted.items.length) {
      notice.failure(new Error("Tambahkan minimal satu produk ke keranjang."));
      return;
    }

    notice.clear();
    setCompletedSale(null);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setCompletedSale(null);
    setIsCheckoutModalOpen(false);
  };

  const finishCheckout = () => {
    setCompletedSale(null);
    setIsCheckoutModalOpen(false);
  };

  const handlePrintReceipt = () => {
    if (!completedSale) {
      return;
    }

    const customer = completedSale.customerId
      ? state.customers.find((c) => c.id === completedSale.customerId)
      : undefined;

    try {
      printSaleReceipt({
        storeName: state.settings.storeName,
        footer: state.settings.receiptFooter,
        sale: completedSale,
        employeeName:
          session?.name ||
          (state.settings.activeRole === "owner" ? "Pemilik" : "Karyawan"),
        customerName: completedSale.customerName,
        currentPointBalance: customer ? customer.loyaltyPoints : undefined,
      });
    } catch (error) {
      notice.failure(error);
    }
  };

  const handleCheckoutConfirm = () => {
    notice.clear();

    try {
      let deliveryPreset: DeliveryPreset | undefined;

      if (eligibleForDelivery) {
        deliveryPreset = selectedDeliveryPreset;

        if (!deliveryPreset) {
          throw new Error(
            "Pilih tujuan pengiriman untuk transaksi gratis ongkir.",
          );
        }
      }

      const sale = checkoutSale({
        cart,
        paymentMethod: checkoutPaymentMethod,
        customerId: checkoutCustomerId || undefined,
      });

      if (deliveryPreset) {
        createDeliveryOrder({
          saleId: sale.id,
          customerName: sale.customerName ?? "Pelanggan umum",
          phone: deliveryPreset.phone,
          address: deliveryPreset.address,
        });
      }

      setCart([]);
      setCheckoutCustomerId("");
      setCheckoutPaymentMethod("cash");
      setSelectedDeliveryPresetId("");
      setCompletedSale(sale);
      notice.success(`Transaksi ${sale.receiptNumber} berhasil diselesaikan.`);
    } catch (error) {
      notice.failure(error);
    }
  };

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
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
                  Kasir Cepat
                </p>
                <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                  Pilih Produk
                </h1>
              </div>

              <div className="grid gap-3 xl:min-w-[520px] xl:grid-cols-[minmax(0,1fr)_180px]">
                <Input
                  label="Cari produk"
                  name="productSearch"
                  autoComplete="off"
                  placeholder="Cari nama atau SKU..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-canvas px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-secondary">
                      Produk
                    </div>
                    <div className="mt-1 font-display text-xl font-bold text-ink">
                      {matches.length}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-canvas px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-secondary">
                      Keranjang
                    </div>
                    <div className="mt-1 font-display text-xl font-bold text-ink">
                      {cartCount}
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
                  "shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                  activeCategoryId === "all"
                    ? "bg-primary text-white"
                    : "bg-canvas text-secondary hover:bg-secondary/12 hover:text-ink",
                )}
              >
                Semua
              </button>
              {categoryCounts.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={cn(
                    "shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                    activeCategoryId === category.id
                      ? "bg-primary text-white"
                      : "bg-canvas text-secondary hover:bg-secondary/12 hover:text-ink",
                  )}
                >
                  {category.name}
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs",
                      activeCategoryId === category.id
                        ? "bg-white/18 text-white"
                        : "bg-white text-secondary",
                    )}
                  >
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-[calc(100vh-11.5rem)] overflow-y-auto px-4 py-4 lg:px-5 [content-visibility:auto]">
            {matches.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                          aria-label={`Hapus ${item.product.name} dari keranjang`}
                          onClick={() =>
                            setCart((current) =>
                              current.filter(
                                (line) => line.productId !== item.product.id,
                              ),
                            )
                          }
                          className="rounded-xl px-2 py-1 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
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
                            aria-label={`Kurangi jumlah ${item.product.name}`}
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="h-9 w-9 rounded-2xl bg-canvas text-secondary transition-colors hover:bg-secondary/12 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                          >
                            -
                          </button>
                          <input
                            name={`qty-${item.product.id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={
                              cart.find(
                                (line) => line.productId === item.product.id,
                              )?.quantity ?? 1
                            }
                            onChange={(event) =>
                              updateQuantity(
                                item.product.id,
                                Number(event.target.value),
                              )
                            }
                            className="h-9 w-20 rounded-2xl bg-canvas px-3 text-center text-sm text-ink outline-none ring-1 ring-inset ring-secondary/12 focus-visible:ring-2 focus-visible:ring-primary/18"
                          />
                          <button
                            type="button"
                            aria-label={`Tambah jumlah ${item.product.name}`}
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="h-9 w-9 rounded-2xl bg-canvas text-secondary transition-colors hover:bg-secondary/12 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
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
                  description="Tambahkan produk dari panel kiri. Total dan tombol bayar akan tetap ada di bawah."
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
                onClick={openCheckoutModal}
                disabled={!quoted.items.length}
              >
                Bayar Sekarang
              </Button>
            </div>
          </section>
        </aside>
      </div>

      {isCheckoutModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/35 px-4 py-6">
          <div
            className="absolute inset-0"
            onClick={closeCheckoutModal}
            aria-hidden="true"
          />
          <section className="relative z-10 flex max-h-[min(90vh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-panel">
            <div className="flex items-start justify-between gap-3 border-b border-secondary/10 px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
                  {completedSale
                    ? "Pembayaran Berhasil"
                    : "Konfirmasi Checkout"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                  {completedSale
                    ? "Struk Siap Dicetak"
                    : "Finalisasi Pembayaran"}
                </h2>
              </div>
              <button
                type="button"
                onClick={completedSale ? finishCheckout : closeCheckoutModal}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                Tutup
              </button>
            </div>

            {completedSale ? (
              <div className="flex min-h-0 flex-1 flex-col justify-between px-5 py-5">
                <div>
                  <div className="rounded-[24px] bg-canvas px-5 py-5">
                    <div className="text-sm text-secondary">No. Struk</div>
                    <div className="mt-1 font-display text-3xl font-bold text-ink">
                      {completedSale.receiptNumber}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.12em] text-secondary">
                          Total
                        </div>
                        <div className="mt-2 font-display text-2xl font-bold text-primary">
                          {formatCurrency(completedSale.total)}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.12em] text-secondary">
                          Item
                        </div>
                        <div className="mt-2 font-display text-2xl font-bold text-ink">
                          {completedSale.items.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-white">
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
                                {item.quantity} x{" "}
                                {formatCurrency(item.unitPrice)}
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
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="secondary"
                    className="py-3 text-base"
                    onClick={handlePrintReceipt}
                  >
                    Cetak Struk
                  </Button>
                  <Button className="py-3 text-base" onClick={finishCheckout}>
                    Selesai
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="min-h-0 border-b border-secondary/10 px-5 py-4 lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-ink">Ringkasan Item</h3>
                    <span className="text-sm text-secondary">
                      {cartCount} item
                    </span>
                  </div>
                  <div className="mt-4 max-h-[40vh] space-y-3 overflow-y-auto pr-1">
                    {quoted.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-start justify-between gap-3 rounded-2xl bg-canvas px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">
                            {item.product.name}
                          </div>
                          <div className="mt-1 text-sm text-muted">
                            {item.quantity} x {formatCurrency(item.unitPrice)} -{" "}
                            {translatePriceMode(item.priceMode)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-ink">
                          {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-secondary/10 pt-4">
                    <div className="flex items-center justify-between text-sm text-secondary">
                      <span>Total transaksi</span>
                      <span className="font-display text-2xl font-bold text-ink">
                        {formatCurrency(quoted.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 px-5 py-4">
                  <div className="space-y-4">
                    <Select
                      label="Pelanggan"
                      value={checkoutCustomerId}
                      onChange={(event) =>
                        setCheckoutCustomerId(event.target.value)
                      }
                    >
                      <option value="">Pelanggan umum</option>
                      {state.customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Metode Pembayaran"
                      value={checkoutPaymentMethod}
                      onChange={(event) =>
                        setCheckoutPaymentMethod(
                          event.target.value as PaymentMethod,
                        )
                      }
                    >
                      <option value="cash">Tunai</option>
                      <option value="transfer">Transfer</option>
                    </Select>

                    <div className="rounded-2xl bg-canvas px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-secondary">
                        Gratis Ongkir
                      </div>
                      {eligibleForDelivery ? (
                        <>
                          <div className="mt-2 font-semibold text-primary">
                            Ya, transaksi ini memenuhi ambang{" "}
                            {formatCurrency(state.settings.deliveryThreshold)}.
                          </div>
                          <div className="mt-3 space-y-3">
                            <Select
                              label="Tujuan pengiriman"
                              value={selectedDeliveryPresetId}
                              onChange={(event) =>
                                setSelectedDeliveryPresetId(event.target.value)
                              }
                            >
                              <option value="">
                                Pilih tujuan dari data dummy
                              </option>
                              {DELIVERY_PRESETS.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                  {preset.label}
                                </option>
                              ))}
                            </Select>

                            {selectedDeliveryPreset ? (
                              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink">
                                <div className="font-medium">
                                  {selectedDeliveryPreset.label}
                                </div>
                                <div className="mt-2 text-muted">
                                  {selectedDeliveryPreset.address}
                                </div>
                                <div className="mt-1 text-muted">
                                  {selectedDeliveryPreset.phone}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-muted">
                                Pilih tujuan pengiriman agar alamat dan telepon
                                terisi otomatis.
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="mt-2 text-sm text-muted">
                          Belum memenuhi ambang gratis ongkir{" "}
                          {formatCurrency(state.settings.deliveryThreshold)}.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={closeCheckoutModal}
                    >
                      Batal
                    </Button>
                    <Button className="flex-1" onClick={handleCheckoutConfirm}>
                      Konfirmasi Bayar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
