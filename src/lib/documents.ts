import { AstrologyReading, Booking, Order, UserProfile } from '../types';
import { downloadPdfDocument } from './pdf';
import { formatIndianRupees } from './utils';

function formatDateTime(value?: string) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString('en-IN');
}

function buildCertificateId(prefix: string, seed: string) {
  return `${prefix}-${seed.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-12)}`;
}

export function downloadBookingCertificate(booking: Booking, profile: UserProfile | null) {
  const certificateId = buildCertificateId(
    booking.type === 'puja' ? 'PUJA' : 'DARSHAN',
    booking.bookingReference || booking.id,
  );

  downloadPdfDocument(`${certificateId.toLowerCase()}-certificate`, [
    { text: 'DivineConnect', size: 24, bold: true },
    { text: 'Sacred Service Confirmation Certificate', size: 15, bold: true, gapBefore: 12 },
    { text: `Certificate ID: ${certificateId}`, bold: true, gapBefore: 20 },
    { text: `Issued On: ${formatDateTime(booking.updatedAt || booking.createdAt)}` },
    { text: `Recipient: ${profile?.displayName || profile?.email || 'Devotee'}`, gapBefore: 10 },
    { text: `Service: ${booking.serviceTitle || `${booking.type} booking`}` },
    { text: `Mode: ${(booking.mode || 'online').toUpperCase()}` },
    { text: `Booking Date: ${booking.date}` },
    { text: `Time Slot: ${booking.timeSlot}` },
    { text: `Reference: ${booking.bookingReference || booking.id}` },
    { text: `Status: ${booking.status.toUpperCase()}` },
    { text: `Amount: Rs. ${formatIndianRupees(booking.totalAmount)}` },
    { text: 'This certificate confirms that the requested sacred service has been successfully reserved through DivineConnect.', gapBefore: 20 },
    { text: 'Branding: DivineConnect | Verified service support | Digital devotional record', gapBefore: 16 },
  ]);
}

export function downloadOrderCertificate(order: Order) {
  const certificateId = buildCertificateId('ORDER', order.orderNumber || order.id);
  downloadPdfDocument(`${certificateId.toLowerCase()}-certificate`, [
    { text: 'DivineConnect', size: 24, bold: true },
    { text: 'Order Completion Certificate', size: 15, bold: true, gapBefore: 12 },
    { text: `Certificate ID: ${certificateId}`, bold: true, gapBefore: 20 },
    { text: `Issued On: ${formatDateTime(order.receipt?.issuedAt || order.createdAt)}` },
    { text: `Recipient: ${order.customerDetails?.fullName || 'DivineConnect Customer'}`, gapBefore: 10 },
    { text: `Order Number: ${order.orderNumber}` },
    { text: `Transaction ID: ${order.receipt?.transactionId || 'Generated at checkout'}` },
    { text: `Payment Status: ${order.receipt?.paymentStatus || 'Paid'}` },
    { text: `Payment Method: ${order.receipt?.paymentMethod || 'Secure checkout'}` },
    { text: `Item Count: ${order.itemCount || order.items.length}` },
    { text: `Total Amount: Rs. ${formatIndianRupees(order.totalAmount)}` },
    { text: `Delivery Address: ${order.shippingAddress}` },
    { text: 'This certificate confirms that the listed order was generated through the DivineConnect ordering flow and recorded in the demo account history.', gapBefore: 20 },
    { text: 'Branding: DivineConnect | Sacred commerce record | Printable digital certificate', gapBefore: 16 },
  ]);
}

export function downloadKundaliCertificate(reading: AstrologyReading) {
  const certificateId = buildCertificateId('KUNDALI', reading.id);
  downloadPdfDocument(`${certificateId.toLowerCase()}-certificate`, [
    { text: 'DivineConnect', size: 24, bold: true },
    { text: 'Kundali Match Completion Certificate', size: 15, bold: true, gapBefore: 12 },
    { text: `Certificate ID: ${certificateId}`, bold: true, gapBefore: 20 },
    { text: `Issued On: ${formatDateTime(reading.createdAt)}` },
    { text: `Primary Person: ${reading.name}`, gapBefore: 10 },
    { text: `Partner Name: ${reading.partnerName || 'Not provided'}` },
    { text: `Birth Details: ${reading.dob} | ${reading.tob} | ${reading.pob}` },
    { text: `Partner Details: ${reading.partnerDob || 'N/A'} | ${reading.partnerTob || 'N/A'} | ${reading.partnerPob || 'N/A'}` },
    { text: `Reading Type: ${reading.readingType === 'kundali-match' ? 'Kundali Match' : 'Astrology Reading'}` },
    { text: 'This certificate confirms that a compatibility reading was generated in the DivineConnect Kundali Match experience.', gapBefore: 20 },
    { text: 'Branding: DivineConnect | Kundali compatibility result | Digital devotional certificate', gapBefore: 16 },
  ]);
}
