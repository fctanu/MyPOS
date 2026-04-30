import type { Sale } from "@/domain/models";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatReceiptDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatReceiptTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(":", ".");
}

function formatReceiptAmount(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildSaleReceiptHtml({
  storeName,
  footer,
  sale,
  pointsUsed,
  earnedPoints,
  employeeName,
  customerName,
  currentPointBalance,
}: {
  storeName: string;
  footer?: string;
  sale: Sale;
  pointsUsed?: number;
  earnedPoints?: number;
  employeeName?: string;
  customerName?: string;
  currentPointBalance?: number;
}) {
  const footerMessage = footer?.trim() || "Semoga hari Anda menyenangkan";
  const itemRows = sale.items
    .map(
      (item) => `
        <tr>
          <td class="qty">${item.quantity}x</td>
          <td class="name">${escapeHtml(item.productName)}</td>
          <td class="amount">${formatReceiptAmount(item.subtotal)}</td>
        </tr>
      `,
    )
    .join("");

  const pointLines = [];
  if (pointsUsed)
    pointLines.push(`Poin digunakan: ${formatReceiptAmount(pointsUsed)}`);
  if (earnedPoints)
    pointLines.push(`Poin didapat: +${formatReceiptAmount(earnedPoints)}`);
  if (currentPointBalance !== undefined)
    pointLines.push(`Sisa poin: ${formatReceiptAmount(currentPointBalance)}`);

  const pointsInfo =
    pointLines.length > 0
      ? `<div class="meta">${pointLines.join("<br/>")}</div>`
      : "";

  const customerInfo = customerName
    ? `<div class="meta">Pelanggan: ${escapeHtml(customerName)}</div>`
    : "";

  const employeeInfo = employeeName
    ? `<div class="meta">Kasir: ${escapeHtml(employeeName)}</div>`
    : "";

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Struk ${escapeHtml(sale.receiptNumber)}</title>
    <style>
      @page { size: 58mm auto; margin: 6mm 5mm; }
      body {
        margin: 0;
        font-family: "Courier New", monospace;
        color: #0f172a;
        background: #ffffff;
      }
      .receipt {
        width: 48mm;
        margin: 0 auto;
        font-size: 11px;
        line-height: 1.45;
      }
      .divider {
        margin: 6px 0;
        white-space: pre;
      }
      .center {
        text-align: center;
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
        padding: 2px 0;
      }
      .qty {
        width: 18%;
      }
      .name {
        width: 50%;
        padding-right: 8px;
      }
      .amount {
        width: 32%;
        text-align: right;
        white-space: nowrap;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
      }
      .footer {
        margin-top: 12px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="receipt">
      <div class="divider">================================</div>
      <div class="center">${escapeHtml(storeName)}</div>
      <div class="divider">================================</div>
      <div class="meta">
        Tanggal: ${formatReceiptDate(sale.createdAt)}<br/>
        Jam: ${formatReceiptTime(sale.createdAt)}
      </div>
      ${employeeInfo}
      ${customerInfo}
      ${pointsInfo}
      <div class="divider">--------------------------------</div>
      <table>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <div class="divider">--------------------------------</div>
      <div class="divider">================================</div>
      <div class="total-row">
        <span>TOTAL:</span>
        <span>${formatReceiptAmount(sale.total)}</span>
      </div>
      <div class="divider">================================</div>
      <div class="footer">
        <div>Terima kasih!</div>
        <div>${escapeHtml(footerMessage)}</div>
      </div>
    </main>
    <script>
      window.addEventListener("load", function () {
        window.focus();
      });
    </script>
  </body>
</html>`;
}

export function printSaleReceipt({
  storeName,
  footer,
  sale,
  pointsUsed,
  earnedPoints,
  employeeName,
  customerName,
  currentPointBalance,
}: {
  storeName: string;
  footer?: string;
  sale: Sale;
  pointsUsed?: number;
  earnedPoints?: number;
  employeeName?: string;
  customerName?: string;
  currentPointBalance?: number;
}) {
  if (typeof window === "undefined") {
    throw new Error("Cetak struk hanya tersedia di browser.");
  }

  const receiptHtml = buildSaleReceiptHtml({
    storeName,
    footer,
    sale,
    pointsUsed,
    earnedPoints,
    employeeName,
    customerName,
    currentPointBalance,
  });

  const blob = new Blob([receiptHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const receiptWindow = window.open(
    url,
    "mypos-receipt",
    "width=420,height=720",
  );
  if (!receiptWindow) {
    URL.revokeObjectURL(url);
    throw new Error(
      "Popup struk diblokir browser. Izinkan pop-up lalu coba lagi.",
    );
  }
}
