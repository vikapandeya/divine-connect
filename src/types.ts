export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bannerURL?: string | null;
  bio?: string | null;
  address: string | null;
  role: 'devotee' | 'vendor' | 'admin';
  phoneNumber?: string;
  location?: { lat: number; lng: number };
  vendorStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  vendorDetails?: VendorProfile;
  createdAt: string;
}

export interface VendorProfile {
  uid: string;
  businessName: string;
  description: string;
  type: 'priest' | 'temple' | 'shop';
  status: 'pending' | 'approved' | 'suspended';
  isVerified?: boolean;
  gstNumber?: string;
  rating: number;
  commissionRate: number;
  businessType?: string;
  photoURL?: string;
  location?: { lat: number; lng: number };
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
  isFeatured?: boolean;
  spiritualSignificance?: string;
  weightOptions?: { label: string; price: number }[];
}

export interface Puja {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  onlinePrice: number;
  offlinePrice: number;
  duration: string;
  samagriIncluded: boolean;
  isOnline: boolean;
  price?: number;
  rating?: number;
  samagriPrice?: number;
  category?: string;
  templeName?: string;
  isLive?: boolean;
  vendor?: VendorProfile;
  samagriList?: string;
}

export type ProductCategory = 
  | 'Idols' 
  | 'Incense' 
  | 'Mala' 
  | 'Books' 
  | 'Yantras' 
  | 'Prasad' 
  | 'Puja Essentials'
  | 'Samagri Kits';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Idols',
  'Incense',
  'Mala',
  'Books',
  'Yantras',
  'Prasad',
  'Puja Essentials',
  'Samagri Kits',
];

export interface Yatra {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  images: string[];
  itinerary: { day: number; title: string; description: string }[];
  included: string[];
  excluded: string[];
  category: string;
  rating?: number;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  vendorId: string;
  type: 'puja' | 'darshan' | 'yatra';
  isOnline: boolean;
  bringSamagri: boolean;
  date: string;
  timeSlot?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  samagriList?: string;
  travelers?: number;
  contactNumber?: string;
  specialRequests?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  signatureURL?: string;
  paymentMethod?: string;
  trackingHistory?: any[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  type: 'product' | 'puja';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'system';
  read: boolean;
  createdAt: string;
}

export interface WhatsAppBooking {
  id: string;
  userId: string;
  vendorId: string;
  pujaTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  userLocation: { lat: number; lng: number };
  distance: number;
  whatsappNumber: string;
  createdAt: string;
}

export interface Feedback {
  id?: string;
  userId?: string;
  userName: string;
  city?: string;
  rating: number;
  message: string;
  serviceId?: string;
  type: 'puja' | 'product' | 'general';
  imageURL?: string;
  createdAt: string;
}

export interface VendorWallet {
  vendorId: string;
  balance: number;
  totalEarned: number;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  createdAt: string;
}

export interface VendorTransaction {
  id: string;
  vendorId: string;
  amount: number;
  type: 'earning' | 'payout';
  referenceId: string;
  createdAt: string;
}

export interface NaamJap {
  id: string;
  userId: string;
  mantraId: string;
  mantraName: string;
  count: number;
  target: number;
  date: string;
  updatedAt: string;
}
