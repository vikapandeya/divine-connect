import { Order } from '../types';
import { PdfElement, downloadStyledPdfDocument } from './pdf';
import { formatIndianRupees } from './utils';

const PAGE_HEIGHT = 842;

function textYFromTop(top: number) {
  return PAGE_HEIGHT - top;
}

function rectYFromTop(top: number, height: number) {
  return PAGE_HEIGHT - top - height;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function formatStatusLine(value?: string) {
  if (!value) {
    return 'Pending';
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function buildAddress(order: Order) {
  const details = order.customerDetails || {
    fullName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  };
  return [
    details.addressLine1,
    details.addressLine2,
    `${details.city}, ${details.state} - ${details.pincode}`,
  ]
    .filter(Boolean)
    .join(', ');
}

function buildReceiptModel(order: Order) {
  const orderNumber = order.orderNumber || `ORDER-${order.id.slice(-6).toUpperCase()}`;
  const receipt = order.receipt || {
    orderNumber,
    issuedAt: order.createdAt,
    paymentMethod: 'Secure checkout',
    paymentStatus: 'Paid',
    transactionId: 'Generated at checkout',
    subtotal: order.totalAmount,
    shippingFee: 0,
    totalAmount: order.totalAmount,
  };

  const customerDetails = order.customerDetails || {
    fullName: 'DivineConnect Customer',
    email: 'Not provided',
    phoneNumber: 'Not provided',
    addressLine1: order.shippingAddress || 'Address not available',
    city: '',
    state: '',
    pincode: '',
  };

  return {
    orderNumber,
    receipt,
    customerDetails,
    invoiceDate: new Date(receipt.issuedAt || order.createdAt).toLocaleString('en-IN'),
    shippingAddress: buildAddress(order) || order.shippingAddress || 'Address not available',
  };
}

export function buildReceiptHtml(order: Order) {
  const { orderNumber, receipt, customerDetails, invoiceDate, shippingAddress } =
    buildReceiptModel(order);

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>
            <div class="item-name">${escapeHtml(item.name)}</div>
            <div class="item-meta">${escapeHtml(item.templeName || item.category)}</div>
          </td>
          <td>${escapeHtml(item.category)}</td>
          <td>${item.quantity}</td>
          <td>Rs. ${formatIndianRupees(item.price)}</td>
          <td>Rs. ${formatIndianRupees(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DivineConnect Invoice ${escapeHtml(orderNumber)}</title>
    <style>
      :root {
        --ink: #18212b;
        --muted: #5b6773;
        --line: #d8dee6;
        --panel: #ffffff;
        --bg: #f4f7fb;
        --brand: #0f3d63;
        --brand-soft: #dce8f4;
        --accent: #c87a21;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 28px;
        background: var(--bg);
        color: var(--ink);
        font-family: "Segoe UI", Arial, sans-serif;
      }

      .sheet {
        max-width: 920px;
        margin: 0 auto;
      }

      .hero {
        background: linear-gradient(135deg, var(--brand), #174d7b);
        color: #fff;
        border-radius: 28px;
        padding: 28px 32px;
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 24px;
        box-shadow: 0 18px 40px rgba(15, 61, 99, 0.16);
      }

      .hero h1 {
        margin: 10px 0 6px;
        font-size: 34px;
        letter-spacing: -0.02em;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 11px;
        opacity: 0.78;
        font-weight: 700;
      }

      .hero-meta {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 22px;
        padding: 20px;
      }

      .status-chip {
        display: inline-block;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .summary-grid,
      .detail-grid {
        display: grid;
        gap: 18px;
        margin-top: 22px;
      }

      .summary-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: 22px;
        box-shadow: 0 8px 24px rgba(18, 33, 49, 0.05);
      }

      .panel h3 {
        margin: 0 0 14px;
        font-size: 13px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .summary-value {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 8px;
      }

      .muted {
        color: var(--muted);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead th {
        text-align: left;
        padding: 14px 16px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
        border-bottom: 1px solid var(--line);
      }

      tbody td {
        padding: 16px;
        border-bottom: 1px solid #edf1f6;
        vertical-align: top;
        font-size: 14px;
      }

      .item-name {
        font-weight: 700;
        margin-bottom: 4px;
      }

      .item-meta {
        color: var(--muted);
        font-size: 12px;
      }

      .totals {
        margin-top: 16px;
        margin-left: auto;
        width: 320px;
        background: var(--brand-soft);
        border-radius: 20px;
        padding: 18px 20px;
      }

      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 8px 0;
      }

      .totals-row.grand {
        border-top: 1px solid rgba(15, 61, 99, 0.14);
        margin-top: 6px;
        padding-top: 14px;
        font-size: 18px;
        font-weight: 800;
      }

      .footer-note {
        margin-top: 18px;
        font-size: 13px;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <section class="hero">
        <div>
          <div class="eyebrow">DivineConnect Finance Desk</div>
          <h1>Tax Invoice / Order Receipt</h1>
          <p class="muted" style="color: rgba(255,255,255,0.82); margin: 0;">
            Structured billing document for sacred commerce orders, payment tracking, and support verification.
          </p>
        </div>
        <div class="hero-meta">
          <div class="status-chip">${escapeHtml(order.status)}</div>
          <p><strong>Invoice:</strong> ${escapeHtml(orderNumber)}</p>
          <p><strong>Issued On:</strong> ${escapeHtml(invoiceDate)}</p>
          <p><strong>Transaction ID:</strong> ${escapeHtml(receipt.transactionId || 'Generated at checkout')}</p>
          <p><strong>Payment:</strong> ${escapeHtml(receipt.paymentMethod)} (${escapeHtml(receipt.paymentStatus || 'Paid')})</p>
        </div>
      </section>

      <section class="summary-grid">
        <div class="panel">
          <h3>Grand Total</h3>
          <div class="summary-value">Rs. ${formatIndianRupees(receipt.totalAmount)}</div>
          <div class="muted">Including shipping and recorded payment status.</div>
        </div>
        <div class="panel">
          <h3>Line Items</h3>
          <div class="summary-value">${order.itemCount || order.items.length}</div>
          <div class="muted">Products captured in this invoice.</div>
        </div>
        <div class="panel">
          <h3>Payment Status</h3>
          <div class="summary-value">${escapeHtml(receipt.paymentStatus || 'Paid')}</div>
          <div class="muted">${escapeHtml(receipt.paymentMethod || 'Secure checkout')}</div>
        </div>
      </section>

      <section class="detail-grid">
        <div class="panel">
          <h3>Bill To</h3>
          <p><strong>${escapeHtml(customerDetails.fullName)}</strong></p>
          <p>${escapeHtml(customerDetails.email)}</p>
          <p>${escapeHtml(customerDetails.phoneNumber)}</p>
        </div>
        <div class="panel">
          <h3>Delivery Address</h3>
          <p>${escapeHtml(shippingAddress)}</p>
        </div>
      </section>

      <section class="panel">
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><strong>Rs. ${formatIndianRupees(receipt.subtotal)}</strong></div>
          <div class="totals-row"><span>Shipping</span><strong>Rs. ${formatIndianRupees(receipt.shippingFee)}</strong></div>
          <div class="totals-row grand"><span>Grand Total</span><span>Rs. ${formatIndianRupees(receipt.totalAmount)}</span></div>
        </div>
        <div class="footer-note">
          This invoice is generated by DivineConnect for order support, print records, and payment reconciliation.
        </div>
      </section>
    </div>
  </body>
</html>`;
}

function buildInvoicePdfElements(order: Order): PdfElement[] {
  const { orderNumber, receipt, customerDetails, invoiceDate, shippingAddress } =
    buildReceiptModel(order);
  const maxVisibleItems = order.items.length > 8 ? 7 : 8;
  const printableItems = order.items.slice(0, maxVisibleItems);
  const hiddenItemCount = Math.max(0, order.items.length - printableItems.length);
  const tableRows = printableItems.length + (hiddenItemCount > 0 ? 1 : 0);
  const tableHeight = 86 + Math.max(1, tableRows) * 34;
  const tableTop = 304;
  const tableBottomTop = tableTop + tableHeight;
  const summaryTop = tableBottomTop + 22;
  const paymentStatus = formatStatusLine(receipt.paymentStatus || order.status || 'Paid');
  const paymentMethod = receipt.paymentMethod || 'Secure checkout';
  const transactionId = receipt.transactionId || 'Generated at checkout';
  const orderCount = order.itemCount || order.items.length;

  const elements: PdfElement[] = [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 595,
      height: 842,
      fillColor: [0.965, 0.976, 0.992],
    },
    {
      type: 'rect',
      x: 34,
      y: 34,
      width: 527,
      height: 774,
      fillColor: [1, 1, 1],
      strokeColor: [0.835, 0.878, 0.929],
      strokeWidth: 1.2,
    },
    {
      type: 'rect',
      x: 34,
      y: rectYFromTop(34, 136),
      width: 527,
      height: 136,
      fillColor: [0.059, 0.239, 0.388],
    },
    {
      type: 'text',
      x: 58,
      y: textYFromTop(60),
      text: 'DivineConnect Finance Desk',
      size: 10,
      bold: true,
      color: [0.867, 0.914, 0.965],
    },
    {
      type: 'text',
      x: 58,
      y: textYFromTop(92),
      text: 'Tax Invoice / Order Receipt',
      size: 24,
      bold: true,
      color: [1, 1, 1],
      maxWidth: 270,
      lineHeight: 27,
    },
    {
      type: 'text',
      x: 58,
      y: textYFromTop(126),
      text: 'Clear billing proof for support, delivery reconciliation, and payment verification inside the DivineConnect experience.',
      size: 10,
      color: [0.875, 0.922, 0.969],
      maxWidth: 258,
      lineHeight: 14,
    },
    {
      type: 'rect',
      x: 356,
      y: rectYFromTop(50, 108),
      width: 181,
      height: 108,
      fillColor: [0.114, 0.314, 0.482],
      strokeColor: [0.247, 0.451, 0.608],
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 372,
      y: textYFromTop(66),
      text: 'INVOICE SNAPSHOT',
      size: 8,
      bold: true,
      color: [1, 0.934, 0.78],
      maxWidth: 149,
    },
    {
      type: 'text',
      x: 372,
      y: textYFromTop(88),
      text: orderNumber,
      size: 11,
      bold: true,
      color: [1, 1, 1],
      maxWidth: 149,
      lineHeight: 14,
    },
    {
      type: 'text',
      x: 372,
      y: textYFromTop(108),
      text: `Issued on ${invoiceDate}`,
      size: 9,
      color: [0.922, 0.953, 0.984],
      maxWidth: 149,
      lineHeight: 12,
    },
    {
      type: 'text',
      x: 372,
      y: textYFromTop(126),
      text: `${paymentMethod} | ${paymentStatus}`,
      size: 9,
      color: [0.922, 0.953, 0.984],
      maxWidth: 149,
      lineHeight: 12,
    },
    {
      type: 'text',
      x: 372,
      y: textYFromTop(144),
      text: `Txn ID ${transactionId}`,
      size: 9,
      color: [0.922, 0.953, 0.984],
      maxWidth: 149,
      lineHeight: 12,
    },
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(184, 94),
      width: 228,
      height: 94,
      fillColor: [1, 1, 1],
      strokeColor: [0.825, 0.866, 0.92],
      strokeWidth: 1,
    },
    {
      type: 'rect',
      x: 308,
      y: rectYFromTop(184, 94),
      width: 229,
      height: 94,
      fillColor: [1, 1, 1],
      strokeColor: [0.825, 0.866, 0.92],
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(208),
      text: 'Bill To',
      size: 9,
      bold: true,
      color: [0.353, 0.404, 0.463],
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(234),
      text: customerDetails.fullName || 'DivineConnect Customer',
      size: 15,
      bold: true,
      color: [0.114, 0.145, 0.18],
      maxWidth: 192,
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(258),
      text: `${customerDetails.email || 'Not provided'}\n${customerDetails.phoneNumber || 'Not provided'}`,
      size: 10,
      color: [0.353, 0.404, 0.463],
      maxWidth: 192,
      lineHeight: 13,
    },
    {
      type: 'text',
      x: 326,
      y: textYFromTop(208),
      text: 'Payment Details',
      size: 9,
      bold: true,
      color: [0.353, 0.404, 0.463],
    },
    {
      type: 'text',
      x: 326,
      y: textYFromTop(234),
      text: paymentMethod,
      size: 14,
      bold: true,
      color: [0.114, 0.145, 0.18],
      maxWidth: 194,
    },
    {
      type: 'text',
      x: 326,
      y: textYFromTop(258),
      text: `Status: ${paymentStatus}\nItems: ${orderCount} | Order: ${formatStatusLine(order.status)}`,
      size: 10,
      color: [0.353, 0.404, 0.463],
      maxWidth: 194,
      lineHeight: 13,
    },
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(tableTop, tableHeight),
      width: 479,
      height: tableHeight,
      fillColor: [1, 1, 1],
      strokeColor: [0.825, 0.866, 0.92],
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(tableTop + 22),
      text: 'Order Items',
      size: 9,
      bold: true,
      color: [0.353, 0.404, 0.463],
    },
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(tableTop + 40, 30),
      width: 479,
      height: 30,
      fillColor: [0.925, 0.949, 0.976],
    },
  ];

  const headerY = textYFromTop(tableTop + 60);
  [
    { x: 72, text: 'Item', align: 'left' as const },
    { x: 280, text: 'Category', align: 'left' as const },
    { x: 381, text: 'Qty', align: 'center' as const },
    { x: 448, text: 'Rate', align: 'right' as const },
    { x: 519, text: 'Total', align: 'right' as const },
  ].forEach((column) => {
    elements.push({
      type: 'text',
      x: column.x,
      y: headerY,
      text: column.text,
      size: 9,
      bold: true,
      color: [0.353, 0.404, 0.463],
      align: column.align,
    });
  });

  const firstRowTop = tableTop + 92;
  printableItems.forEach((item, index) => {
    const rowTop = firstRowTop + index * 34;
    const dividerY = textYFromTop(rowTop + 22);

    elements.push(
      {
        type: 'text',
        x: 72,
        y: textYFromTop(rowTop),
        text: truncateText(item.name, 34),
        size: 11,
        bold: true,
        color: [0.114, 0.145, 0.18],
        maxWidth: 184,
      },
      {
        type: 'text',
        x: 280,
        y: textYFromTop(rowTop),
        text: truncateText(item.category, 16),
        size: 10,
        color: [0.353, 0.404, 0.463],
        maxWidth: 80,
      },
      {
        type: 'text',
        x: 381,
        y: textYFromTop(rowTop),
        text: String(item.quantity),
        size: 10,
        color: [0.114, 0.145, 0.18],
        align: 'center',
      },
      {
        type: 'text',
        x: 448,
        y: textYFromTop(rowTop),
        text: `Rs. ${formatIndianRupees(item.price)}`,
        size: 10,
        color: [0.114, 0.145, 0.18],
        align: 'right',
      },
      {
        type: 'text',
        x: 519,
        y: textYFromTop(rowTop),
        text: `Rs. ${formatIndianRupees(item.price * item.quantity)}`,
        size: 10,
        bold: true,
        color: [0.114, 0.145, 0.18],
        align: 'right',
      },
      {
        type: 'line',
        x1: 72,
        y1: dividerY,
        x2: 519,
        y2: dividerY,
        color: [0.911, 0.933, 0.957],
        width: 1,
      },
    );
  });

  if (hiddenItemCount > 0) {
    const rowTop = firstRowTop + printableItems.length * 34;
    const dividerY = textYFromTop(rowTop + 22);

    elements.push(
      {
        type: 'text',
        x: 72,
        y: textYFromTop(rowTop),
        text: `${hiddenItemCount} more item${hiddenItemCount > 1 ? 's' : ''} available in full order history`,
        size: 10,
        color: [0.353, 0.404, 0.463],
        maxWidth: 240,
      },
      {
        type: 'line',
        x1: 72,
        y1: dividerY,
        x2: 519,
        y2: dividerY,
        color: [0.911, 0.933, 0.957],
        width: 1,
      },
    );
  }

  elements.push(
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(summaryTop, 118),
      width: 282,
      height: 118,
      fillColor: [1, 1, 1],
      strokeColor: [0.825, 0.866, 0.92],
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(summaryTop + 24),
      text: 'Delivery and Notes',
      size: 9,
      bold: true,
      color: [0.353, 0.404, 0.463],
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(summaryTop + 48),
      text: shippingAddress,
      size: 11,
      color: [0.114, 0.145, 0.18],
      maxWidth: 246,
      lineHeight: 15,
    },
    {
      type: 'text',
      x: 76,
      y: textYFromTop(summaryTop + 88),
      text: 'Use this invoice for customer support, payment proof, and delivery reconciliation.',
      size: 9,
      color: [0.353, 0.404, 0.463],
      maxWidth: 246,
      lineHeight: 13,
    },
    {
      type: 'rect',
      x: 360,
      y: rectYFromTop(summaryTop, 118),
      width: 177,
      height: 118,
      fillColor: [0.862, 0.914, 0.969],
      strokeColor: [0.705, 0.792, 0.878],
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 378,
      y: textYFromTop(summaryTop + 24),
      text: 'Amount Summary',
      size: 9,
      bold: true,
      color: [0.208, 0.29, 0.38],
    },
    {
      type: 'text',
      x: 378,
      y: textYFromTop(summaryTop + 50),
      text: 'Subtotal',
      size: 11,
      color: [0.114, 0.145, 0.18],
    },
    {
      type: 'text',
      x: 519,
      y: textYFromTop(summaryTop + 50),
      text: `Rs. ${formatIndianRupees(receipt.subtotal)}`,
      size: 11,
      color: [0.114, 0.145, 0.18],
      align: 'right',
    },
    {
      type: 'text',
      x: 378,
      y: textYFromTop(summaryTop + 74),
      text: 'Shipping',
      size: 11,
      color: [0.114, 0.145, 0.18],
    },
    {
      type: 'text',
      x: 519,
      y: textYFromTop(summaryTop + 74),
      text: `Rs. ${formatIndianRupees(receipt.shippingFee)}`,
      size: 11,
      color: [0.114, 0.145, 0.18],
      align: 'right',
    },
    {
      type: 'line',
      x1: 378,
      y1: rectYFromTop(summaryTop + 88, 0),
      x2: 519,
      y2: rectYFromTop(summaryTop + 88, 0),
      color: [0.627, 0.718, 0.812],
      width: 1,
    },
    {
      type: 'text',
      x: 378,
      y: textYFromTop(summaryTop + 104),
      text: 'Grand Total',
      size: 13,
      bold: true,
      color: [0.059, 0.239, 0.388],
    },
    {
      type: 'text',
      x: 519,
      y: textYFromTop(summaryTop + 104),
      text: `Rs. ${formatIndianRupees(receipt.totalAmount)}`,
      size: 13,
      bold: true,
      color: [0.059, 0.239, 0.388],
      align: 'right',
    },
    {
      type: 'text',
      x: 58,
      y: 52,
      text: 'Generated by DivineConnect for sacred commerce records.',
      size: 9,
      color: [0.353, 0.404, 0.463],
    },
    {
      type: 'text',
      x: 537,
      y: 52,
      text: `${paymentStatus} payment record`,
      size: 9,
      color: [0.353, 0.404, 0.463],
      align: 'right',
    },
  );

  return elements;
}

export function downloadReceipt(order: Order) {
  downloadStyledPdfDocument(
    `${(order.orderNumber || `order-${order.id.slice(-6)}`).toLowerCase()}-invoice`,
    {
      elements: buildInvoicePdfElements(order),
    },
  );
}

export function printReceipt(order: Order) {
  if (typeof window === 'undefined') {
    return;
  }

  const receiptWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
  if (!receiptWindow) {
    return;
  }

  receiptWindow.document.write(buildReceiptHtml(order));
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
}
