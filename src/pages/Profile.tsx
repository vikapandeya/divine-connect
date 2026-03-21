import React, { useEffect, useState } from 'react';
import { UserProfile, Booking, Order, AstrologyReading } from '../types';
import {
  User,
  Package,
  Calendar,
  Settings,
  Phone,
  Mail,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';
import {
  downloadBookingCertificate,
  downloadKundaliCertificate,
  downloadOrderCertificate,
} from '../lib/documents';
import { downloadReceipt, printReceipt } from '../lib/receipts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addItemsToCart } from '../lib/cart';
import {
  DEMO_ADMIN_PROFILE,
  DEMO_CREDENTIALS,
  DEMO_DEVOTEE_PROFILE,
  DEMO_VENDOR_PROFILE,
  getUserProfileDirect,
  listAstrologyReadingsDirect,
  listBookingsByUserDirect,
  listOrdersByUserDirect,
} from '../lib/firestore-data';

type ProfileTab = 'bookings' | 'orders' | 'readings' | 'profile';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = DEMO_DEVOTEE_PROFILE;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [readings, setReadings] = useState<AstrologyReading[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('bookings');
  const latestOrder = orders[0] || null;

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab === 'profile' || requestedTab === 'bookings' || requestedTab === 'orders' || requestedTab === 'readings') {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileData, bookingsData, ordersData, readingsData] = await Promise.all([
          getUserProfileDirect(currentUser.uid),
          listBookingsByUserDirect(currentUser.uid),
          listOrdersByUserDirect(currentUser.uid),
          listAstrologyReadingsDirect(currentUser.uid),
        ]);

        setProfile(profileData);
        setBookings(bookingsData);
        setOrders(ordersData);
        setReadings(readingsData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleReorder = (order: Order) => {
    addItemsToCart(
      order.items.map((item) => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || 'https://picsum.photos/seed/reorder/400/400',
        quantity: item.quantity,
        category: item.category,
        templeName: item.templeName,
        weight: item.weight,
        size: item.size,
      })),
    );
    navigate('/cart');
  };

  const handleBookAgain = (booking: Booking) => {
    if (booking.type === 'darshan') {
      navigate('/services/darshan');
      return;
    }

    navigate(`/services/puja/${booking.serviceId}`);
  };

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const resolveBookingTitle = (booking: Booking) => {
    if (booking.serviceTitle) {
      return booking.serviceTitle;
    }

    if (booking.type === 'darshan') {
      return 'Darshan Support';
    }

    return 'Puja Booking';
  };

  const tabTitle =
    activeTab === 'bookings'
      ? 'Service Bookings'
      : activeTab === 'orders'
        ? 'Order History'
        : activeTab === 'readings'
          ? 'Astrology History'
          : 'Account Settings';

  const tabCount =
    activeTab === 'bookings'
      ? bookings.length
      : activeTab === 'orders'
        ? orders.length
        : activeTab === 'readings'
          ? readings.length
          : 'Security';

  const statCards: Array<{
    key: Exclude<ProfileTab, 'profile'>;
    label: string;
    value: number;
  }> = [
    { key: 'bookings', label: 'Bookings', value: bookings.length },
    { key: 'orders', label: 'Orders', value: orders.length },
    { key: 'readings', label: 'Readings', value: readings.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 text-center">
            <img
              src={currentUser.photoURL || ''}
              alt=""
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-100"
            />
            <h2 className="text-xl font-bold text-stone-900">{currentUser.displayName}</h2>
            <p className="text-stone-500 text-sm mb-6 capitalize">{profile?.role || 'Devotee'}</p>

            <div className="space-y-3 text-left">
              <div className="flex items-center text-sm text-stone-600">
                <Mail className="w-4 h-4 mr-2 text-stone-400" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              {profile?.phoneNumber && (
                <div className="flex items-center text-sm text-stone-600">
                  <Phone className="w-4 h-4 mr-2 text-stone-400" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 text-left">
              {statCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => switchTab(card.key)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    activeTab === card.key
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-stone-100 bg-stone-50 hover:border-orange-100 hover:bg-orange-50/40'
                  }`}
                >
                  <p
                    className={`text-[11px] uppercase tracking-wider font-bold mb-1 ${
                      activeTab === card.key ? 'text-orange-500' : 'text-stone-400'
                    }`}
                  >
                    {card.label}
                  </p>
                  <p className="text-xl font-bold text-stone-900">{card.value}</p>
                </button>
              ))}
            </div>
          </div>

          <nav className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden">
            <button
              onClick={() => switchTab('profile')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              My Profile
            </button>
            <button
              onClick={() => switchTab('bookings')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              My Bookings
            </button>
            <button
              onClick={() => switchTab('orders')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Package className="w-5 h-5 mr-3" />
              My Orders
            </button>
            <button
              onClick={() => switchTab('readings')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === 'readings'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Astrology History
            </button>
            <button
              onClick={() => navigate('/vendor')}
              className="w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              Vendor Dashboard
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              Admin Dashboard
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-stone-200 min-h-[600px] overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-stone-900">{tabTitle}</h3>
              <div className="flex items-center gap-3">
                {latestOrder ? (
                  <button
                    type="button"
                    onClick={() => switchTab('orders')}
                    className="hidden md:inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Invoice Ready
                  </button>
                ) : null}
                <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">
                  {tabCount}
                </span>
              </div>
            </div>

            <div className="p-8">
              {latestOrder && activeTab !== 'orders' ? (
                <div className="mb-8 rounded-[2rem] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-stone-50 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-500 mb-2">
                        Latest Invoice
                      </p>
                      <h4 className="text-lg font-bold text-stone-900">
                        Order #{latestOrder.orderNumber}
                      </h4>
                      <p className="text-sm text-stone-600 mt-1">
                        {latestOrder.items.length} items, {latestOrder.customerDetails?.fullName},{' '}
                        {latestOrder.customerDetails?.phoneNumber}
                      </p>
                      <p className="text-sm text-stone-500 mt-1">
                        Total: Rs. {formatIndianRupees(latestOrder.totalAmount)} | Issued:{' '}
                        {new Date(latestOrder.receipt?.issuedAt || latestOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => switchTab('orders')}
                        className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        View Order
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadReceipt(latestOrder)}
                        className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => printReceipt(latestOrder)}
                        className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'profile' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900">
                        {currentUser.displayName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-stone-100 p-5">
                      <p className="text-sm font-bold text-stone-900 mb-2">Quick Reorder</p>
                      <p className="text-sm text-stone-500">
                        Rebuild past prasad and spiritual offering orders directly into your cart.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-100 p-5">
                      <p className="text-sm font-bold text-stone-900 mb-2">Book Again</p>
                      <p className="text-sm text-stone-500">
                        Repeat past puja or darshan flows without manually searching again.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-100 p-5">
                      <p className="text-sm font-bold text-stone-900 mb-2">Saved Readings</p>
                      <p className="text-sm text-stone-500">
                        Review recent astrology insights and continue into remedies when needed.
                      </p>
                    </div>
                  </div>

                  {latestOrder ? (
                    <div className="rounded-[2rem] border border-orange-100 bg-orange-50 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-500 mb-2">
                            Latest Invoice
                          </p>
                          <h4 className="text-lg font-bold text-stone-900">
                            Order #{latestOrder.orderNumber}
                          </h4>
                          <p className="text-sm text-stone-600 mt-1">
                            {latestOrder.items.length} items | Rs. {formatIndianRupees(latestOrder.totalAmount)}
                          </p>
                          <p className="text-xs text-stone-500 mt-1">
                            Transaction ID: {latestOrder.receipt?.transactionId || 'Generated at checkout'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => switchTab('orders')}
                            className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Open Orders
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadReceipt(latestOrder)}
                            className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => printReceipt(latestOrder)}
                            className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadOrderCertificate(latestOrder)}
                            className="inline-flex items-center px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Order Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="pt-8 border-t border-stone-100">
                    <h4 className="text-lg font-bold text-stone-900 mb-6">Demo Access</h4>
                    <div className="max-w-md space-y-4">
                      <p className="text-sm text-stone-600">
                        This static demo does not require sign-in. If you want sample credentials for presentations, use{' '}
                        <span className="font-bold text-stone-900">{DEMO_CREDENTIALS.email}</span> /{' '}
                        <span className="font-bold text-stone-900">{DEMO_CREDENTIALS.password}</span>.
                      </p>
                      <div className="grid grid-cols-1 gap-3 text-sm text-stone-600">
                        <div className="rounded-2xl border border-stone-100 p-4">
                          Devotee demo: <span className="font-bold text-stone-900">{DEMO_DEVOTEE_PROFILE.email}</span>
                        </div>
                        <div className="rounded-2xl border border-stone-100 p-4">
                          Vendor demo: <span className="font-bold text-stone-900">{DEMO_VENDOR_PROFILE.email}</span>
                        </div>
                        <div className="rounded-2xl border border-stone-100 p-4">
                          Admin demo: <span className="font-bold text-stone-900">{DEMO_ADMIN_PROFILE.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'bookings' ? (
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-20">
                      <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400">No bookings found.</p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-6 rounded-2xl border border-stone-100 hover:border-orange-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900">{resolveBookingTitle(booking)}</h4>
                            <p className="text-xs text-stone-500">
                              {booking.date} at {booking.timeSlot}
                            </p>
                            <p className="text-xs text-stone-500">
                              Certificate Ref: {booking.bookingReference || booking.id.slice(-8).toUpperCase()}
                            </p>
                            {booking.mode && (
                              <p className="text-xs text-stone-500 capitalize">
                                {booking.mode} pandit ji service
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-3">
                          <p className="font-bold text-stone-900">
                            Rs. {formatIndianRupees(booking.totalAmount)}
                          </p>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : booking.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : booking.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {booking.status}
                          </span>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleBookAgain(booking)}
                              className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors"
                            >
                              Book Again
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => downloadBookingCertificate(booking, profile)}
                              className="inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-1.5" />
                              Download Certificate
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'orders' ? (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400">No orders found.</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-6 rounded-2xl border border-stone-100">
                        <div className="mb-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-500">
                                Invoice Ready
                              </p>
                              <p className="text-sm font-medium text-stone-600 mt-1">
                                Full invoice includes order number, customer details, payment method, price breakup, and delivery address.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => downloadReceipt(order)}
                                className="inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                              </button>
                              <button
                                type="button"
                                onClick={() => printReceipt(order)}
                                className="inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                              >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Invoice
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadOrderCertificate(order)}
                                className="inline-flex items-center px-3 py-2 rounded-xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Order Certificate
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <span className="text-xs font-bold text-stone-400">
                              Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                            </span>
                            <p className="text-xs text-stone-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                              Receipt issued: {new Date(order.receipt?.issuedAt || order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className="inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reorder
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadReceipt(order)}
                              className="inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Invoice
                            </button>
                            <button
                              type="button"
                              onClick={() => printReceipt(order)}
                              className="inline-flex items-center px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Print Invoice
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-stone-100 bg-white p-4">
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                                Receipt Details
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-stone-600">
                                <p>
                                  Order No: <span className="font-bold text-stone-900">{order.orderNumber}</span>
                                </p>
                                <p>
                                  Payment: <span className="font-bold text-stone-900">{order.receipt?.paymentMethod}</span>
                                </p>
                                <p>
                                  Payment Status:{' '}
                                  <span className="font-bold text-stone-900">{order.receipt?.paymentStatus || 'Paid'}</span>
                                </p>
                                <p>
                                  Customer: <span className="font-bold text-stone-900">{order.customerDetails?.fullName}</span>
                                </p>
                                <p>
                                  Contact: <span className="font-bold text-stone-900">{order.customerDetails?.phoneNumber}</span>
                                </p>
                                <p className="md:col-span-2">
                                  Email: <span className="font-bold text-stone-900">{order.customerDetails?.email}</span>
                                </p>
                                <p className="md:col-span-2">
                                  Transaction ID:{' '}
                                  <span className="font-bold text-stone-900">{order.receipt?.transactionId || 'Generated at checkout'}</span>
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-stone-900">{order.items.length} Items</p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.slice(0, 3).map((item) => (
                                <span
                                  key={`${order.id}-${item.productId}`}
                                  className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold"
                                >
                                  {item.name} x {item.quantity}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-stone-500">{order.shippingAddress}</p>
                            <div className="text-xs text-stone-500 space-y-1">
                              <p>
                                {order.customerDetails?.fullName} | {order.customerDetails?.phoneNumber}
                              </p>
                              <p>{order.customerDetails?.email}</p>
                            </div>
                            {order.estimatedDeliveryDate ? (
                              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                                  Estimated Delivery
                                </p>
                                <p className="text-sm font-bold text-stone-900">
                                  {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                                </p>
                              </div>
                            ) : null}
                            <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                                Receipt Summary
                              </p>
                              <div className="space-y-1 text-sm text-stone-600">
                                {order.items.map((item) => (
                                  <p key={`${order.id}-${item.productId}-line`}>
                                    {item.name} x {item.quantity}:{' '}
                                    <span className="font-bold text-stone-900">
                                      Rs. {formatIndianRupees(item.price * item.quantity)}
                                    </span>
                                  </p>
                                ))}
                                <p>
                                  Subtotal:{' '}
                                  <span className="font-bold text-stone-900">
                                    Rs. {formatIndianRupees(order.receipt?.subtotal || order.totalAmount)}
                                  </span>
                                </p>
                                <p>
                                  Shipping:{' '}
                                  <span className="font-bold text-stone-900">
                                    Rs. {formatIndianRupees(order.receipt?.shippingFee || 0)}
                                  </span>
                                </p>
                                <p>
                                  Payment:{' '}
                                  <span className="font-bold text-stone-900">
                                    {order.receipt?.paymentMethod || 'Secure checkout'}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {order.statusTimeline?.length ? (
                              <div className="rounded-2xl border border-stone-100 p-4">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                                  Order Journey
                                </p>
                                <div className="space-y-3">
                                  {order.statusTimeline.map((step) => (
                                    <div
                                      key={`${order.id}-${step.status}`}
                                      className="flex items-start justify-between gap-4"
                                    >
                                      <div>
                                        <p className="text-sm font-bold text-stone-900">{step.label}</p>
                                        <p className="text-xs text-stone-500">{step.note}</p>
                                      </div>
                                      <span className="text-[11px] font-medium text-stone-400 whitespace-nowrap">
                                        {new Date(step.completedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-stone-900">
                              Rs. {formatIndianRupees(order.totalAmount)}
                            </p>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {readings.length === 0 ? (
                    <div className="text-center py-20">
                      <Sparkles className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400">No astrology readings found yet.</p>
                    </div>
                  ) : (
                    readings.map((reading) => (
                      <div key={reading.id} className="p-6 rounded-2xl border border-stone-100">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                              {reading.readingType === 'kundali-match'
                                ? 'Kundali Match'
                                : reading.readingType === 'rashi-phal'
                                  ? 'Rashi Phal'
                                  : 'Astrology Reading'}
                            </p>
                            <h4 className="text-lg font-bold text-stone-900 mt-1">{reading.name}</h4>
                            <p className="text-xs text-stone-500 mt-1">
                              {new Date(reading.createdAt).toLocaleDateString()} | {reading.pob}
                            </p>
                            {reading.partnerName ? (
                              <p className="text-xs text-stone-500 mt-1">
                                Match with {reading.partnerName}
                              </p>
                            ) : null}
                            {reading.rashi ? (
                              <p className="text-xs text-stone-500 mt-1">
                                Rashi: {reading.rashi}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate('/astrology')}
                            className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors"
                          >
                            Open AI Astrology
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                        {reading.userQuery ? (
                          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 mb-4">
                            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
                              Your Question
                            </p>
                            <p className="text-sm text-stone-700">{reading.userQuery}</p>
                          </div>
                        ) : null}
                        <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                          <p className="text-sm text-stone-700 whitespace-pre-wrap line-clamp-6">
                            {reading.reading}
                          </p>
                        </div>
                        {reading.readingType === 'kundali-match' ? (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => downloadKundaliCertificate(reading)}
                              className="inline-flex items-center text-sm font-bold text-stone-700 hover:text-orange-600 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-1.5" />
                              Download Match Certificate
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
