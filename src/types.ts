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
}

export interface Puja {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  samagriIncluded: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  vendorId: string;
  type: 'puja' | 'darshan';
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
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
