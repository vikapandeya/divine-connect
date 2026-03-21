import { Order } from '../types';
import { downloadPdfDocument } from './pdf';
import { formatIndianRupees } from './utils';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

export function buildReceiptHtml(order: Order) {
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
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
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
    <title>DivineConnect Receipt ${escapeHtml(orderNumber)}</title>
    <style>
      body { font-family: Georgia, serif; margin: 32px; color: #292524; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
      .brand { font-size: 28px; font-weight: 700; color: #c2410c; }
      .card { border: 1px solid #e7e5e4; border-radius: 20px; padding: 20px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #e7e5e4; padding: 12px 8px; text-align: left; }
      th { color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      .totals { margin-top: 16px; text-align: right; }
      .totals p { margin: 6px 0; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">DivineConnect</div>
        <p>Sacred commerce receipt for your order.</p>
      </div>
      <div>
        <p><strong>Receipt:</strong> ${escapeHtml(orderNumber)}</p>
        <p><strong>Date:</strong> ${escapeHtml(
          new Date(receipt.issuedAt || order.createdAt).toLocaleString('en-IN'),
        )}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
        <p><strong>Transaction ID:</strong> ${escapeHtml(receipt.transactionId || 'Generated at checkout')}</p>
      </div>
    </div>

    <div class="card">
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${escapeHtml(customerDetails.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(customerDetails.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(customerDetails.phoneNumber)}</p>
      <p><strong>Address:</strong> ${escapeHtml(buildAddress(order))}</p>
    </div>

    <div class="card">
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
        <p>Subtotal: <strong>Rs. ${formatIndianRupees(receipt.subtotal)}</strong></p>
        <p>Shipping: <strong>Rs. ${formatIndianRupees(receipt.shippingFee)}</strong></p>
        <p>Grand Total: <strong>Rs. ${formatIndianRupees(receipt.totalAmount)}</strong></p>
        <p>Payment Method: <strong>${escapeHtml(receipt.paymentMethod)}</strong></p>
        <p>Payment Status: <strong>${escapeHtml(receipt.paymentStatus || 'Paid')}</strong></p>
      </div>
    </div>
  </body>
</html>`;
}

export function downloadReceipt(order: Order) {
  const receipt = order.receipt || {
    orderNumber: order.orderNumber,
    issuedAt: order.createdAt,
    paymentMethod: 'Secure checkout',
    paymentStatus: 'Paid',
    transactionId: 'Generated at checkout',
    subtotal: order.totalAmount,
    shippingFee: 0,
    totalAmount: order.totalAmount,
  };

  downloadPdfDocument(
    `${(order.orderNumber || `order-${order.id.slice(-6)}`).toLowerCase()}-invoice`,
    [
      { text: 'DivineConnect', size: 24, bold: true },
      { text: 'Tax Invoice / Order Receipt', size: 15, bold: true, gapBefore: 12 },
      { text: `Order Number: ${order.orderNumber || order.id.slice(-6).toUpperCase()}`, bold: true, gapBefore: 20 },
      { text: `Invoice Date: ${new Date(receipt.issuedAt || order.createdAt).toLocaleString('en-IN')}` },
      { text: `Transaction ID: ${receipt.transactionId || 'Generated at checkout'}` },
      { text: `Payment Method: ${receipt.paymentMethod}` },
      { text: `Payment Status: ${receipt.paymentStatus || 'Paid'}` },
      { text: `Customer: ${order.customerDetails?.fullName || 'DivineConnect Customer'}`, gapBefore: 12 },
      { text: `Email: ${order.customerDetails?.email || 'Not provided'}` },
      { text: `Contact: ${order.customerDetails?.phoneNumber || 'Not provided'}` },
      { text: `Address: ${buildAddress(order) || order.shippingAddress}` },
      { text: 'Items', bold: true, gapBefore: 18 },
      ...order.items.flatMap((item) => [
        { text: `${item.name} | ${item.category} | Qty ${item.quantity} | Rs. ${formatIndianRupees(item.price * item.quantity)}` },
      ]),
      { text: `Subtotal: Rs. ${formatIndianRupees(receipt.subtotal)}`, bold: true, gapBefore: 18 },
      { text: `Shipping: Rs. ${formatIndianRupees(receipt.shippingFee)}` },
      { text: `Grand Total: Rs. ${formatIndianRupees(receipt.totalAmount)}`, size: 14, bold: true },
    ],
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
