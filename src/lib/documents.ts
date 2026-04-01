import { AstrologyReading, Booking, Order, UserProfile } from '../types';
import { PdfColor, PdfElement, downloadStyledPdfDocument } from './pdf';
import { formatIndianRupees } from './utils';

const PAGE_HEIGHT = 842;

type InfoRow = {
  label: string;
  value: string;
};

type InfoCard = {
  title: string;
  rows: InfoRow[];
};

type CertificateTheme = {
  background: PdfColor;
  panel: PdfColor;
  border: PdfColor;
  accent: PdfColor;
  accentSoft: PdfColor;
  text: PdfColor;
  muted: PdfColor;
};

function textYFromTop(top: number) {
  return PAGE_HEIGHT - top;
}

function rectYFromTop(top: number, height: number) {
  return PAGE_HEIGHT - top - height;
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString('en-IN');
}

function formatStatus(value?: string) {
  if (!value) {
    return 'Pending';
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function buildCertificateId(prefix: string, seed: string) {
  return `${prefix}-${seed.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-12)}`;
}

function getAdaptiveTitleStyle(value: string) {
  if (value.length > 48) {
    return { size: 18, lineHeight: 21 };
  }

  if (value.length > 34) {
    return { size: 20, lineHeight: 23 };
  }

  return { size: 22, lineHeight: 26 };
}

function getAdaptiveRecipientStyle(value: string) {
  if (value.length > 28) {
    return { size: 18, lineHeight: 21 };
  }

  if (value.length > 20) {
    return { size: 21, lineHeight: 24 };
  }

  return { size: 24, lineHeight: 27 };
}

function getAdaptiveInvitationTitleStyle(value: string) {
  if (value.length > 36) {
    return { size: 19, lineHeight: 21 };
  }

  if (value.length > 24) {
    return { size: 20, lineHeight: 22 };
  }

  return { size: 22, lineHeight: 24 };
}

function getOrderCertificateCopy(order: Order) {
  const primaryItem = order.items[0];
  const hasSingleItem = order.items.length === 1 && (order.itemCount || order.items.length) === 1;
  const title = hasSingleItem && primaryItem
    ? `${primaryItem.name} Certificate`
    : 'Sacred Product Purchase Certificate';
  const subtitle = hasSingleItem
    ? 'Product purchase verification'
    : 'Multi-item purchase verification';
  const summary = hasSingleItem && primaryItem
    ? `This certificate confirms that ${primaryItem.name} was purchased through PunyaSeva and recorded with payment details in your order history.`
    : 'This certificate confirms that the listed sacred products were purchased through PunyaSeva and recorded with payment details in your order history.';

  return {
    title,
    subtitle,
    summary,
    primaryItem,
    hasSingleItem,
  };
}

function addInfoCard(
  elements: PdfElement[],
  left: number,
  top: number,
  width: number,
  height: number,
  card: InfoCard,
  theme: CertificateTheme,
) {
  elements.push({
    type: 'rect',
    x: left,
    y: rectYFromTop(top, height),
    width,
    height,
    fillColor: theme.accentSoft,
    strokeColor: theme.border,
    strokeWidth: 1,
  });

  elements.push({
    type: 'rect',
    x: left,
    y: rectYFromTop(top, 6),
    width,
    height: 6,
    fillColor: theme.accent,
  });

  elements.push({
    type: 'text',
    x: left + 18,
    y: textYFromTop(top + 26),
    text: card.title.toUpperCase(),
    size: 9,
    bold: true,
    color: theme.muted,
  });

  let cursorTop = top + 48;
  card.rows.forEach((row, index) => {
    elements.push({
      type: 'text',
      x: left + 18,
      y: textYFromTop(cursorTop),
      text: row.label,
      size: 9,
      bold: true,
      color: theme.muted,
    });

    elements.push({
      type: 'text',
      x: left + 18,
      y: textYFromTop(cursorTop + 16),
      text: row.value,
      size: 11,
      bold: index === 0,
      color: theme.text,
      maxWidth: width - 36,
      lineHeight: 14,
    });

    cursorTop += 44;
  });
}

function buildCertificatePage(options: {
  filename: string;
  title: string;
  subtitle: string;
  documentId: string;
  recipientLabel: string;
  recipient: string;
  summary: string;
  cards: InfoCard[];
  footerNote: string;
  footerLabel: string;
  theme: CertificateTheme;
}) {
  const { theme } = options;
  const titleStyle = getAdaptiveTitleStyle(options.title);
  const recipientStyle = getAdaptiveRecipientStyle(options.recipient);
  const elements: PdfElement[] = [
    {
      type: 'rect',
      x: 34,
      y: 34,
      width: 527,
      height: 774,
      fillColor: theme.panel,
      strokeColor: theme.border,
      strokeWidth: 1.5,
    },
    {
      type: 'rect',
      x: 34,
      y: rectYFromTop(34, 82),
      width: 527,
      height: 82,
      fillColor: theme.accent,
    },
    {
      type: 'text',
      x: 60,
      y: textYFromTop(62),
      text: 'PunyaSeva',
      size: 14,
      bold: true,
      color: theme.panel,
    },
    {
      type: 'text',
      x: 536,
      y: textYFromTop(62),
      text: options.footerLabel.toUpperCase(),
      size: 9,
      bold: true,
      color: theme.panel,
      align: 'right',
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(136),
      text: options.subtitle.toUpperCase(),
      size: 9,
      bold: true,
      color: theme.muted,
      align: 'center',
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(166),
      text: options.title,
      size: titleStyle.size,
      bold: true,
      color: theme.text,
      align: 'center',
      maxWidth: 430,
      lineHeight: titleStyle.lineHeight,
    },
    {
      type: 'rect',
      x: 176,
      y: rectYFromTop(204, 30),
      width: 243,
      height: 30,
      fillColor: theme.accentSoft,
      strokeColor: theme.border,
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(224),
      text: options.documentId,
      size: 10,
      bold: true,
      color: theme.text,
      align: 'center',
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(264),
      text: options.recipientLabel.toUpperCase(),
      size: 9,
      bold: true,
      color: theme.muted,
      align: 'center',
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(292),
      text: options.recipient,
      size: recipientStyle.size,
      bold: true,
      color: theme.text,
      align: 'center',
      maxWidth: 400,
      lineHeight: recipientStyle.lineHeight,
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(332),
      text: options.summary,
      size: 11,
      color: theme.text,
      align: 'center',
      maxWidth: 410,
      lineHeight: 16,
    },
  ];

  const cards = options.cards.slice(0, 4);
  while (cards.length < 4) {
    cards.push({
      title: 'Information',
      rows: [{ label: 'Status', value: 'Available in your PunyaSeva profile' }],
    });
  }

  addInfoCard(elements, 58, 392, 220, 112, cards[0], theme);
  addInfoCard(elements, 316, 392, 220, 112, cards[1], theme);
  addInfoCard(elements, 58, 520, 220, 112, cards[2], theme);
  addInfoCard(elements, 316, 520, 220, 112, cards[3], theme);

  elements.push(
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(652, 86),
      width: 478,
      height: 86,
      fillColor: theme.panel,
      strokeColor: theme.border,
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 74,
      y: textYFromTop(676),
      text: 'Blessing Note',
      size: 9,
      bold: true,
      color: theme.muted,
    },
    {
      type: 'text',
      x: 74,
      y: textYFromTop(700),
      text: options.footerNote,
      size: 11,
      color: theme.text,
      maxWidth: 446,
      lineHeight: 16,
    },
    {
      type: 'line',
      x1: 74,
      y1: 98,
      x2: 214,
      y2: 98,
      color: theme.border,
      width: 1,
    },
    {
      type: 'text',
      x: 74,
      y: 82,
      text: 'Digital Verification Desk',
      size: 9,
      bold: true,
      color: theme.muted,
    },
    {
      type: 'line',
      x1: 382,
      y1: 98,
      x2: 522,
      y2: 98,
      color: theme.border,
      width: 1,
    },
    {
      type: 'text',
      x: 382,
      y: 82,
      text: 'PunyaSeva Records',
      size: 9,
      bold: true,
      color: theme.muted,
    },
  );

  downloadStyledPdfDocument(options.filename, {
    backgroundColor: theme.background,
    elements,
  });
}

function buildInvitationPage(
  invitationId: string,
  booking: Booking,
  profile: UserProfile | null,
) {
  const theme = {
    background: [0.996, 0.978, 0.949] as PdfColor,
    hero: [0.745, 0.322, 0.125] as PdfColor,
    heroSoft: [0.973, 0.875, 0.741] as PdfColor,
    panel: [1, 0.995, 0.986] as PdfColor,
    text: [0.247, 0.176, 0.122] as PdfColor,
    muted: [0.565, 0.435, 0.341] as PdfColor,
    border: [0.905, 0.753, 0.627] as PdfColor,
  };

  const devoteeName = profile?.displayName || profile?.email || 'Devotee';
  const devoteeAddress = profile?.addresses?.[0] || 'Address will be shared during confirmation';
  const mode = formatStatus(booking.mode || 'online');
  const invitationTitleStyle = getAdaptiveInvitationTitleStyle(
    booking.serviceTitle || 'Puja Booking',
  );

  const elements: PdfElement[] = [
    {
      type: 'rect',
      x: 34,
      y: 34,
      width: 527,
      height: 774,
      fillColor: theme.panel,
      strokeColor: theme.border,
      strokeWidth: 1.25,
    },
    {
      type: 'rect',
      x: 34,
      y: rectYFromTop(34, 96),
      width: 527,
      height: 96,
      fillColor: theme.hero,
    },
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(154, 176),
      width: 479,
      height: 176,
      fillColor: [0.996, 0.981, 0.957],
      strokeColor: theme.border,
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 60,
      y: textYFromTop(66),
      text: 'PunyaSeva',
      size: 14,
      bold: true,
      color: [1, 0.986, 0.955],
    },
    {
      type: 'text',
      x: 60,
      y: textYFromTop(94),
      text: 'Sacred Puja Invitation',
      size: 23,
      bold: true,
      color: [1, 0.986, 0.955],
    },
    {
      type: 'text',
      x: 60,
      y: textYFromTop(118),
      text: 'Share this invitation with family and loved ones for a clear, devotional event summary.',
      size: 10,
      color: [1, 0.936, 0.852],
      maxWidth: 320,
      lineHeight: 14,
    },
    {
      type: 'rect',
      x: 196,
      y: rectYFromTop(186, 30),
      width: 203,
      height: 30,
      fillColor: theme.heroSoft,
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(206),
      text: invitationId,
      size: 10,
      bold: true,
      color: theme.text,
      align: 'center',
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(252),
      text: 'With blessings and devotion, you are warmly invited to join this sacred occasion.',
      size: 11,
      color: theme.muted,
      align: 'center',
      maxWidth: 370,
      lineHeight: 15,
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(290),
      text: booking.serviceTitle || 'Puja Booking',
      size: invitationTitleStyle.size,
      bold: true,
      color: theme.text,
      align: 'center',
      maxWidth: 360,
      lineHeight: invitationTitleStyle.lineHeight,
    },
    {
      type: 'text',
      x: 297.5,
      y: textYFromTop(320),
      text: `Hosted for ${devoteeName}`,
      size: 12,
      color: theme.muted,
      align: 'center',
    },
  ];

  const highlightBoxes = [
    { label: 'Puja Date', value: booking.date, left: 84 },
    { label: 'Puja Time', value: booking.timeSlot, left: 223 },
    { label: 'Mode', value: mode, left: 362 },
  ];

  highlightBoxes.forEach((box) => {
    elements.push(
      {
        type: 'rect',
        x: box.left,
        y: rectYFromTop(378, 82),
        width: 112,
        height: 82,
        fillColor: theme.heroSoft,
        strokeColor: theme.border,
        strokeWidth: 1,
      },
      {
        type: 'text',
        x: box.left + 56,
        y: textYFromTop(402),
        text: box.label.toUpperCase(),
        size: 9,
        bold: true,
        color: theme.muted,
        align: 'center',
      },
      {
        type: 'text',
        x: box.left + 56,
        y: textYFromTop(434),
        text: box.value,
        size: 12,
        bold: true,
        color: theme.text,
        align: 'center',
        maxWidth: 88,
        lineHeight: 15,
      },
    );
  });

  addInfoCard(
    elements,
    58,
    490,
    228,
    124,
    {
      title: 'Invitation Details',
      rows: [
        { label: 'Devotee Name', value: devoteeName },
        { label: 'Booking Reference', value: booking.bookingReference || booking.id },
      ],
    },
    {
      background: theme.background,
      panel: theme.panel,
      border: theme.border,
      accent: theme.hero,
      accentSoft: [0.994, 0.969, 0.925],
      text: theme.text,
      muted: theme.muted,
    },
  );

  addInfoCard(
    elements,
    308,
    490,
    228,
    124,
    {
      title: 'Venue and Presence',
      rows: [
        { label: 'Address', value: devoteeAddress },
        { label: 'Attendance', value: 'Family, friends, and close well-wishers are welcome' },
      ],
    },
    {
      background: theme.background,
      panel: theme.panel,
      border: theme.border,
      accent: theme.hero,
      accentSoft: [0.994, 0.969, 0.925],
      text: theme.text,
      muted: theme.muted,
    },
  );

  elements.push(
    {
      type: 'rect',
      x: 58,
      y: rectYFromTop(642, 106),
      width: 478,
      height: 106,
      fillColor: [0.994, 0.969, 0.925],
      strokeColor: theme.border,
      strokeWidth: 1,
    },
    {
      type: 'text',
      x: 74,
      y: textYFromTop(668),
      text: 'Blessings and Note',
      size: 9,
      bold: true,
      color: theme.muted,
    },
    {
      type: 'text',
      x: 74,
      y: textYFromTop(692),
      text: 'May this sacred gathering bring peace, blessings, and spiritual strength to the devotee, the family, and every invited guest. Please keep this card for sharing and event coordination.',
      size: 11,
      color: theme.text,
      maxWidth: 446,
      lineHeight: 16,
    },
    {
      type: 'text',
      x: 74,
      y: 86,
      text: 'Presented with care by PunyaSeva',
      size: 10,
      bold: true,
      color: theme.muted,
    },
    {
      type: 'text',
      x: 520,
      y: 86,
      text: 'Sacred service invitation',
      size: 10,
      color: theme.muted,
      align: 'right',
    },
  );

  downloadStyledPdfDocument(`${invitationId.toLowerCase()}-invitation`, {
    backgroundColor: theme.background,
    elements,
  });
}

export function downloadBookingCertificate(booking: Booking, profile: UserProfile | null) {
  const bookingPrefix =
    booking.type === 'puja' ? 'PUJA' : booking.type === 'darshan' ? 'DARSHAN' : 'YATRA';
  const certificateTitle =
    booking.type === 'puja'
      ? 'Sacred Service Certificate'
      : booking.type === 'darshan'
        ? 'Darshan Participation Certificate'
        : 'Pilgrimage Package Certificate';
  const certificateSubtitle =
    booking.type === 'puja'
      ? 'Verified booking record'
      : booking.type === 'darshan'
        ? 'Verified darshan record'
        : 'Verified yatra reservation';
  const certificateSummary =
    booking.type === 'yatra'
      ? 'This digital certificate confirms that the selected pilgrimage package has been successfully reserved through PunyaSeva and saved in your travel history.'
      : 'This digital certificate confirms that the requested sacred service has been successfully reserved through PunyaSeva and recorded in your activity history.';
  const certificateId = buildCertificateId(
    bookingPrefix,
    booking.bookingReference || booking.id,
  );
  const devoteeName = profile?.displayName || profile?.email || 'Devotee';

  buildCertificatePage({
    filename: `${certificateId.toLowerCase()}-certificate`,
    title: certificateTitle,
    subtitle: certificateSubtitle,
    documentId: certificateId,
    recipientLabel: 'Issued To',
    recipient: devoteeName,
    summary: certificateSummary,
    cards: [
      {
        title: 'Service Overview',
        rows: [
          { label: 'Service', value: booking.serviceTitle || `${formatStatus(booking.type)} booking` },
          { label: booking.type === 'yatra' ? 'Travel Format' : 'Mode', value: formatStatus(booking.mode || 'online') },
        ],
      },
      {
        title: 'Schedule',
        rows: [
          { label: booking.type === 'yatra' ? 'Departure Date' : 'Booking Date', value: booking.date },
          { label: booking.type === 'yatra' ? 'Package Duration' : 'Time Slot', value: booking.timeSlot },
        ],
      },
      {
        title: 'Verification',
        rows: [
          { label: 'Reference', value: booking.bookingReference || booking.id },
          { label: 'Status', value: formatStatus(booking.status) },
        ],
      },
      {
        title: 'Amount Summary',
        rows: [
          { label: 'Amount', value: `Rs. ${formatIndianRupees(booking.totalAmount)}` },
          { label: 'Issued On', value: formatDateTime(booking.updatedAt || booking.createdAt) },
        ],
      },
    ],
    footerNote:
      'Keep this certificate for support follow-up, service check-in, and future reference inside your PunyaSeva profile.',
    footerLabel: 'Digital certificate',
    theme: {
      background: [0.988, 0.969, 0.937],
      panel: [1, 0.997, 0.988],
      border: [0.898, 0.812, 0.702],
      accent: [0.812, 0.357, 0.118],
      accentSoft: [0.982, 0.933, 0.867],
      text: [0.231, 0.176, 0.122],
      muted: [0.545, 0.439, 0.333],
    },
  });
}

export function downloadPujaInvitationCard(booking: Booking, profile: UserProfile | null) {
  const invitationId = buildCertificateId('INVITE', booking.bookingReference || booking.id);
  buildInvitationPage(invitationId, booking, profile);
}

export function downloadOrderCertificate(order: Order) {
  const certificateId = buildCertificateId('ORDER', order.orderNumber || order.id);
  const certificateCopy = getOrderCertificateCopy(order);
  const itemSummary = order.items
    .slice(0, 2)
    .map((item) => item.name)
    .join(', ');
  const additionalItems =
    order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

  buildCertificatePage({
    filename: `${certificateId.toLowerCase()}-certificate`,
    title: certificateCopy.title,
    subtitle: certificateCopy.subtitle,
    documentId: certificateId,
    recipientLabel: 'Issued To',
    recipient: order.customerDetails?.fullName || 'PunyaSeva Customer',
    summary: certificateCopy.summary,
    cards: [
      {
        title: 'Product Details',
        rows: [
          {
            label: certificateCopy.hasSingleItem ? 'Product Name' : 'Products',
            value:
              certificateCopy.hasSingleItem && certificateCopy.primaryItem
                ? certificateCopy.primaryItem.name
                : `${itemSummary}${additionalItems}`,
          },
          {
            label: 'Category / Quantity',
            value: certificateCopy.hasSingleItem && certificateCopy.primaryItem
              ? `${certificateCopy.primaryItem.category} | Qty ${certificateCopy.primaryItem.quantity}`
              : `${order.items.length} items in this purchase`,
          },
        ],
      },
      {
        title: 'Source and Pricing',
        rows: [
          {
            label: 'Temple / Source',
            value:
              certificateCopy.primaryItem?.templeName ||
              certificateCopy.primaryItem?.category ||
              'PunyaSeva marketplace selection',
          },
          { label: 'Total Amount', value: `Rs. ${formatIndianRupees(order.totalAmount)}` },
        ],
      },
      {
        title: 'Payment Snapshot',
        rows: [
          { label: 'Payment Method', value: order.receipt?.paymentMethod || 'Secure checkout' },
          { label: 'Payment Status', value: formatStatus(order.receipt?.paymentStatus || 'Paid') },
        ],
      },
      {
        title: 'Order Trace',
        rows: [
          { label: 'Order Number', value: order.orderNumber || order.id.slice(-6).toUpperCase() },
          { label: 'Issued On', value: formatDateTime(order.receipt?.issuedAt || order.createdAt) },
        ],
      },
    ],
    footerNote:
      'Use this certificate together with the invoice for recordkeeping, product verification, customer support, and delivery reconciliation.',
    footerLabel: 'Product certificate',
    theme: {
      background: [0.958, 0.978, 0.975],
      panel: [0.994, 0.998, 0.997],
      border: [0.741, 0.843, 0.816],
      accent: [0.09, 0.451, 0.408],
      accentSoft: [0.903, 0.957, 0.944],
      text: [0.101, 0.2, 0.196],
      muted: [0.314, 0.427, 0.408],
    },
  });
}

export function downloadKundaliCertificate(reading: AstrologyReading) {
  const certificateId = buildCertificateId('KUNDALI', reading.id);

  buildCertificatePage({
    filename: `${certificateId.toLowerCase()}-certificate`,
    title: 'Kundali Match Certificate',
    subtitle: 'Compatibility reading record',
    documentId: certificateId,
    recipientLabel: 'Primary Profile',
    recipient: reading.name,
    summary:
      'This certificate confirms that a compatibility reading was generated in the PunyaSeva Kundali Match experience and stored as a devotional reference.',
    cards: [
      {
        title: 'Primary Details',
        rows: [
          { label: 'Birth Details', value: `${reading.dob} | ${reading.tob} | ${reading.pob}` },
          { label: 'Reading Type', value: reading.readingType === 'kundali-match' ? 'Kundali Match' : 'Astrology Reading' },
        ],
      },
      {
        title: 'Partner Details',
        rows: [
          { label: 'Partner Name', value: reading.partnerName || 'Not provided' },
          { label: 'Partner Birth', value: `${reading.partnerDob || 'N/A'} | ${reading.partnerTob || 'N/A'} | ${reading.partnerPob || 'N/A'}` },
        ],
      },
      {
        title: 'Reading Log',
        rows: [
          { label: 'Issued On', value: formatDateTime(reading.createdAt) },
          { label: 'Reference', value: certificateId },
        ],
      },
      {
        title: 'Use Case',
        rows: [
          { label: 'Document Type', value: 'Digital compatibility certificate' },
          { label: 'Storage', value: 'Saved inside the PunyaSeva astrology profile' },
        ],
      },
    ],
    footerNote:
      'This certificate is intended for personal reference and devotional recordkeeping inside the PunyaSeva experience.',
    footerLabel: 'Astrology certificate',
    theme: {
      background: [0.969, 0.96, 0.988],
      panel: [0.996, 0.994, 1],
      border: [0.815, 0.788, 0.902],
      accent: [0.337, 0.255, 0.639],
      accentSoft: [0.937, 0.921, 0.988],
      text: [0.176, 0.153, 0.286],
      muted: [0.396, 0.357, 0.525],
    },
  });
}

