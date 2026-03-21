export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'devotee' | 'vendor' | 'admin';
  phoneNumber?: string;
  addresses: string[];
  createdAt: string;
}

export interface VendorProfile {
  uid: string;
  businessName: string;
  description: string;
  type: 'priest' | 'temple' | 'shop';
  status: 'pending' | 'approved' | 'suspended';
  gstNumber?: string;
  rating: number;
  commissionRate: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  templeName?: string;
  weight?: string;
  size?: string;
  dispatchWindow?: string;
  city?: string;
  offeringType?: string;
  tags?: string[];
  searchKeywords?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Puja {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  samagriIncluded: boolean;
  mode?: 'online' | 'offline' | 'hybrid';
  onlineTimings?: string[];
  offlineTimings?: string[];
  templeName?: string;
  liveDarshanAvailable?: boolean;
  searchKeywords?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceTitle?: string;
  vendorId: string;
  type: 'puja' | 'darshan';
  mode?: 'online' | 'offline';
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  bookingReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AstrologyReading {
  id: string;
  userId: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  readingType?: 'vedic-reading' | 'kundali-match' | 'rashi-phal';
  partnerName?: string;
  partnerDob?: string;
  partnerTob?: string;
  partnerPob?: string;
  rashi?: string;
  userQuery?: string | null;
  reading: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  image?: string;
  templeName?: string;
  weight?: string;
  size?: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryNotes?: string;
}

export interface OrderReceipt {
  orderNumber: string;
  issuedAt: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

export interface OrderStatusStep {
  status: 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  label: string;
  note: string;
  completedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  customerDetails: CustomerDetails;
  receipt: OrderReceipt;
  estimatedDeliveryDate?: string;
  statusTimeline?: OrderStatusStep[];
  itemCount?: number;
  updatedAt?: string;
  createdAt: string;
}
