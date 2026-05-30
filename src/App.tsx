import { motion, AnimatePresence } from "motion/react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  Fragment,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import * as XLSX from "xlsx";
import { callOpenRouterStream } from "./shared/openrouter";
import { salesSeedData } from "./shared/salesSeedData";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

type Role = "owner" | "employee";
type PaymentMethod = "cash" | "transfer";
type ProductTab = "import" | "categories" | "stock";

type Session = {
  role: Role;
  name: string;
};

type Customer = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
};

type Category = {
  id: string;
  name: string;
  description: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  netPrice?: number;
  wholesalePrice?: number;
  retailPrice: number;
  stock: number;
  lowStockThreshold: number;
};

type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type Sale = {
  id: string;
  receiptNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  pointsUsed: number;
  pointsEarned: number;
};

type RefundItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type RefundRecord = {
  id: string;
  saleId: string;
  saleReceiptNumber: string;
  customerName: string;
  reason: string;
  total: number;
  items: RefundItem[];
  createdAt: string;
};

type ReportSnapshot = {
  id: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  salesTotal: number;
  refundTotal: number;
  topProduct: string;
};

type AppContextValue = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  customers: Customer[];
  setCustomers: (
    updater: Customer[] | ((current: Customer[]) => Customer[]),
  ) => void;
  categories: Category[];
  setCategories: (
    updater: Category[] | ((current: Category[]) => Category[]),
  ) => void;
  products: Product[];
  setProducts: (
    updater: Product[] | ((current: Product[]) => Product[]),
  ) => void;
  sales: Sale[];
  setSales: (updater: Sale[] | ((current: Sale[]) => Sale[])) => void;
  refunds: RefundRecord[];
  setRefunds: (
    updater: RefundRecord[] | ((current: RefundRecord[]) => RefundRecord[]),
  ) => void;
  reports: ReportSnapshot[];
  setReports: (
    updater:
      | ReportSnapshot[]
      | ((current: ReportSnapshot[]) => ReportSnapshot[]),
  ) => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
};

const DEFAULT_PRODUCT_STOCK = 50;
const SEEDED_PRODUCT_MIN_STOCK = 30;
const SEEDED_PRODUCT_STOCK_STEP = 5;
const SEEDED_PRODUCT_STOCK_BUCKETS = 5;
const RESTOCK_THRESHOLD_RATIO = 0.3;
const DEFAULT_RESTOCK_THRESHOLD = Math.ceil(
  DEFAULT_PRODUCT_STOCK * RESTOCK_THRESHOLD_RATIO,
);

function getRestockThreshold(stock: number) {
  return Math.ceil(stock * RESTOCK_THRESHOLD_RATIO);
}

function getResetProductStock(index: number) {
  return (
    SEEDED_PRODUCT_MIN_STOCK +
    (index % SEEDED_PRODUCT_STOCK_BUCKETS) * SEEDED_PRODUCT_STOCK_STEP
  );
}

function resetProductQuantities(products: Product[]) {
  return products.map((product, index) => {
    const stock = getResetProductStock(index);
    return {
      ...product,
      stock,
      lowStockThreshold: getRestockThreshold(stock),
    };
  });
}

const categoriesSeed: Category[] = [
  {
    id: "mie",
    name: "MIE",
    description: "Instant noodles and dry noodle staples.",
  },
  {
    id: "bumbu",
    name: "BUMBU MASAKAN",
    description: "Cooking essentials, seasonings, sauces, and oil.",
  },
  {
    id: "minuman",
    name: "SUSU & MINUMAN",
    description: "Milk, canned drinks, and beverage staples.",
  },
  {
    id: "kopi",
    name: "KOPI & TEH",
    description: "Coffee, tea, and warm drinks.",
  },
  {
    id: "snack",
    name: "SNACK",
    description: "Biscuits, chips, wafers, and cashier snacks.",
  },
  {
    id: "sabun",
    name: "SABUN & DETERJEN",
    description: "Soap, detergent, and household cleaning items.",
  },
  {
    id: "gula",
    name: "GULA TEPUNG",
    description: "Sugar, flour, and baking staples.",
  },
  {
    id: "kesehatan",
    name: "KESEHATAN",
    description: "Health, medicine, and personal care items.",
  },
  {
    id: "dessert",
    name: "DESSERT",
    description: "Dessert mixes and jelly products.",
  },
];

const categoryIdBySeedName: Record<string, string> = {
  MIE: "mie",
  "BUMBU MASAKAN": "bumbu",
  "SUSU & MINUMAN": "minuman",
  "KOPI & TEH": "kopi",
  SNACK: "snack",
  "SABUN & DETERJEN": "sabun",
  "GULA TEPUNG": "gula",
  KESEHATAN: "kesehatan",
  DESSERT: "dessert",
};

type ProductSeedRow = readonly [
  id: number,
  name: string,
  category: string,
  netPrice: number,
  wholesalePrice: number,
  retailPrice: number,
];

const productSeedRows: ProductSeedRow[] = [
  [1, "MIE NYONYA", "MIE", 0, 30000, 0],
  [2, "MIE PALEM", "MIE", 0, 100000, 0],
  [3, "MIE BAKSO", "MIE", 0, 134500, 0],
  [4, "MIE DARA", "MIE", 1000, 135500, 1000],
  [5, "SEDAAP MIE GR 91GR (40)", "MIE", 109000, 3000, 3500],
  [6, "SEDAAP MIE KARI SPESIAL 75GR (40)", "MIE", 105500, 2900, 3250],
  [7, "SEDAAP MIE KOREAN SPICY 87GR (40)", "MIE", 109150, 3000, 3500],
  [8, "SEDAAP MIE", "MIE", 109150, 3000, 3500],
  [9, "MIE BAKSO SUPER", "MIE", 34500, 35500, 36000],
  [10, "MIE INSTAN INTERMI (40)", "MIE", 51000, 52500, 1500],
  [11, "MIE KUDA MENJANGAN", "MIE", 0, 41000, 0],
  [12, "RIMBA", "BUMBU MASAKAN", 9420, 9750, 10000],
  [13, "TAWON", "BUMBU MASAKAN", 0, 15000, 0],
  [14, "DORANG", "BUMBU MASAKAN", 0, 18000, 0],
  [15, "BANGAU", "BUMBU MASAKAN", 0, 10000, 0],
  [16, "KECAP MANIS", "BUMBU MASAKAN", 58700, 1350, 1500],
  [17, "TAWON B", "BUMBU MASAKAN", 0, 16500, 0],
  [18, "BENDERA", "SUSU & MINUMAN", 0, 8000, 0],
  [19, "BENDERA KALENG", "SUSU & MINUMAN", 0, 12000, 0],
  [20, "INDOMILK KALENG PUTIH", "SUSU & MINUMAN", 81144, 82500, 3500],
  [21, "INDOMILK", "SUSU & MINUMAN", 0, 12000, 0],
  [22, "OMELA KECIL", "SUSU & MINUMAN", 0, 10000, 0],
  [23, "OMELA BESAR", "SUSU & MINUMAN", 0, 12500, 0],
  [24, "DANCOW", "SUSU & MINUMAN", 0, 35500, 0],
  [25, "MILO", "SUSU & MINUMAN", 0, 18500, 0],
  [26, "CARNATION", "SUSU & MINUMAN", 14000, 14500, 14500],
  [27, "ENERGEN", "SUSU & MINUMAN", 0, 19000, 0],
  [28, "GIV", "SABUN & DETERJEN", 0, 2700, 0],
  [29, "GENTLE", "SABUN & DETERJEN", 0, 10000, 0],
  [30, "RINSO 100", "SABUN & DETERJEN", 90000, 10000, 0],
  [31, "RINSO 500", "SABUN & DETERJEN", 0, 4500, 0],
  [32, "SITRUN", "SABUN & DETERJEN", 0, 40000, 0],
  [33, "DAIA 1000", "SABUN & DETERJEN", 0, 10000, 0],
  [34, "POWDET B", "SABUN & DETERJEN", 99300, 100000, 3500],
  [35, "SABUN JAZ", "SABUN & DETERJEN", 181100, 15500, 16000],
  [36, "SABUN JAZ", "SABUN & DETERJEN", 110000, 115000, 120000],
  [37, "GULA RA", "GULA TEPUNG", 0, 15300, 0],
  [38, "KODOK", "GULA TEPUNG", 195000, 205000, 0],
  [39, "PAYUNG", "GULA TEPUNG", 0, 168000, 0],
  [40, "CAKRA", "GULA TEPUNG", 0, 215000, 0],
  [41, "SEGITIGA BIRU", "GULA TEPUNG", 0, 211000, 0],
  [42, "GULA LOS", "GULA TEPUNG", 0, 15700, 15700],
  [43, "LENCANA", "GULA TEPUNG", 0, 171000, 0],
  [44, "TRIGU", "GULA TEPUNG", 0, 0, 7000],
  [45, "MIWON 100", "BUMBU MASAKAN", 0, 21000, 0],
  [46, "MIWON 1", "BUMBU MASAKAN", 0, 54000, 0],
  [47, "MIWON 1", "BUMBU MASAKAN", 0, 110000, 0],
  [48, "LADAKU", "BUMBU MASAKAN", 999999, 10000, 0],
  [49, "ROYCO 22", "BUMBU MASAKAN", 197000, 0, 0],
  [50, "ROYCO", "BUMBU MASAKAN", 0, 4750, 0],
  [51, "MASAKO", "BUMBU MASAKAN", 0, 4750, 0],
  [52, "GROSOK", "BUMBU MASAKAN", 26350, 27500, 29000],
  [53, "CERDIK HA", "BUMBU MASAKAN", 28500, 31500, 32500],
  [54, "MINYAK K", "BUMBU MASAKAN", 0, 21000, 0],
  [55, "SANCO 1 L", "BUMBU MASAKAN", 239000, 21000, 21000],
  [56, "MINYAK B", "BUMBU MASAKAN", 0, 18500, 19500],
  [57, "TOP PLUS", "KOPI & TEH", 85000, 95000, 9000],
  [58, "KAPAL API", "KOPI & TEH", 0, 0, 0],
  [59, "KAPAL API", "KOPI & TEH", 0, 0, 9500],
  [60, "TEH NAGA", "KOPI & TEH", 0, 19000, 0],
  [61, "TEH 999", "KOPI & TEH", 0, 0, 0],
  [62, "ANGET SARI", "KOPI & TEH", 270500, 14000, 15000],
  [63, "NUTRIJELL", "DESSERT", 1670, 20000, 2200],
  [64, "NUTRIJELL", "DESSERT", 1670, 20000, 2200],
  [65, "NUTRIJELL", "DESSERT", 1670, 20000, 2200],
  [66, "NUTRIJELL", "DESSERT", 1670, 20000, 2200],
  [67, "NUTRIJELL", "DESSERT", 1670, 20000, 2200],
  [68, "NUTRIJELL", "DESSERT", 2431, 29200, 30000],
  [69, "TEH GOPE", "KOPI & TEH", 0, 0, 0],
  [70, "KAPAL API", "KOPI & TEH", 0, 0, 0],
  [71, "TOLAK ANGIN", "KESEHATAN", 0, 46000, 0],
  [72, "DECOLGEN", "KESEHATAN", 0, 0, 3000],
  [73, "BISKUIT RO", "SNACK", 8125, 8750, 0],
  [74, "ROMA SARI", "SNACK", 0, 0, 0],
  [75, "CRISPY CR", "SNACK", 94500, 9750, 10000],
  [76, "COCOLATOS", "SNACK", 155000, 20500, 21000],
  [77, "COCOLATOS", "SNACK", 155000, 20500, 21000],
  [78, "POWDET B", "SABUN & DETERJEN", 99300, 100000, 3500],
  [79, "JOLLY FAC", "KESEHATAN", 328000, 84000, 85000],
  [80, "PASEO SM", "KESEHATAN", 423601, 9000, 9500],
  [81, "CHARM EX", "KESEHATAN", 262429, 12000, 13000],
  [82, "CHARM EX", "KESEHATAN", 329474, 14500, 15000],
  [83, "CHARM EX", "KESEHATAN", 59164, 19500, 20000],
  [84, "CHARM EX", "KESEHATAN", 1550, 1750, 2000],
  [85, "CHARM EX", "KESEHATAN", 1900, 2250, 2500],
  [86, "CHARM EX", "KESEHATAN", 2250, 2500, 2900],
  [87, "SUSEMI SA", "SABUN & DETERJEN", 1300, 1500, 1750],
];

const productsSeed: Product[] = productSeedRows.map(
  ([id, name, category, netPrice, wholesalePrice, retailPrice], index) => {
    const stock = getResetProductStock(index);

    return {
      id: `prd-${id}`,
      sku: `${slugify(name)}-${id}`,
      name,
      categoryId: categoryIdBySeedName[category] ?? "bumbu",
      netPrice: netPrice > 0 ? netPrice : undefined,
      wholesalePrice: wholesalePrice > 0 ? wholesalePrice : undefined,
      retailPrice:
        retailPrice > 0
          ? retailPrice
          : wholesalePrice > 0
            ? wholesalePrice
            : netPrice,
      stock,
      lowStockThreshold: getRestockThreshold(stock),
    };
  },
);

const customersSeed: Customer[] = [
  {
    id: "CUST-0001",
    name: "Bu Yuni",
    phone: "0812-7000-1188",
    address: "Kebon Jeruk, Jakarta Barat",
    loyaltyPoints: 485,
  },
  {
    id: "CUST-0002",
    name: "Kios Rajawali",
    phone: "0812-4222-9988",
    address: "Cengkareng, Jakarta Barat",
    loyaltyPoints: 240,
  },
  {
    id: "CUST-0003",
    name: "Warung Sari",
    phone: "0812-1456-8877",
    address: "Palmerah, Jakarta Barat",
    loyaltyPoints: 120,
  },
];

const reportsSeed: ReportSnapshot[] = [
  {
    id: "RPT-0001",
    createdAt: "2026-04-01T08:30:00+07:00",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    salesTotal: 58190250,
    refundTotal: 2415400,
    topProduct: "SEDAAP MIE GR 91GR (40)",
  },
  {
    id: "RPT-0002",
    createdAt: "2026-03-01T08:20:00+07:00",
    periodStart: "2026-02-01",
    periodEnd: "2026-02-29",
    salesTotal: 54882100,
    refundTotal: 1924600,
    topProduct: "INDOMILK KALENG PUTIH",
  },
];

const AppContext = createContext<AppContextValue | null>(null);
const STORE_NAME = "MyPOS Sumber Kasih";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatClockTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(value)
    .replaceAll(":", ".");
}

function formatLongIndonesianDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(",", "");
}

function formatReceiptDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatReceiptTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replaceAll(":", ".");
}

const REFUND_DAYS_LIMIT = 3;

function isWithinRefundWindow(createdAt: string) {
  const saleDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - saleDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= REFUND_DAYS_LIMIT;
}

function paymentMethodLabel(method: PaymentMethod) {
  return method === "cash" ? "Tunai" : "Transfer QRIS";
}

function buildReceiptHtml({
  sale,
  storeName,
  employeeName,
}: {
  sale: Sale;
  storeName: string;
  employeeName: string;
}) {
  const rows = sale.items
    .map(
      (item) => `
        <tr>
          <td class="name-cell">
            <div class="item-name">${escapeHtml(item.productName)}</div>
            <div class="item-meta">${item.quantity} x ${escapeHtml(formatCurrency(item.unitPrice))}</div>
          </td>
          <td class="amount-cell">${escapeHtml(formatCurrency(item.subtotal))}</td>
        </tr>
      `,
    )
    .join("");

  const customerLine = sale.customerName
    ? `<div>Pelanggan: ${escapeHtml(sale.customerName)}</div>`
    : "";
  const pointsUsedLine =
    sale.pointsUsed > 0
      ? `<div>Poin digunakan: ${escapeHtml(String(sale.pointsUsed))}</div>`
      : "";
  const pointsEarnedLine = `<div>Poin didapat: ${escapeHtml(String(sale.pointsEarned))}</div>`;

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(sale.receiptNumber)}</title>
    <style>
      @page { size: 58mm auto; margin: 6mm 5mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #0f172a;
        background: #ffffff;
        font-family: "Courier New", monospace;
      }
      .receipt {
        width: 48mm;
        margin: 0 auto;
        font-size: 11px;
        line-height: 1.45;
      }
      .center { text-align: center; }
      .divider {
        margin: 6px 0;
        white-space: pre;
      }
      .store-name {
        font-size: 15px;
        font-weight: 700;
      }
      .meta {
        margin-top: 6px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      td {
        vertical-align: top;
        padding: 4px 0;
      }
      .name-cell {
        width: 68%;
        padding-right: 10px;
      }
      .amount-cell {
        width: 32%;
        text-align: right;
        white-space: nowrap;
      }
      .item-name {
        font-weight: 700;
      }
      .item-meta {
        color: #475569;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        font-size: 12px;
      }
      .footer {
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="receipt">
      <div class="divider">================================</div>
      <div class="center store-name">${escapeHtml(storeName)}</div>
      <div class="center">${escapeHtml(sale.receiptNumber)}</div>
      <div class="center" style="margin-top:4px">${escapeHtml(employeeName)}</div>
      <div class="center" style="margin-top:2px;color:#475569">${escapeHtml(paymentMethodLabel(sale.paymentMethod))}</div>
      <div class="divider">================================</div>
      <div class="meta">
        <div>Tanggal: ${escapeHtml(formatReceiptDate(sale.createdAt))}</div>
        <div>Jam: ${escapeHtml(formatReceiptTime(sale.createdAt))}</div>
        ${customerLine}
        ${pointsUsedLine}
        ${pointsEarnedLine}
      </div>
      <div class="divider">--------------------------------</div>
      <table>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="divider">--------------------------------</div>
      <div class="total-row">
        <span>Total</span>
        <span>${escapeHtml(formatCurrency(sale.total))}</span>
      </div>
      <div class="divider">================================</div>
      <div class="footer">
        <div>Terima kasih!</div>
        <div>${escapeHtml(storeName)}</div>
      </div>
    </main>
    <script>
      window.addEventListener("load", function () {
        window.focus();
        window.print();
      });
      window.addEventListener("afterprint", function () {
        window.close();
      });
    </script>
  </body>
</html>`;
}

function printSaleReceipt(sale: Sale, employeeName: string) {
  const printWindow = window.open("", "mypos-receipt", "width=420,height=720");
  if (!printWindow) {
    throw new Error(
      "Popup struk diblokir browser. Izinkan pop-up lalu coba lagi.",
    );
  }

  printWindow.document.open();
  printWindow.document.write(
    buildReceiptHtml({
      sale,
      storeName: STORE_NAME,
      employeeName,
    }),
  );
  printWindow.document.close();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

type ImportRow = {
  id?: string;
  name: string;
  category: string;
  netPrice?: number;
  wholesalePrice?: number;
  retailPrice: number;
};

function normalizeImportRows(rawRows: unknown[][]): ImportRow[] {
  if (!rawRows.length) {
    return [];
  }

  const [headerRow, ...dataRows] = rawRows;
  const headers = headerRow.map((cell) =>
    String(cell ?? "")
      .trim()
      .toLowerCase(),
  );
  const idIndex = headers.findIndex((header) => header === "id");
  const nameIndex = headers.findIndex((header) => header === "name");
  const categoryIndex = headers.findIndex(
    (header) =>
      header === "category" || header === "kategori" || header === "kriteria",
  );
  const retailPriceIndex = headers.findIndex(
    (header) =>
      header === "eceran price" ||
      header === "eceranprice" ||
      header === "retail price" ||
      header === "retailprice" ||
      header === "harga retail" ||
      header === "harga" ||
      header === "price",
  );
  const netPriceIndex = headers.findIndex(
    (header) =>
      header === "net price" || header === "netprice" || header === "harga net",
  );
  const wholesalePriceIndex = headers.findIndex(
    (header) =>
      header === "grosir price" ||
      header === "grosirprice" ||
      header === "wholesale price" ||
      header === "wholesaleprice" ||
      header === "harga grosir",
  );

  if (nameIndex === -1 || categoryIndex === -1 || retailPriceIndex === -1) {
    throw new Error(
      "Header file harus memiliki kolom: Name, Kriteria, Eceran Price. Net Price dan Grosir Price boleh ditambahkan.",
    );
  }

  return dataRows
    .map((row) => {
      const retailPrice = Number.parseFloat(
        String(row[retailPriceIndex] ?? "").replace(/[^0-9.-]/g, ""),
      );
      const netPrice =
        netPriceIndex === -1
          ? Number.NaN
          : Number.parseFloat(
              String(row[netPriceIndex] ?? "").replace(/[^0-9.-]/g, ""),
            );
      const wholesalePrice =
        wholesalePriceIndex === -1
          ? Number.NaN
          : Number.parseFloat(
              String(row[wholesalePriceIndex] ?? "").replace(/[^0-9.-]/g, ""),
            );

      return {
        id:
          idIndex >= 0 && row[idIndex] !== undefined && row[idIndex] !== null
            ? String(row[idIndex]).trim()
            : undefined,
        name: String(row[nameIndex] ?? "").trim(),
        category: String(row[categoryIndex] ?? "").trim(),
        netPrice: Number.isFinite(netPrice) ? netPrice : undefined,
        wholesalePrice: Number.isFinite(wholesalePrice)
          ? wholesalePrice
          : undefined,
        retailPrice,
      };
    })
    .filter(
      (row) =>
        row.name &&
        row.category &&
        Number.isFinite(row.retailPrice) &&
        row.retailPrice > 0,
    );
}

async function parseImportFile(file: File): Promise<ImportRow[]> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".csv")) {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((line) => line.split(",").map((cell) => cell.trim()))
      .filter((row) => row.some(Boolean));
    return normalizeImportRows(rows);
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      blankrows: false,
    }) as unknown[][];
    return normalizeImportRows(rows);
  }

  throw new Error("Format file belum didukung. Gunakan .csv atau .xlsx.");
}

function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function PosIcon() {
  return (
    <IconBase>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M10 16v4" />
      <path d="M14 16v4" />
    </IconBase>
  );
}

function RotateIcon() {
  return (
    <IconBase>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v6h-6" />
    </IconBase>
  );
}

function BoxIcon() {
  return (
    <IconBase>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m12 12 8-4.5" />
      <path d="m12 12-8-4.5" />
      <path d="M12 12v9" />
    </IconBase>
  );
}

function ChartIcon() {
  return (
    <IconBase>
      <path d="M4 20h16" />
      <path d="M7 17V10" />
      <path d="M12 17V6" />
      <path d="M17 17v-4" />
    </IconBase>
  );
}

function SearchIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconBase>
  );
}

function PanelOpenIcon() {
  return (
    <IconBase>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

function PanelCloseIcon() {
  return (
    <IconBase>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </IconBase>
  );
}

function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => {
    const raw = window.localStorage.getItem("mypos-session");
    return raw ? (JSON.parse(raw) as Session) : null;
  });
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [customers, setCustomersState] = useState<Customer[]>(customersSeed);
  const [categories, setCategoriesState] = useState<Category[]>(categoriesSeed);
  const [products, setProductsState] = useState<Product[]>(productsSeed);
  const [sales, setSalesState] = useState<Sale[]>(() => {
    const raw = window.localStorage.getItem("mypos-sales");
    return raw ? (JSON.parse(raw) as Sale[]) : salesSeedData;
  });
  const [refunds, setRefundsState] = useState<RefundRecord[]>(() => {
    const raw = window.localStorage.getItem("mypos-refunds");
    return raw ? (JSON.parse(raw) as RefundRecord[]) : [];
  });
  const [reports, setReportsState] = useState<ReportSnapshot[]>(reportsSeed);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = makeId("toast");
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  useEffect(() => {
    if (session) {
      window.localStorage.setItem("mypos-session", JSON.stringify(session));
    } else {
      window.localStorage.removeItem("mypos-session");
    }
  }, [session]);

  useEffect(() => {
    window.localStorage.setItem("mypos-sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    window.localStorage.setItem("mypos-refunds", JSON.stringify(refunds));
  }, [refunds]);

  const value: AppContextValue = {
    session,
    setSession: setSessionState,
    sidebarCollapsed,
    setSidebarCollapsed: setSidebarCollapsedState,
    customers,
    setCustomers: (updater) =>
      setCustomersState((current) =>
        typeof updater === "function"
          ? (updater as (value: Customer[]) => Customer[])(current)
          : updater,
      ),
    categories,
    setCategories: (updater) =>
      setCategoriesState((current) =>
        typeof updater === "function"
          ? (updater as (value: Category[]) => Category[])(current)
          : updater,
      ),
    products,
    setProducts: (updater) =>
      setProductsState((current) =>
        typeof updater === "function"
          ? (updater as (value: Product[]) => Product[])(current)
          : updater,
      ),
    sales,
    setSales: (updater) =>
      setSalesState((current) =>
        typeof updater === "function"
          ? (updater as (value: Sale[]) => Sale[])(current)
          : updater,
      ),
    refunds,
    setRefunds: (updater) =>
      setRefundsState((current) =>
        typeof updater === "function"
          ? (updater as (value: RefundRecord[]) => RefundRecord[])(current)
          : updater,
      ),
    reports,
    setReports: (updater) =>
      setReportsState((current) =>
        typeof updater === "function"
          ? (updater as (value: ReportSnapshot[]) => ReportSnapshot[])(current)
          : updater,
      ),
    toasts,
    addToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useAppModel() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("App context is missing.");
  }
  return context;
}

function ToastContainer() {
  const { toasts } = useAppModel();
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ProtectedPage({
  title,
  pageClass,
  children,
}: {
  title: string;
  pageClass: string;
  children: ReactNode;
}) {
  const {
    session,
    sidebarCollapsed,
    setSidebarCollapsed,
    setSession,
    setProducts,
    setRefunds,
  } = useAppModel();
  const location = useLocation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const shellClass = sidebarCollapsed
    ? "site-shell site-shell--collapsed"
    : "site-shell";
  const sidebarClass = sidebarCollapsed
    ? "sidebar sidebar--collapsed"
    : "sidebar";

  return (
    <div className={pageClass}>
      <div className={shellClass}>
        <aside className={sidebarClass}>
          <div className="sidebar__header">
            <div className="sidebar__brand">
              <img className="sidebar__logo" src="/logo.png.jpeg" alt="MyPOS Sumber Kasih" />
            </div>
            <button
              type="button"
              className="sidebar__toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              {sidebarCollapsed ? <PanelOpenIcon /> : <PanelCloseIcon />}
            </button>
          </div>
          <div className="sidebar__divider" />
          <nav className="sidebar__nav">
            <div className="nav-list">
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `nav-link${isActive ? " is-active" : ""}`
                }
              >
                <span className="nav-link__icon">
                  <PosIcon />
                </span>
                <span className="nav-link__label">Transaksi</span>
              </NavLink>
              <NavLink
                to="/refunds"
                className={({ isActive }) =>
                  `nav-link${isActive ? " is-active" : ""}`
                }
              >
                <span className="nav-link__icon">
                  <RotateIcon />
                </span>
                <span className="nav-link__label">Refund &amp; History</span>
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `nav-link${isActive ? " is-active" : ""}`
                }
              >
                <span className="nav-link__icon">
                  <BoxIcon />
                </span>
                <span className="nav-link__label">Produk</span>
              </NavLink>
              {session.role === "owner" ? (
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `nav-link${isActive ? " is-active" : ""}`
                  }
                >
                  <span className="nav-link__icon">
                    <ChartIcon />
                  </span>
                  <span className="nav-link__label">Laporan</span>
                </NavLink>
              ) : null}
            </div>
          </nav>
          <div className="sidebar__divider" />
          <div className="sidebar__footer">
            <button
              type="button"
              className="button button--secondary button--full sidebar__reset-button"
              onClick={() => {
                setProducts(resetProductQuantities);
                setRefunds([]);
              }}
            >
              Reset Quantity
            </button>
            <div className="sidebar__footer-copy">
              <strong>{session.name}</strong>
              <div>
                Tipe: {session.role === "owner" ? "Pemilik" : "Karyawan"}
              </div>
              <div>Data tersimpan lokal di browser ini.</div>
            </div>
            <div
              className="spacer-top"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <button
                type="button"
                className="button button--secondary button--full"
                onClick={() => setSession(null)}
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>
        <div className="page-area">
          <header className="topbar">
            <h2 className="topbar__title">{title}</h2>
            <ToastContainer />
            <div className="topbar__clock">
              <div className="topbar__time">{formatClockTime(now)}</div>
              <div className="topbar__date">
                {formatLongIndonesianDate(now)}
              </div>
            </div>
          </header>
          <main className="page-content" key={location.pathname}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { session, setSession } = useAppModel();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("owner");
  const [name, setName] = useState("Pemilik");

  if (session) {
    return <Navigate to="/transactions" replace />;
  }

  return (
    <div className="login-page">
      <main className="login-shell">
        <section className="login-card">
          <div className="login-card__head">
            <img className="login__logo" src="/logo.png.jpeg" alt="MyPOS Sumber Kasih" />
            <p className="card-subtitle">Pilih peran Anda untuk masuk</p>
          </div>
          <div className="form-stack">
            <button
              type="button"
              className={`role-card${selectedRole === "employee" ? " is-selected" : ""}`}
              onClick={() => {
                setSelectedRole("employee");
                if (!name || name === "Pemilik") {
                  setName("Karyawan");
                }
              }}
            >
              <h2 className="role-card__title">Karyawan</h2>
              <p className="role-card__copy">
                Akses ke transaksi, refund, dan produk.
              </p>
            </button>
            <button
              type="button"
              className={`role-card${selectedRole === "owner" ? " is-selected" : ""}`}
              onClick={() => {
                setSelectedRole("owner");
                if (!name || name === "Karyawan") {
                  setName("Pemilik");
                }
              }}
            >
              <h2 className="role-card__title">Pemilik</h2>
              <p className="role-card__copy">
                Akses penuh ke semua fitur dan ringkasan operasional toko.
              </p>
            </button>
            <label className="field-group">
              <span className="field-label">Nama (opsional)</span>
              <input
                className="field"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={() => {
                setSession({
                  role: selectedRole,
                  name:
                    name.trim() ||
                    (selectedRole === "owner" ? "Pemilik" : "Karyawan"),
                });
                navigate("/transactions");
              }}
            >
              Masuk
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

type CartLine = { productId: string; quantity: number };

function TransactionsRoute() {
  const { sidebarCollapsed } = useAppModel();
  const [step, setStep] = useState<"lookup" | "order" | "payment" | "receipt">(
    "lookup",
  );

  const pageClass =
    step === "lookup"
      ? "transactions-lookup-page"
      : step === "payment"
        ? "transactions-payment-loyalty-page"
        : step === "receipt"
          ? "transactions-receipt-page"
          : sidebarCollapsed
            ? "transactions-order-collapsed-page"
            : "transactions-order-expanded-page";

  return (
    <ProtectedPage title="Transaksi" pageClass={pageClass}>
      <TransactionsPage step={step} setStep={setStep} />
    </ProtectedPage>
  );
}

function TransactionsPage({
  step,
  setStep,
}: {
  step: "lookup" | "order" | "payment" | "receipt";
  setStep: (step: "lookup" | "order" | "payment" | "receipt") => void;
}) {
  const {
    session,
    customers,
    setCustomers,
    products,
    setProducts,
    categories,
    sales,
    setSales,
    sidebarCollapsed,
  } = useAppModel();
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    "CUST-0001",
  );
  const [productQuery, setProductQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [usePoints, setUsePoints] = useState(true);
  const [ownerId, setOwnerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [receiptMessage, setReceiptMessage] = useState(
    "Struk digital akan diarahkan ke nomor 0812-7000-1188 dan tetap bisa diteruskan pelanggan.",
  );
  const [printStatus, setPrintStatus] = useState("");
  const receiptReturnTimerRef = useRef<number | null>(null);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  const matchingCustomers = customers.filter((customer) => {
    const query = searchCustomer.trim().toLowerCase();
    if (!query) return true;
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone?.includes(searchCustomer) ||
      customer.address?.toLowerCase().includes(query)
    );
  });

  const categoryNameById = new Map<string, string>(
    categories.map((category) => [category.id, category.name]),
  );
  const categoryTabs = categories
    .filter((category) =>
      products.some((product) => product.categoryId === category.id),
    )
    .map((category) => ({
      id: category.id,
      name: category.name,
      count: products.filter((product) => product.categoryId === category.id)
        .length,
    }));

  useEffect(() => {
    if (
      activeCategoryId !== "all" &&
      !categoryTabs.some((category) => category.id === activeCategoryId)
    ) {
      setActiveCategoryId("all");
    }
  }, [activeCategoryId, categoryTabs]);

  useEffect(() => {
    return () => {
      if (receiptReturnTimerRef.current !== null) {
        window.clearTimeout(receiptReturnTimerRef.current);
      }
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategoryId === "all" || product.categoryId === activeCategoryId;
    const query = productQuery.trim().toLowerCase();
    const categoryName =
      categoryNameById.get(product.categoryId)?.toLowerCase() ?? "";
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      categoryName.includes(query);
    return matchesCategory && matchesQuery;
  });

  const cartItems = cart
    .map((line) => {
      const product = products.find((entry) => entry.id === line.productId);
      if (!product) return null;
      return {
        product,
        quantity: line.quantity,
        subtotal: product.retailPrice * line.quantity,
      };
    })
    .filter(
      (
        item,
      ): item is { product: Product; quantity: number; subtotal: number } =>
        item !== null,
    );

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
  const pointsUsed =
    usePoints && selectedCustomer
      ? Math.min(selectedCustomer.loyaltyPoints, subtotal)
      : 0;
  const finalTotal = Math.max(subtotal - pointsUsed, 0);
  const pointsEarned = Math.floor(subtotal * 0.01);

  function restoreCartStock(lines: CartLine[]) {
    if (!lines.length) {
      return;
    }

    setProducts((current) =>
      current.map((product) => {
        const cartLine = lines.find((line) => line.productId === product.id);
        return cartLine
          ? { ...product, stock: product.stock + cartLine.quantity }
          : product;
      }),
    );
  }

  function clearCart() {
    restoreCartStock(cart);
    setCart([]);
  }

  function addToCart(productId: string) {
    const product = products.find((entry) => entry.id === productId);
    if (!product || product.stock <= 0) {
      return;
    }

    setProducts((current) =>
      current.map((entry) =>
        entry.id === productId
          ? { ...entry, stock: Math.max(entry.stock - 1, 0) }
          : entry,
      ),
    );
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (!existing) {
        return [...current, { productId, quantity: 1 }];
      }
      return current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      );
    });
  }

  function updateQuantity(productId: string, nextQuantity: number) {
    const currentLine = cart.find((line) => line.productId === productId);
    const currentQuantity = currentLine?.quantity ?? 0;
    const delta = nextQuantity - currentQuantity;

    if (delta > 0) {
      const product = products.find((entry) => entry.id === productId);
      if (!product || product.stock < delta) {
        return;
      }
    }

    if (delta !== 0) {
      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, stock: Math.max(product.stock - delta, 0) }
            : product,
        ),
      );
    }

    if (nextQuantity <= 0) {
      setCart((current) =>
        current.filter((line) => line.productId !== productId),
      );
      return;
    }
    setCart((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: nextQuantity }
          : line,
      ),
    );
  }

  function startOrder(customerId: string | null) {
    setSelectedCustomerId(customerId);
    setStep("order");
  }

  function createCustomer() {
    if (!newCustomerName.trim()) {
      return;
    }
    const maxNum = customers.reduce((max, c) => {
      const num = parseInt(c.id.replace("CUST-", ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const customer: Customer = {
      id: `CUST-${String(maxNum + 1).padStart(4, "0")}`,
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || undefined,
      address: newCustomerAddress.trim() || undefined,
      loyaltyPoints: 0,
    };
    setCustomers((current) => [customer, ...current]);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerAddress("");
    setShowCreateCustomer(false);
    startOrder(customer.id);
  }

  function completeTransaction() {
    if (!cartItems.length) {
      return;
    }

    const receiptIndex =
      Math.max(
        1049,
        ...sales.map((sale) =>
          Number.parseInt(sale.receiptNumber.replace("RCPT-", ""), 10),
        ),
      ) + 1;

    const sale: Sale = {
      id: makeId("sale"),
      receiptNumber: `RCPT-${receiptIndex}`,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name ?? "Umum",
      customerPhone: selectedCustomer?.phone,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.retailPrice,
        subtotal: item.subtotal,
      })),
      total: subtotal,
      paymentMethod,
      createdAt: new Date().toISOString(),
      pointsUsed,
      pointsEarned,
    };

    if (selectedCustomer) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === selectedCustomer.id
            ? {
                ...customer,
                loyaltyPoints:
                  customer.loyaltyPoints - pointsUsed + pointsEarned,
              }
            : customer,
        ),
      );
      setReceiptMessage(
        selectedCustomer.phone
          ? `Struk digital akan diarahkan ke nomor ${selectedCustomer.phone} dan tetap bisa diteruskan pelanggan.`
          : "Pilih pelanggan dengan nomor WhatsApp untuk kirim langsung, atau bagikan manual.",
      );
    } else {
      setReceiptMessage(
        "Struk siap dicetak dan dapat dibagikan manual ke pelanggan umum.",
      );
    }

    setSales((current) => [sale, ...current]);
    setCompletedSale(sale);
    setPrintStatus("");
    setCart([]);
    setStep("receipt");
  }

  function resetTransaction() {
    if (receiptReturnTimerRef.current !== null) {
      window.clearTimeout(receiptReturnTimerRef.current);
      receiptReturnTimerRef.current = null;
    }
    setSearchCustomer("");
    setShowCreateCustomer(false);
    setSelectedCustomerId("CUST-0001");
    setProductQuery("");
    setActiveCategoryId("all");
    restoreCartStock(cart);
    setCart([]);
    setUsePoints(true);
    setPaymentMethod("cash");
    setCompletedSale(null);
    setPrintStatus("");
    setStep("lookup");
  }

  function handlePrintReceipt() {
    if (!completedSale) {
      return;
    }

    try {
      printSaleReceipt(completedSale, session?.name ?? "");
      setPrintStatus(
        "Jendela print struk dibuka. Halaman akan kembali ke transaksi dalam 5 detik.",
      );
      if (receiptReturnTimerRef.current !== null) {
        window.clearTimeout(receiptReturnTimerRef.current);
      }
      receiptReturnTimerRef.current = window.setTimeout(() => {
        receiptReturnTimerRef.current = null;
        resetTransaction();
      }, 5000);
    } catch (error) {
      setPrintStatus(
        error instanceof Error ? error.message : "Gagal membuka print struk.",
      );
    }
  }

  if (step === "lookup") {
    return (
      <div className="lookup-split__left">
        <section className="panel">
          <h1 className="page-heading">Data Pelanggan</h1>
          <p className="section-subtitle">
            Cari pelanggan berdasarkan nama atau nomor telepon.
          </p>
          <div className="form-stack spacer-top">
            <input
              className="field"
              type="text"
              value={searchCustomer}
              placeholder="Ketik nama atau telepon..."
              onChange={(event) => setSearchCustomer(event.target.value)}
            />
            {matchingCustomers.length > 0 ? (
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Pelanggan</th>
                      <th>Telepon</th>
                      <th>Customer ID</th>
                      <th>Poin</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingCustomers.slice(0, 6).map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{customer.phone ?? "-"}</td>
                        <td>{customer.id}</td>
                        <td>{customer.loyaltyPoints}</td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="button button--ghost"
                            onClick={() => startOrder(customer.id)}
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="button-row">
              <button
                type="button"
                className="button button--primary"
                onClick={() => setShowCreateCustomer(true)}
              >
                Buat Pelanggan Baru
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => startOrder(null)}
              >
                Lewati (Pelanggan Umum)
              </button>
            </div>
          </div>
        </section>
        {showCreateCustomer ? (
          <section className="panel">
            <h2 className="card-title" style={{ fontSize: 28 }}>
              Buat Pelanggan Baru
            </h2>
            <div className="form-stack spacer-top">
              <label className="field-group">
                <span className="field-label">Nama</span>
                <input
                  className="field"
                  value={newCustomerName}
                  onChange={(event) => setNewCustomerName(event.target.value)}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Telepon</span>
                <input
                  className="field"
                  value={newCustomerPhone}
                  onChange={(event) => setNewCustomerPhone(event.target.value)}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Alamat</span>
                <textarea
                  className="textarea-field"
                  value={newCustomerAddress}
                  onChange={(event) =>
                    setNewCustomerAddress(event.target.value)
                  }
                />
              </label>
              <div className="button-row">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={createCustomer}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setShowCreateCustomer(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="page-width-md page-stack">
        <section className="panel center-card">
          <div className="compact-header">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setStep("order")}
            >
              Kembali
            </button>
            <h1 className="page-heading">Pembayaran</h1>
          </div>
          <div className="info-stack spacer-top">
            <article className="summary-box surface--soft">
              <div className="stat-label">Subtotal Pesanan</div>
              <div
                className="summary-box__value"
                style={{ color: "var(--color-primary)" }}
              >
                {formatCurrency(subtotal)}
              </div>
            </article>
            <article className="summary-box surface--soft">
              <div className="stat-label">Saldo Poin Loyalitas</div>
              <div className="summary-box__value">
                {selectedCustomer?.loyaltyPoints ?? 0} poin
              </div>
            </article>
            <article className="summary-box surface--accent">
              <div className="page-heading" style={{ fontSize: 22 }}>
                Gunakan poin loyalitas?
              </div>
              <p className="card-subtitle">
                Poin pelanggan akan langsung mengurangi total pembayaran.
              </p>
              <div className="button-row spacer-top">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setUsePoints(true)}
                >
                  Ya, Gunakan Poin
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setUsePoints(false)}
                >
                  Tidak
                </button>
              </div>
            </article>
            <article className="summary-box surface--dark">
              <div
                className="stat-label"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Harga Setelah Potongan Poin
              </div>
              <div className="summary-box__value">
                {formatCurrency(finalTotal)}
              </div>
              <div className="summary-box__subvalue">
                Poin digunakan: {pointsUsed}
              </div>
            </article>
            <article className="summary-box surface--soft">
              <div className="stat-label">
                Poin Didapatkan dari Transaksi Ini (1%)
              </div>
              <div className="small-value">+{pointsEarned} poin</div>
            </article>
            <label className="field-group">
              <span className="field-label">Metode Pembayaran</span>
              <select
                className="select-field"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod)
                }
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer QRIS</option>
              </select>
            </label>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={completeTransaction}
            >
              Print Struk
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "receipt" && completedSale) {
    return (
      <div className="page-width-md page-stack">
        <section className="panel center-card">
          <h1 className="page-heading">Transaksi Selesai</h1>
          <div className="info-stack spacer-top">
            <article className="summary-box surface--soft">
              <div className="stat-label">No. Struk</div>
              <div className="summary-box__value">
                {completedSale.receiptNumber}
              </div>
            </article>
            <div className="result-grid">
              <article className="summary-box surface--soft">
                <div className="stat-label">Total</div>
                <div
                  className="small-value"
                  style={{ color: "var(--color-primary)" }}
                >
                  {formatCurrency(completedSale.total)}
                </div>
              </article>
              <article className="summary-box surface--soft">
                <div className="stat-label">Item</div>
                <div className="small-value">{completedSale.items.length}</div>
              </article>
            </div>
            {completedSale.pointsUsed > 0 ? (
              <article className="summary-box surface--accent">
                <div
                  className="stat-label"
                  style={{ color: "var(--color-primary)" }}
                >
                  Poin Digunakan
                </div>
                <div
                  className="small-value"
                  style={{ color: "var(--color-primary)" }}
                >
                  -{completedSale.pointsUsed} poin
                </div>
              </article>
            ) : null}
            <article className="summary-box surface--soft">
              <div className="stat-label">Poin Didapatkan (1% dari total)</div>
              <div className="small-value">
                +{completedSale.pointsEarned} poin
              </div>
            </article>
            <section className="receipt-list">
              <div className="receipt-list__head">Ringkasan Struk</div>
              <div className="receipt-list__body">
                {completedSale.items.map((item) => (
                  <article
                    className="receipt-item"
                    key={`${item.productId}-${item.productName}`}
                  >
                    <div>
                      <h3 className="receipt-item__title">
                        {item.productName}
                      </h3>
                      <div className="receipt-item__meta">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </article>
                ))}
              </div>
            </section>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={handlePrintReceipt}
            >
              Cetak Struk
            </button>
            <div className="two-col">
              <button
                type="button"
                className="button button--secondary button--full"
                onClick={resetTransaction}
              >
                Bagikan ke WhatsApp
              </button>
              <button
                type="button"
                className="button button--ghost button--full"
                onClick={resetTransaction}
              >
                Salin Teks Struk
              </button>
            </div>
            <article className="notice notice--success">
              {receiptMessage}
            </article>
            {printStatus ? (
              <article className="notice notice--success">
                {printStatus}
              </article>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="layout-split">
      <section className="panel catalog-shell">
        <div className="hero-panel">
          <div className="hero-grid">
            <div className="hero-search-card">
              <div className="hero-search-label">Cari produk</div>
              <div className="search-input">
                <span className="search-input__icon">
                  <SearchIcon />
                </span>
                <input
                  className="field"
                  type="text"
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Cari produk..."
                  autoComplete="off"
                />
              </div>
              {selectedCustomer ? (
                <p className="card-subtitle">
                  Pelanggan: {selectedCustomer.name} ·{" "}
                  {selectedCustomer.loyaltyPoints} poin
                </p>
              ) : (
                <p className="card-subtitle">
                  Pelanggan umum · tanpa poin loyalitas
                </p>
              )}
            </div>
            <div className="stats-pair stats-pair--single">
              <article className="metric-tile metric-tile--dark">
                <div className="metric-kicker">Keranjang</div>
                <div className="metric-number">{cartCount}</div>
              </article>
            </div>
          </div>
          <div className="chip-row spacer-top">
            <button
              type="button"
              className={`chip${activeCategoryId === "all" ? " is-active" : ""}`}
              onClick={() => setActiveCategoryId("all")}
            >
              Semua ({products.length})
            </button>
            {categoryTabs.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`chip${activeCategoryId === category.id ? " is-active" : ""}`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
        <div className="catalog-body">
          <div
            className={
              sidebarCollapsed
                ? "product-grid product-grid--wide"
                : "product-grid"
            }
          >
            {filteredProducts.length ? (
              filteredProducts.map((product) => {
                const category = categories.find(
                  (entry) => entry.id === product.categoryId,
                );
                return (
                  <button
                    key={product.id}
                    type="button"
                    className="product-card"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock <= 0}
                  >
                    <div className="product-card__top">
                      <h3 className="product-card__title">{product.name}</h3>
                      <span className="pill">{product.stock}</span>
                    </div>
                    <div className="product-card__category">
                      {category?.name ?? "-"}
                    </div>
                    <div className="product-card__price">
                      {formatCurrency(product.retailPrice)}
                    </div>
                  </button>
                );
              })
            ) : (
              <article className="empty-state">
                <h3 className="empty-state__title">Produk tidak ditemukan</h3>
                <p className="empty-state__copy">
                  Coba pindah ke tab kategori lain atau kosongkan pencarian agar
                  semua produk yang sudah di-upload terlihat.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>
      <aside className="panel checkout-panel">
        <div className="checkout-panel__header">
          <div>
            <p className="eyebrow">Checkout</p>
            <h2 className="card-title" style={{ fontSize: 30 }}>
              Pesanan
            </h2>
            <input
              className="field owner-id-input"
              type="password"
              placeholder="Owner ID"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              style={{ borderColor: ownerId && ownerId !== "sumberkasih" ? "#dc2626" : undefined }}
            />
          </div>
          <button
            type="button"
            className={`button button--ghost${ownerId !== "sumberkasih" ? " button--disabled-orange" : ""}`}
            onClick={clearCart}
            disabled={ownerId !== "sumberkasih"}
          >
            Kosongkan
          </button>
        </div>
        <div className="checkout-panel__body">
          {cartItems.length ? (
            cartItems.map((item) => (
              <article className="cart-row" key={item.product.id}>
                <div className="cart-row__top">
                  <div>
                    <h3 className="cart-row__title">{item.product.name}</h3>
                    <div className="cart-row__meta">Retail</div>
                  </div>
                  <button
                    type="button"
                    className={`button button--ghost${ownerId !== "sumberkasih" ? " button--disabled-orange" : ""}`}
                    onClick={() => updateQuantity(item.product.id, 0)}
                    disabled={ownerId !== "sumberkasih"}
                  >
                    Hapus
                  </button>
                </div>
                <div className="cart-row__bottom">
                  <strong>{formatCurrency(item.subtotal)}</strong>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className={`qty-stepper__button${ownerId !== "sumberkasih" ? " button--disabled-orange" : ""}`}
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      disabled={ownerId !== "sumberkasih"}
                    >
                      -
                    </button>
                    <span className="qty-stepper__value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-stepper__button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.product.stock <= 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3 className="empty-state__title">Belum ada item</h3>
              <p className="empty-state__copy">
                Tambahkan produk dari panel kiri.
              </p>
            </div>
          )}
        </div>
        <div className="checkout-panel__footer">
          <div className="summary-box surface--dark">
            <div className="summary-box__top">
              <span>Total</span>
              <span>{cartCount} item</span>
            </div>
            <div className="summary-box__value">{formatCurrency(subtotal)}</div>
          </div>
          <div className="spacer-top">
            <button
              type="button"
              className="button button--primary button--full"
              onClick={() => setStep("payment")}
              disabled={!cartItems.length}
            >
              Proses Pesanan
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ProductsRoute() {
  const [tab, setTab] = useState<ProductTab>("categories");
  const pageClass =
    tab === "import"
      ? "products-import-page"
      : tab === "stock"
        ? "products-stock-page"
        : "products-categories-page";

  return (
    <ProtectedPage title="Produk" pageClass={pageClass}>
      <ProductsPage tab={tab} setTab={setTab} />
    </ProtectedPage>
  );
}

function ProductsPage({
  tab,
  setTab,
}: {
  tab: ProductTab;
  setTab: (tab: ProductTab) => void;
}) {
  const { categories, setCategories, products, setProducts } = useAppModel();
  const [importMessage, setImportMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [categoryName, setCategoryName] = useState("SNACK");
  const [categoryDescription, setCategoryDescription] = useState(
    "Biskuit, keripik, wafer, dan pelengkap kasir cepat.",
  );
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [adjustingProductId, setAdjustingProductId] = useState<string | null>(
    null,
  );
  const [adjustQuantity, setAdjustQuantity] = useState("12");
  const [adjustNotice, setAdjustNotice] = useState("Restok mingguan");
  const [notice, setNotice] = useState("");
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function importProductsFile(file: File) {
    try {
      const rows = await parseImportFile(file);
      if (!rows.length) {
        setImportMessage("File tidak berisi data produk baru.");
        return;
      }

      const existingCategories = new Map<string, string>(
        categories.map((category) => [
          category.name.toLowerCase(),
          category.id,
        ]),
      );
      const newCategories: Category[] = [];
      const additions: Product[] = rows.map((row, index) => {
        const categoryKey = row.category.toLowerCase();
        let categoryId: string | undefined =
          existingCategories.get(categoryKey);
        if (!categoryId) {
          categoryId = makeId("cat");
          existingCategories.set(categoryKey, categoryId);
          newCategories.push({
            id: categoryId,
            name: row.category.toUpperCase(),
            description: file.name.toLowerCase().endsWith(".csv")
              ? "Hasil import CSV."
              : "Hasil import spreadsheet.",
          });
        }
        return {
          id: row.id || makeId(`prd${index}`),
          sku: slugify(row.name),
          name: row.name,
          categoryId,
          netPrice: row.netPrice ? Math.round(row.netPrice) : undefined,
          wholesalePrice: row.wholesalePrice
            ? Math.round(row.wholesalePrice)
            : undefined,
          retailPrice: Math.round(row.retailPrice),
          stock: DEFAULT_PRODUCT_STOCK,
          lowStockThreshold: getRestockThreshold(DEFAULT_PRODUCT_STOCK),
        };
      });

      if (newCategories.length) {
        setCategories((current) => [...current, ...newCategories]);
      }
      setProducts((current) => [...additions, ...current]);
      setImportMessage(
        `${additions.length} produk berhasil ditambahkan dari ${file.name}.`,
      );
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : "Import file gagal diproses.",
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    void importProductsFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    void importProductsFile(file);
  }

  function saveCategory() {
    if (!categoryName.trim()) return;
    if (editingCategoryId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategoryId
            ? {
                ...category,
                name: categoryName.trim().toUpperCase(),
                description: categoryDescription.trim(),
              }
            : category,
        ),
      );
      setNotice("Kategori berhasil diperbarui.");
    } else {
      setCategories((current) => [
        ...current,
        {
          id: makeId("cat"),
          name: categoryName.trim().toUpperCase(),
          description: categoryDescription.trim(),
        },
      ]);
      setNotice("Kategori baru siap dipakai pada produk.");
    }
    setEditingCategoryId(null);
  }

  function startEdit(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setTab("categories");
  }

  function applyStockAdjustment() {
    if (!adjustingProductId) return;
    const delta = Number.parseInt(adjustQuantity, 10);
    if (Number.isNaN(delta)) return;
    setProducts((current) =>
      current.map((product) =>
        product.id === adjustingProductId
          ? { ...product, stock: product.stock + delta }
          : product,
      ),
    );
    setNotice(`Stok diperbarui: ${adjustNotice}.`);
    setAdjustingProductId(null);
  }

  function updateProduct(productId: string, updates: Partial<Product>) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, ...updates } : product,
      ),
    );
  }

  function parseEditableNumber(value: string) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
  }

  function parseOptionalEditableNumber(value: string) {
    if (!value.trim()) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : undefined;
  }

  return (
    <div className="page-stack">
      <div className="tab-row">
        <button
          type="button"
          className={`tab${tab === "import" ? " is-active" : ""}`}
          onClick={() => setTab("import")}
        >
          Import Produk
        </button>
        <button
          type="button"
          className={`tab${tab === "categories" ? " is-active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Kategori
        </button>
        <button
          type="button"
          className={`tab${tab === "stock" ? " is-active" : ""}`}
          onClick={() => setTab("stock")}
        >
          Stok
        </button>
      </div>

      {tab === "import" ? (
        <section className="panel">
          <h1 className="page-heading">Import Produk</h1>
          <p className="section-subtitle">
            Upload file CSV atau Excel untuk menambahkan produk secara massal.
          </p>
          <label
            className={`import-dropzone spacer-top${isDragActive ? " is-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
            />
            <span className="import-dropzone__eyebrow">Drag & Drop</span>
            <span className="import-dropzone__title">
              Tarik file `.csv` atau `.xlsx` ke sini
            </span>
            <span className="import-dropzone__copy">
              Atau klik area ini untuk pilih file dari komputer. Template utama:
              `Name`, `Kriteria`, `Net Price`, `Grosir Price`, `Eceran Price`.
            </span>
            <span className="button button--primary">Choose File</span>
          </label>
          <div className="spacer-top cluster">
            <span className="muted-text">
              {importMessage || "Belum ada file dipilih."}
            </span>
          </div>
          <p className="helper-copy spacer-top">
            Format utama: `Name`, `Kriteria`, `Eceran Price`. Kolom `Net Price`
            dan `Grosir Price` juga didukung. Format lama `id`, `name`,
            `category`, `harga` tetap bisa dipakai.
          </p>
          <div className="product-list-heading spacer-top">
            <h2 className="card-title" style={{ fontSize: 28 }}>
              Daftar Produk ({products.length})
            </h2>
            <button
              type="button"
              className={`button ${
                isEditingProducts ? "button--primary" : "button--secondary"
              }`}
              onClick={() => setIsEditingProducts((current) => !current)}
            >
              {isEditingProducts ? "Selesai" : "Edit"}
            </button>
          </div>
          <div className="table-shell spacer-top">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Net Price</th>
                  <th>Grosir Price</th>
                  <th>Harga Retail</th>
                  <th>Stok</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="mono">{product.sku}</td>
                    <td>
                      {isEditingProducts ? (
                        <input
                          className="product-edit-field product-edit-field--name"
                          value={product.name}
                          onChange={(event) =>
                            updateProduct(product.id, {
                              name: event.target.value,
                              sku: slugify(event.target.value),
                            })
                          }
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td>
                      {isEditingProducts ? (
                        <select
                          className="product-edit-field"
                          value={product.categoryId}
                          onChange={(event) =>
                            updateProduct(product.id, {
                              categoryId: event.target.value,
                            })
                          }
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        (categories.find(
                          (category) => category.id === product.categoryId,
                        )?.name ?? "-")
                      )}
                    </td>
                    <td>
                      {isEditingProducts ? (
                        <input
                          className="product-edit-field product-edit-field--number"
                          type="number"
                          min="0"
                          value={product.netPrice ?? ""}
                          onChange={(event) =>
                            updateProduct(product.id, {
                              netPrice: parseOptionalEditableNumber(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      ) : product.netPrice ? (
                        formatCurrency(product.netPrice)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {isEditingProducts ? (
                        <input
                          className="product-edit-field product-edit-field--number"
                          type="number"
                          min="0"
                          value={product.wholesalePrice ?? ""}
                          onChange={(event) =>
                            updateProduct(product.id, {
                              wholesalePrice: parseOptionalEditableNumber(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      ) : product.wholesalePrice ? (
                        formatCurrency(product.wholesalePrice)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {isEditingProducts ? (
                        <input
                          className="product-edit-field product-edit-field--number"
                          type="number"
                          min="0"
                          value={product.retailPrice}
                          onChange={(event) =>
                            updateProduct(product.id, {
                              retailPrice: parseEditableNumber(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      ) : (
                        formatCurrency(product.retailPrice)
                      )}
                    </td>
                    <td>
                      {isEditingProducts ? (
                        <input
                          className="product-edit-field product-edit-field--stock"
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(event) =>
                            updateProduct(product.id, {
                              stock: parseEditableNumber(event.target.value),
                            })
                          }
                        />
                      ) : (
                        product.stock
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="panel">
          <div className="kpi-inline">
            <div>
              <h1 className="page-heading">Manajemen Kategori</h1>
              <p className="section-subtitle">
                Tambah atau edit kategori produk.
              </p>
            </div>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setEditingCategoryId(null)}
            >
              Tambah Kategori
            </button>
          </div>
          <section
            className="panel surface--soft spacer-top"
            id="category-form"
          >
            <h2 className="card-title" style={{ fontSize: 24 }}>
              {editingCategoryId ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h2>
            <div className="form-stack spacer-top">
              <label className="field-group">
                <span className="field-label">Nama Kategori</span>
                <input
                  className="field"
                  type="text"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Deskripsi</span>
                <textarea
                  className="textarea-field"
                  value={categoryDescription}
                  onChange={(event) =>
                    setCategoryDescription(event.target.value)
                  }
                />
              </label>
              <div className="button-row">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={saveCategory}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setEditingCategoryId(null)}
                >
                  Batal
                </button>
              </div>
            </div>
          </section>
          {notice ? (
            <article className="notice notice--success spacer-top">
              {notice}
            </article>
          ) : null}
          <div className="table-shell spacer-top">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Deskripsi</th>
                  <th>Jumlah Produk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      {
                        products.filter(
                          (product) => product.categoryId === category.id,
                        ).length
                      }
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => startEdit(category)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "stock" ? (
        <section className="panel">
          <h1 className="page-heading">Manajemen Stok</h1>
          <p className="section-subtitle">Lihat dan sesuaikan stok produk.</p>
          <div className="table-shell spacer-top">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama</th>
                  <th>Stok Saat Ini</th>
                  <th>Threshold</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="mono">{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.stock}</td>
                    <td>{product.lowStockThreshold}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => setAdjustingProductId(product.id)}
                      >
                        Sesuaikan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {adjustingProductId ? (
            <section className="panel surface--soft spacer-top">
              <h2 className="card-title" style={{ fontSize: 24 }}>
                Sesuaikan Stok
              </h2>
              <div className="form-stack spacer-top">
                <label className="field-group">
                  <span className="field-label">
                    Jumlah (positif / negatif)
                  </span>
                  <input
                    className="field"
                    value={adjustQuantity}
                    onChange={(event) => setAdjustQuantity(event.target.value)}
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Catatan</span>
                  <input
                    className="field"
                    value={adjustNotice}
                    onChange={(event) => setAdjustNotice(event.target.value)}
                  />
                </label>
                <div className="button-row">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={applyStockAdjustment}
                  >
                    Simpan Stok
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setAdjustingProductId(null)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function RefundsRoute() {
  const [selectedSaleId, setSelectedSaleId] = useState<string>("sale-1049");
  const pageClass = selectedSaleId
    ? "refunds-selected-page"
    : "refunds-empty-page";

  return (
    <ProtectedPage title="Refund" pageClass={pageClass}>
      <RefundsPage
        selectedSaleId={selectedSaleId}
        setSelectedSaleId={setSelectedSaleId}
      />
    </ProtectedPage>
  );
}

function RefundsPage({
  selectedSaleId,
  setSelectedSaleId,
}: {
  selectedSaleId: string | null;
  setSelectedSaleId: (value: string | null) => void;
}) {
  const {
    sales,
    setSales,
    products,
    setProducts,
    refunds,
    setRefunds,
    addToast,
  } = useAppModel();
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("Keluhan pelanggan");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [ownerId, setOwnerId] = useState("");
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = [...new Set(salesSeedData.map((s) => s.createdAt.slice(0, 7)))].sort();
    return months[months.length - 1] || "2026-01";
  });
  const availableMonths = [...new Set(salesSeedData.map((s) => s.createdAt.slice(0, 7)))].sort();
  const monthLabel = (ym: string) => {
    const [y, m] = ym.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const refundableSales = salesSeedData
    .filter((s) => {
      if (s.createdAt.slice(0, 7) !== selectedMonth) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return s.receiptNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q);
    })
    .map((sale) => ({ ...sale, refundable: isWithinRefundWindow(sale.createdAt) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const selectedSale =
    sales.find((sale) => sale.id === selectedSaleId) ??
    salesSeedData.find((sale) => sale.id === selectedSaleId) ??
    null;
  const selectedSaleRefundable =
    selectedSale && isWithinRefundWindow(selectedSale.createdAt);

  function processRefund() {
    if (!selectedSale) return;
    const refundItems = selectedSale.items.filter(
      (item) => (quantities[item.productId] ?? 0) > 0,
    );
    if (!refundItems.length) return;
    const total = refundItems.reduce(
      (sum, item) => sum + item.unitPrice * (quantities[item.productId] ?? 0),
      0,
    );
    setProducts((current) =>
      current.map((product) => {
        const quantity = quantities[product.id] ?? 0;
        return quantity > 0
          ? { ...product, stock: Math.max(product.stock - quantity, 0) }
          : product;
      }),
    );
    setSales((current) =>
      current.map((sale) => {
        if (sale.id !== selectedSale.id) return sale;
        const updatedItems = sale.items.map((item) => {
          const refundQty = quantities[item.productId] ?? 0;
          if (refundQty <= 0) return item;
          const newQty = item.quantity - refundQty;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty > 0 ? item.unitPrice * newQty : 0,
          };
        });
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        );
        return { ...sale, items: updatedItems, total: newTotal };
      }),
    );
    setQuantities({});
    const refundItemList: RefundItem[] = refundItems.map((item) => {
      const qty = quantities[item.productId] ?? 0;
      return {
        productName: item.productName,
        quantity: qty,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * qty,
      };
    });
    const newRefund: RefundRecord = {
      id: makeId("refund"),
      saleId: selectedSale.id,
      saleReceiptNumber: selectedSale.receiptNumber,
      customerName: selectedSale.customerName,
      reason,
      total,
      items: refundItemList,
      createdAt: new Date().toISOString(),
    };
    setRefunds((current) => [newRefund, ...current]);
    addToast(
      `Refund berhasil - pengembalian dana telah diproses.\nRefund terakhir: ${newRefund.saleReceiptNumber} - ${formatCurrency(newRefund.total)}`,
    );
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <h1 className="page-heading">Pencarian Refund</h1>
        <p className="section-subtitle">
          Pilih bulan, cari struk atau pelanggan. Refund dibatasi 3 hari sejak transaksi.
        </p>
        <label className="field-group spacer-top">
          <span className="field-label">Bulan</span>
          <select
            className="field"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {availableMonths.map((ym) => (
              <option key={ym} value={ym}>
                {monthLabel(ym)}
              </option>
            ))}
          </select>
        </label>
        <label className="field-group spacer-top">
          <span className="field-label">Cari Struk / Pelanggan</span>
          <input
            className="field"
            type="text"
            value={search}
            placeholder="Ketik nomor struk atau nama..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="table-shell spacer-top">
          <table className="data-table">
            <thead>
              <tr>
                <th>Struk</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Waktu</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {refundableSales.length > 0 ? (
                refundableSales.map((sale) => (
                  <Fragment key={sale.id}>
                    <tr
                      className="history-row"
                      onClick={() =>
                        setExpandedSaleId(
                          expandedSaleId === sale.id ? null : sale.id,
                        )
                      }
                    >
                      <td>{sale.receiptNumber}</td>
                      <td>{sale.customerName}</td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{formatShortDate(sale.createdAt)}</td>
                      <td>
                        {expandedSaleId === sale.id ? "▲" : "▼"}
                      </td>
                    </tr>
                    {expandedSaleId === sale.id ? (
                      <tr className="history-detail">
                        <td colSpan={5}>
                          <div className="history-detail__inner">
                            {sale.items.map((item, i) => (
                              <div key={i} className="history-detail__item">
                                <span className="history-detail__name">
                                  {item.productName}
                                </span>
                                <span className="history-detail__qty">
                                  ×{item.quantity}
                                </span>
                                <span className="history-detail__price">
                                  {formatCurrency(item.subtotal)}
                                </span>
                              </div>
                            ))}
                            <div className="history-detail__footer">
                              <span className="history-detail__footer-label">
                                {sale.paymentMethod === "cash" ? "Tunai" : "Transfer QRIS"} &middot; Total: {formatCurrency(sale.total)}
                              </span>
                              <button
                                type="button"
                                className={`button button--sm${sale.refundable ? " button--primary" : " button--disabled-orange"}`}
                                onClick={() => sale.refundable && setSelectedSaleId(sale.id)}
                                disabled={!sale.refundable}
                                title={sale.refundable ? "Pilih untuk refund" : "Melebihi batas 3 hari"}
                              >
                                {sale.refundable ? "Pilih untuk Refund" : "Kadaluwarsa"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <h3 className="empty-state__title">
                        Tidak ada transaksi
                      </h3>
                      <p className="empty-state__copy">
                        Tidak ditemukan transaksi pada bulan yang dipilih.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {refundableSales.length > 0 ? (
          <p className="card-copy spacer-top" style={{ color: "var(--color-muted)", fontSize: 13 }}>
            Menampilkan {refundableSales.length} transaksi
          </p>
        ) : null}
      </section>
      <section className="panel">
        <h2 className="card-title" style={{ fontSize: 30 }}>
          {selectedSale
            ? `${selectedSale.receiptNumber} - ${selectedSale.customerName}`
            : "Form Refund"}
        </h2>
        <p className="section-subtitle">
          Pilih kuantitas per item lalu kirim sebagai satu catatan refund.
        </p>
        {selectedSale ? (
          <>
            {!selectedSaleRefundable ? (
              <article className="notice notice--error spacer-top">
                Struk ini sudah melewati batas refund 3 hari.
              </article>
            ) : null}
            <div className="table-shell spacer-top">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty Terjual</th>
                    <th>Qty Refund</th>
                    <th>Harga Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <div className="qty-stepper">
                          <button
                            type="button"
                            className="qty-stepper__button"
                            onClick={() =>
                              setQuantities((current) => ({
                                ...current,
                                [item.productId]: Math.max(
                                  (current[item.productId] ?? 0) - 1,
                                  0,
                                ),
                              }))
                            }
                          >
                            -
                          </button>
                          <span className="qty-stepper__value">
                            {quantities[item.productId] ?? 0}
                          </span>
                          <button
                            type="button"
                            className="qty-stepper__button"
                            onClick={() =>
                              setQuantities((current) => ({
                                ...current,
                                [item.productId]: Math.min(
                                  (current[item.productId] ?? 0) + 1,
                                  item.quantity,
                                ),
                              }))
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-stack spacer-top">
              <label className="field-group">
                <span className="field-label">Alasan Refund</span>
                <textarea
                  className="textarea-field"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Owner ID</span>
                <input
                  className="field"
                  type="password"
                  placeholder="Owner ID"
                  value={ownerId}
                  onChange={(event) => setOwnerId(event.target.value)}
                  style={{
                    borderColor:
                      ownerId && ownerId !== "sumberkasih"
                        ? "#dc2626"
                        : undefined,
                  }}
                />
              </label>
              <button
                type="button"
                className={`button button--primary${ownerId !== "sumberkasih" || !selectedSaleRefundable ? " button--disabled-orange" : ""}`}
                onClick={processRefund}
                disabled={ownerId !== "sumberkasih" || !selectedSaleRefundable}
              >
                Proses Refund
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state spacer-top">
            <h3 className="empty-state__title">Pilih transaksi lebih dulu</h3>
            <p className="empty-state__copy">
              Form refund akan aktif setelah sale dipilih.
            </p>
          </div>
        )}
      </section>
      <section className="panel">
        <h2 className="card-title" style={{ fontSize: 30 }}>
          Riwayat Refund
        </h2>
        <p className="section-subtitle">
          Daftar refund yang berhasil diproses.
        </p>
        {refunds.length ? (
          <div className="table-shell spacer-top">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Struk</th>
                  <th>Pelanggan</th>
                  <th>Item</th>
                  <th>Alasan</th>
                  <th>Total</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id}>
                    <td>{refund.saleReceiptNumber}</td>
                    <td>{refund.customerName}</td>
                    <td>
                      {refund.items?.map((item, i) => (
                        <div key={i} className="refund-item-line">
                          <span className="refund-item-line__name">{item.productName}</span>
                          <span className="refund-item-line__qty">×{item.quantity}</span>
                          <span className="refund-item-line__price">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </td>
                    <td>{refund.reason}</td>
                    <td>{formatCurrency(refund.total)}</td>
                    <td>{formatShortDate(refund.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state spacer-top">
            <h3 className="empty-state__title">Belum ada refund</h3>
            <p className="empty-state__copy">
              Refund yang berhasil diproses akan muncul di sini.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ReportsRoute() {
  const { session } = useAppModel();
  const [generated, setGenerated] = useState(false);

  if (session?.role === "employee") {
    return <Navigate to="/transactions" replace />;
  }

  return (
    <ProtectedPage
      title="Laporan"
      pageClass={generated ? "reports-generated-page" : "reports-default-page"}
    >
      <ReportsPage generated={generated} setGenerated={setGenerated} />
    </ProtectedPage>
  );
}

function ReportsPage({
  generated,
  setGenerated,
}: {
  generated: boolean;
  setGenerated: (value: boolean) => void;
}) {
  const { sales, refunds, products, reports, setReports } = useAppModel();
  const [periodStart, setPeriodStart] = useState("2026-01-01");
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [periodError, setPeriodError] = useState("");
  const [forecastGenerated, setForecastGenerated] = useState(false);
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastProgress, setForecastProgress] = useState(0);
  const [aiApiKey, setAiApiKey] = useState("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");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");

  const salesTotal = sales.reduce((total, sale) => total + sale.total, 0);
  const refundTotal = refunds.reduce(
    (total, refund) => total + refund.total,
    0,
  );
  const netRevenue = Math.max(salesTotal - refundTotal, 0);
  const averageTransactionValue = sales.length
    ? Math.round(salesTotal / sales.length)
    : 0;
  const productCostById = new Map<string, number>(
    products.map((product) => [product.id, product.netPrice ?? 0]),
  );
  const estimatedGrossProfit = sales.reduce(
    (total, sale) =>
      total +
      sale.items.reduce((sum, item) => {
        const netPrice = productCostById.get(item.productId) ?? 0;
        return sum + Math.max(item.unitPrice - netPrice, 0) * item.quantity;
      }, 0),
    0,
  );
  const stockMovement = sales.reduce(
    (total, sale) =>
      total + sale.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  const topProductCounts: Record<string, number> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      topProductCounts[item.productName] =
        (topProductCounts[item.productName] ?? 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(topProductCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);
  const topProduct = topProducts[0]?.[0] ?? "SEDAAP MIE GR 91GR (40)";
  const forecastRows = products
    .map((product) => {
      const quantity = topProductCounts[product.name] ?? 0;
      const stock = product.stock;
      const restockThreshold = product.lowStockThreshold;
      const warningThreshold = Math.ceil(restockThreshold * 1.5);
      const status =
        stock <= restockThreshold
          ? "Restock"
          : stock <= warningThreshold
            ? "Perlu Dipantau"
            : "Aman";
      const statusTone =
        stock <= restockThreshold
          ? "danger"
          : stock <= warningThreshold
            ? "warning"
            : "success";
      const suggestedRestock =
        stock <= restockThreshold
          ? Math.max(DEFAULT_PRODUCT_STOCK - stock, Math.ceil(quantity * 2.5))
          : 0;

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        stock,
        restockThreshold,
        status,
        statusTone,
        suggestedRestock,
        meterValue: Math.min(
          Math.round((stock / DEFAULT_PRODUCT_STOCK) * 100),
          100,
        ),
      };
    })
    .sort((left, right) => {
      const priority = { danger: 0, warning: 1, success: 2 };
      return (
        priority[left.statusTone] - priority[right.statusTone] ||
        left.stock - right.stock ||
        right.quantity - left.quantity
      );
    });

  const currentSalesAI = sales.filter(
    (s) => s.createdAt >= periodStart && s.createdAt <= periodEnd + "T23:59:59",
  );
  const startDate = new Date(periodStart + "T00:00:00");
  const endDate = new Date(periodEnd + "T00:00:00");
  const periodDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  const prevEnd = new Date(startDate.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - (periodDays - 1) * 86400000);
  const prevStartStr = prevStart.toISOString().slice(0, 10);
  const prevEndStr = prevEnd.toISOString().slice(0, 10);

  const prevSalesAI = sales.filter(
    (s) => s.createdAt >= prevStartStr && s.createdAt <= prevEndStr + "T23:59:59",
  );

  const currentCounts: Record<string, number> = {};
  currentSalesAI.forEach((s) => {
    s.items.forEach((item) => {
      currentCounts[item.productName] = (currentCounts[item.productName] || 0) + item.quantity;
    });
  });

  const prevCounts: Record<string, number> = {};
  prevSalesAI.forEach((s) => {
    s.items.forEach((item) => {
      prevCounts[item.productName] = (prevCounts[item.productName] || 0) + item.quantity;
    });
  });

  const productChanges = Object.entries(currentCounts)
    .map(([name, qty]) => {
      const prevQty = prevCounts[name] || 0;
      const change = prevQty ? ((qty - prevQty) / prevQty * 100) : 100;
      return { name, currentQty: qty, prevQty, change: Math.round(change * 10) / 10 };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const pairCounts: Record<string, number> = {};
  currentSalesAI.forEach((s) => {
    const names = s.items.map((item) => item.productName);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const key = [names[i], names[j]].sort().join(" ||| ");
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
    }
  });
  const topPairs = Object.entries(pairCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const hourCounts: Record<number, number> = {};
  currentSalesAI.forEach((s) => {
    const hour = new Date(s.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);

  const dayCounts: Record<string, number> = {};
  currentSalesAI.forEach((s) => {
    const day = new Date(s.createdAt).toLocaleDateString("id-ID", { weekday: "long" });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);

  const currentRevenue = currentSalesAI.reduce((sum, s) => sum + s.total, 0);
  const prevRevenue = prevSalesAI.reduce((sum, s) => sum + s.total, 0);

  const isPeriodValid = Boolean(
    periodStart && periodEnd && periodStart <= periodEnd,
  );

  function generateReport() {
    if (!periodStart || !periodEnd) {
      setPeriodError(
        "Pilih tanggal mulai dan tanggal selesai terlebih dahulu.",
      );
      return;
    }

    if (periodStart > periodEnd) {
      setPeriodError(
        "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.",
      );
      return;
    }

    setPeriodError("");
    setIsGenerating(true);
    setReportProgress(0);
    const interval = window.setInterval(() => {
      setReportProgress((prev) => {
        const next = prev + Math.random() * 15 + 2;
        if (next >= 100) {
          window.clearInterval(interval);
          setIsGenerating(false);
          setGenerated(true);
          const maxRptNum = reports.reduce((max, r) => {
            const num = parseInt(r.id.replace("RPT-", ""), 10);
            return isNaN(num) ? max : Math.max(max, num);
          }, 0);
          setReports((current) => [
            {
              id: `RPT-${String(maxRptNum + 1).padStart(4, "0")}`,
              createdAt: new Date().toISOString(),
              periodStart,
              periodEnd,
              salesTotal,
              refundTotal,
              topProduct,
            },
            ...current,
          ]);
          return 100;
        }
        return next;
      });
    }, 200);
  }

  useEffect(() => {
    if (forecastGenerated && !isForecasting && !isAiAnalyzing && !aiAnalysis && !aiError && aiApiKey) {
      analyzeSalesWithAI();
    }
  }, [forecastGenerated, isForecasting]);

  async function analyzeSalesWithAI() {
    if (!aiApiKey) return;
    setIsAiAnalyzing(true);
    setAiError("");

    try {
      const systemPrompt = `Anda adalah asisten yang menjawab dengan SANGAT SINGKAT dan TEPAT.

Outputkan 3 baris persis seperti template berikut, jangan tambahkan apapun:
Baris 1: Produk yang penjualannya naik dari periode sebelumnya : <strong>{top3_produk_dengan_persen}</strong> (cukup 3 produk dengan kenaikan tertinggi, format: "ProdukA (+XX%), ProdukB (+YY%), ProdukC (+ZZ%)")
Baris 2: Produk yang sering dibeli barengan : <strong>{pasangan_produk}</strong> (cukup max 3 pasangan, format "A + B, C + D, E + F")
Baris 3: Jam tersibuk toko : <strong>Pukul {jam_mulai} hingga {jam_selesai}</strong>, hari <strong>{hari_ramai}</strong> (rentang 2 jam sebagai peak hours, format 24 jam)

Gunakan format 24 jam (01:00 bukan 1:00).
Gunakan <strong> tag HTML untuk membuat teks setelah tanda titik dua (:) menjadi tebal.
JANGAN memberikan penjelasan tambahan, JANGAN menggunakan markdown. Hanya 3 baris itu.`;

      const userData = {
        periode: `${periodStart} hingga ${periodEnd}`,
        periodeSebelumnya: `${prevStartStr} hingga ${prevEndStr}`,
        totalTransaksiPeriodeIni: currentSalesAI.length,
        totalTransaksiPeriodeSebelumnya: prevSalesAI.length,
        totalPendapatanPeriodeIni: currentRevenue,
        totalPendapatanPeriodeSebelumnya: prevRevenue,
        perubahanProduk: productChanges.map(
          (p) => `${p.name}: ${p.change >= 0 ? "+" : ""}${p.change}% (${p.prevQty} → ${p.currentQty})`,
        ),
        produkBersamaan: topPairs.map(
          ([pair, count]) => `${pair.split(" ||| ").join(" + ")} (${count}x)`,
        ),
        jamOperasional: sortedHours.map(
          ([hour, count]) => `${hour}:00 = ${count} transaksi`,
        ),
        hariOperasional: sortedDays.map(
          ([day, count]) => `${day}: ${count} transaksi`,
        ),
      };

      await callOpenRouterStream(
        aiApiKey,
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userData, null, 2) },
        ],
        (text) => {
          const lines = text.split("\n").filter(
            (l) => l.startsWith("Produk yang penjualannya naik") || l.startsWith("Produk yang sering dibeli barengan") || l.startsWith("Jam tersibuk toko"),
          );
          setAiAnalysis(lines.join("\n"));
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menganalisis data penjualan.";
      setAiError(message);
    } finally {
      setIsAiAnalyzing(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <h1 className="page-heading">Kontrol Periode</h1>
        <p className="section-subtitle">
          Buat snapshot laporan atau perkiraan dari rentang waktu yang dipilih.
        </p>
        <div className="four-col spacer-top">
          <label className="field-group">
            <span className="field-label">Tanggal mulai</span>
            <input
              className="field"
              type="date"
              value={periodStart}
              max={periodEnd}
              required
              onChange={(event) => {
                setPeriodStart(event.target.value);
                setPeriodError("");
              }}
            />
          </label>
          <label className="field-group">
            <span className="field-label">Tanggal selesai</span>
            <input
              className="field"
              type="date"
              value={periodEnd}
              min={periodStart}
              required
              onChange={(event) => {
                setPeriodEnd(event.target.value);
                setPeriodError("");
              }}
            />
          </label>
          <div className="field-group report-button-group">
            <span className="field-label">&nbsp;</span>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={generateReport}
              disabled={isGenerating}
              aria-disabled={!isPeriodValid || isGenerating}
            >
              {isGenerating ? "Memproses..." : "Generate Laporan Bulanan"}
            </button>
            {isGenerating ? (
              <div className="forecast-progress-wrapper spacer-top">
                <div className="forecast-progress-bar">
                  <div
                    className="forecast-progress-bar__fill"
                    style={{ width: `${reportProgress}%` }}
                  />
                </div>
                <div className="forecast-progress-label">
                  Generating Laporan Bulanan... {Math.round(reportProgress)}%
                </div>
              </div>
            ) : null}
          </div>
          <div className="field-group forecast-button-group">
            <span className="field-label">&nbsp;</span>
            <button
              type="button"
              className="button button--forecast button--full"
              onClick={() => {
                if (isForecasting) return;
                setIsForecasting(true);
                setForecastProgress(0);
                setAiAnalysis("");
                setAiError("");
                setIsAiAnalyzing(false);
                const interval = window.setInterval(() => {
                  setForecastProgress((prev) => {
                    const next = prev + Math.random() * 15 + 2;
                    if (next >= 100) {
                      window.clearInterval(interval);
                      setIsForecasting(false);
                      setForecastGenerated(true);
                      return 100;
                    }
                    return next;
                  });
                }, 200);
              }}
              disabled={isForecasting}
            >
              {isForecasting
                ? "Memproses..."
                : "Generate Forecast"}
            </button>
            {isForecasting ? (
              <div className="forecast-progress-wrapper spacer-top">
                <div className="forecast-progress-bar">
                  <div
                    className="forecast-progress-bar__fill"
                    style={{ width: `${forecastProgress}%` }}
                  />
                </div>
                <div className="forecast-progress-label">
                  Generating Forecast... {Math.round(forecastProgress)}%
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {periodError ? (
          <article className="notice notice--error spacer-top">
            {periodError}
          </article>
        ) : null}
      </section>
      {generated ? (
        <>
      <section className="stat-grid">
        <article className="stat-card surface--accent">
          <div className="stat-label">Total Penjualan</div>
          <div className="stat-value">{formatCurrency(salesTotal)}</div>
        </article>
        <article className="stat-card surface">
          <div className="stat-label">Total Refund</div>
          <div className="stat-value">{formatCurrency(refundTotal)}</div>
        </article>
        <article className="stat-card surface">
          <div className="stat-label">Jumlah Transaksi</div>
          <div className="stat-value">{sales.length}</div>
        </article>
        <article className="stat-card surface">
          <div className="stat-label">Pergerakan Stok</div>
          <div className="stat-value">{stockMovement}</div>
        </article>
      </section>
      <section className="stat-grid stat-grid--three">
        <article className="stat-card surface">
          <div className="stat-label">Omzet Bersih</div>
          <div className="stat-value">{formatCurrency(netRevenue)}</div>
        </article>
        <article className="stat-card surface--accent">
          <div className="stat-label">Rata-rata Belanja</div>
          <div className="stat-value">
            {formatCurrency(averageTransactionValue)}
          </div>
        </article>
        <article className="stat-card surface">
          <div className="stat-label">Estimasi Laba Kotor</div>
          <div className="stat-value">
            {formatCurrency(estimatedGrossProfit)}
          </div>
        </article>
      </section>
        </>
      ) : null}
      {generated ? (
        <section className="panel surface--accent">
          <h2 className="card-title" style={{ fontSize: 28 }}>
            Laporan Berhasil Dibuat
          </h2>
          <div className="spacer-top">
            <article className="summary-box surface">
              <div className="stat-label">Periode</div>
              <div className="card-copy">
                {periodStart} s/d {periodEnd}
              </div>
            </article>
          </div>
          <div className="spacer-top">
            <button
              type="button"
              className="button button--primary"
              onClick={() => setGenerated(false)}
            >
              Simpan Laporan
            </button>
          </div>
        </section>
      ) : null}
      <section className="panel">
        <h2 className="card-title" style={{ fontSize: 28 }}>
          Snapshot Laporan Tersimpan
        </h2>
        <div className="table-shell spacer-top">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dibuat</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Penjualan</th>
                <th>Refund</th>
                <th>Produk Terlaris</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{formatShortDate(report.createdAt)}</td>
                  <td>{report.periodStart}</td>
                  <td>{report.periodEnd}</td>
                  <td>{formatCurrency(report.salesTotal)}</td>
                  <td>{formatCurrency(report.refundTotal)}</td>
                  <td>{report.topProduct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {forecastGenerated ? (
        <>
        <section className="panel surface--accent">
          <h2 className="card-title" style={{ fontSize: 28 }}>
            AI Analisis Penjualan
          </h2>
          <div className="spacer-top">
            {isAiAnalyzing ? (
              <div className="ai-analysis-loading">
                <div className="ai-analysis-loading__spinner" />
                <span>Menganalisis data penjualan dengan AI...</span>
              </div>
            ) : aiError ? (
              <article className="notice notice--error">
                Gagal menganalisis: {aiError}
              </article>
            ) : null}
            {aiAnalysis ? (
              <div className="ai-analysis-summary spacer-bottom" dangerouslySetInnerHTML={{ __html: aiAnalysis }} />
            ) : null}
            <div className="analysis-tables">
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Periode Lalu</th>
                      <th>Periode Ini</th>
                      <th>Perubahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productChanges.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.prevQty}</td>
                        <td>{p.currentQty}</td>
                        <td className={p.change >= 0 ? "change-up" : "change-down"}>
                          {p.change >= 0 ? "▲" : "▼"} {Math.abs(p.change)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Produk Dibeli Bersamaan</th>
                      <th>Frekuensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPairs.map(([pair, count], i) => (
                      <tr key={i}>
                        <td>{pair.split(" ||| ").join(" + ")}</td>
                        <td>{count}x</td>
                      </tr>
                    ))}
                    {topPairs.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ color: "var(--color-muted)" }}>
                          Tidak ada data pembelian bersamaan
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Jam / Hari</th>
                      <th>Transaksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHours.map(([hour, count], i) => (
                      <tr key={`h-${i}`}>
                        <td>{String(hour).padStart(2, "0")}.00 – {String(hour).padStart(2, "0")}.59</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                    {sortedDays.map(([day, count], i) => (
                      <tr key={`d-${i}`}>
                        <td>{day}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                    {sortedHours.length === 0 && sortedDays.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ color: "var(--color-muted)" }}>
                          Tidak ada data transaksi
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        </>
      ) : null}
      {forecastGenerated ? (
        <section className="panel">
          <h2 className="card-title" style={{ fontSize: 28 }}>
            Snapshot Forecasting
          </h2>
          <div className="table-shell spacer-top">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dibuat</th>
                  <th>Produk</th>
                  <th>Total Terjual</th>
                  <th>Stok Saat Ini</th>
                  <th>Minimum</th>
                  <th>Stock Status</th>
                  <th>Saran Restok</th>
                </tr>
              </thead>
              <tbody>
                {forecastRows.map((row) => (
                  <tr key={row.productId}>
                    <td>{formatShortDate(new Date().toISOString())}</td>
                    <td>{row.productName}</td>
                    <td>{row.quantity} item</td>
                    <td>{row.stock} item</td>
                    <td>{row.restockThreshold} item</td>
                    <td>
                      <div
                        className={`forecast-meter forecast-meter--${row.statusTone}`}
                      >
                        <div className="forecast-meter__track">
                          <span
                            className="forecast-meter__fill"
                            style={{ width: `${row.meterValue}%` }}
                          />
                        </div>
                        <div className="forecast-meter__meta">
                          <span>{row.status}</span>
                          <span>{row.meterValue}%</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {row.suggestedRestock
                        ? `Restock ${row.suggestedRestock} item`
                        : "Stok cukup"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <label className="field-group" style={{ width: 320 }}>
          <span className="field-label">AI Key</span>
          <input
            className="field"
            type="password"
            value={aiApiKey}
            onChange={(event) => setAiApiKey(event.target.value)}
            placeholder="nvapi-..."
          />
        </label>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/transactions" element={<TransactionsRoute />} />
      <Route path="/products" element={<ProductsRoute />} />
      <Route path="/refunds" element={<RefundsRoute />} />
      <Route path="/reports" element={<ReportsRoute />} />
      <Route path="/" element={<Navigate to="/transactions" replace />} />
      <Route path="*" element={<Navigate to="/transactions" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
