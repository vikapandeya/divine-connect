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
  rating?: number;
  samagriPrice?: number;
  category?: string;
  templeName?: string;
  isLive?: boolean;
  vendor?: VendorProfile;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  vendorId: string;
  type: 'puja' | 'darshan';
  isOnline: boolean;
  bringSamagri: boolean;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  samagriList?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
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

export interface Feedback {
  id?: string;
  userId?: string;
  userName: string;
  city?: string;
  rating: number;
  message: string;
  serviceId?: string;
  type: 'puja' | 'product' | 'general';
  createdAt: string;
}
