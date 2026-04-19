import mysql from 'mysql2/promise';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export interface DatabaseAdapter {
  // Users
  getUser(uid: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(uid: string, userData: any): Promise<void>;
  updateUser(uid: string, updateData: any): Promise<void>;
  getPendingVendors(): Promise<any[]>;
  getStats(): Promise<any>;
  
  // Vendors
  getVendor(vendorId: string): Promise<any>;
  createVendor(vendorId: string, vendorData: any): Promise<void>;
  getVendorsPerformance(): Promise<any[]>;
  
  // Products
  getProducts(filters: { category?: string; vendorId?: string }): Promise<any[]>;
  addProduct(productData: any): Promise<string>;
  updateProduct(id: string, productData: any): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  
  // Pujas
  getPujas(filters: { vendorId?: string }): Promise<any[]>;
  getPuja(id: string): Promise<any>;
  addPuja(pujaData: any): Promise<string>;
  updatePuja(id: string, pujaData: any): Promise<void>;
  deletePuja(id: string): Promise<void>;
  
  // Yatras
  getYatras(filters: { vendorId?: string }): Promise<any[]>;
  getYatra(id: string): Promise<any>;
  addYatra(yatraData: any): Promise<string>;
  updateYatra(id: string, yatraData: any): Promise<void>;
  deleteYatra(id: string): Promise<void>;
  
  // Bookings
  getBookingsByUser(uid: string): Promise<any[]>;
  getBookingsByVendor(vendorId: string): Promise<any[]>;
  addBooking(bookingData: any): Promise<string>;
  updateBookingStatus(id: string, status: string): Promise<void>;
  updateBookingPaidAmount(id: string, amount: number): Promise<void>;
  getBooking(id: string): Promise<any>;
  
  // Orders
  getOrdersByUser(uid: string): Promise<any[]>;
  getOrdersByVendor(vendorId: string): Promise<any[]>;
  addOrder(orderData: any): Promise<string>;
  getOrder(id: string): Promise<any>;
  updateOrderStatus(id: string, status: string, trackingUpdate: any): Promise<void>;
  
  // Wallet & Transactions
  getWallet(vendorId: string): Promise<any>;
  getTransactions(vendorId: string, limit: number): Promise<any[]>;
  updateWallet(vendorId: string, earning: number, totalAmount: number, type: string, referenceId: string, commission: number): Promise<void>;
  addPayout(vendorId: string, payout: any): Promise<void>;
  getPayouts(vendorId?: string): Promise<any[]>;
  updatePayoutStatus(id: string, status: string): Promise<void>;
  
  // Notifications
  addNotification(notificationData: any): Promise<void>;
  
  // Misc
  getCoupons(): Promise<any[]>;
  addCoupon(coupon: any): Promise<void>;
  getFeedback(): Promise<any[]>;
  addFeedback(feedback: any): Promise<void>;
  getVisitorStats(): Promise<any>;
  updateVisitorStats(stats: any): Promise<void>;
  getUsersByRole(role: string): Promise<any[]>;
  getNotifications(userId: string, limit: number): Promise<any[]>;
  updateNotificationRead(id: string): Promise<void>;
  
  // WhatsApp Bookings
  addWhatsAppBooking(bookingData: any): Promise<string>;
  getWhatsAppBookings(): Promise<any[]>;
  getWhatsAppBookingsByVendor(vendorId: string): Promise<any[]>;
  updateWhatsAppBookingStatus(id: string, status: string): Promise<void>;
  updateWhatsAppBookingPayment(id: string, amount: number): Promise<void>;
  
  // Transaction Support
  runTransaction(fn: (adapter: DatabaseAdapter) => Promise<any>): Promise<any>;
}

export class FirestoreAdapter implements DatabaseAdapter {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  async getUser(uid: string) {
    const doc = await this.db.collection("users").doc(uid).get();
    return doc.exists ? { uid: doc.id, ...doc.data() } : null;
  }

  async getUserByEmail(email: string) {
    const snap = await this.db.collection("users").where("email", "==", email).limit(1).get();
    return snap.empty ? null : { uid: snap.docs[0].id, ...snap.docs[0].data() };
  }

  async createUser(uid: string, userData: any) {
    await this.db.collection("users").doc(uid).set(userData);
  }

  async updateUser(uid: string, updateData: any) {
    await this.db.collection("users").doc(uid).update(updateData);
  }

  async getPendingVendors() {
    const snap = await this.db.collection("users").where("vendorStatus", "==", "pending").get();
    return Promise.all(snap.docs.map(async (doc) => {
      const userData = doc.data();
      const vendorDoc = await this.db.collection("vendors").doc(doc.id).get();
      return {
        uid: doc.id,
        ...userData,
        businessDetails: vendorDoc.exists ? vendorDoc.data() : null
      };
    }));
  }

  async getStats() {
    const usersSnap = await this.db.collection("users").where("role", "==", "devotee").get();
    const vendorsSnap = await this.db.collection("users").where("role", "==", "vendor").get();
    const productsSnap = await this.db.collection("products").get();
    const bookingsSnap = await this.db.collection("bookings").get();
    return {
      totalUsers: usersSnap.size,
      totalVendors: vendorsSnap.size,
      totalProducts: productsSnap.size,
      totalBookings: bookingsSnap.size
    };
  }

  async getVendor(vendorId: string) {
    const doc = await this.db.collection("vendors").doc(vendorId).get();
    return doc.exists ? { uid: doc.id, ...doc.data() } : null;
  }

  async createVendor(vendorId: string, vendorData: any) {
    await this.db.collection("vendors").doc(vendorId).set(vendorData);
  }

  async getVendorsPerformance() {
    const vendorsSnap = await this.db.collection("users").where("role", "==", "vendor").get();
    const vendors = vendorsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    return Promise.all(vendors.map(async (vendor: any) => {
      const bookingsSnap = await this.db.collection("bookings").where("vendorId", "==", vendor.uid).get();
      const vendorDoc = await this.db.collection("vendors").doc(vendor.uid).get();
      const vendorData = vendorDoc.exists ? vendorDoc.data() : {};
      return { 
        ...vendor, 
        totalBookings: bookingsSnap.size,
        type: (vendorData?.type as 'priest' | 'temple' | 'shop') || 'shop',
        businessType: vendorData?.type || 'shop'
      };
    }));
  }

  async getProducts(filters: { category?: string; vendorId?: string }) {
    let query: admin.firestore.Query = this.db.collection("products");
    if (filters.category && filters.category !== "all") {
      query = query.where("category", "==", filters.category);
    }
    if (filters.vendorId) {
      query = query.where("vendorId", "==", filters.vendorId);
    }
    const snap = await query.get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addProduct(productData: any) {
    const doc = await this.db.collection("products").add(productData);
    return doc.id;
  }

  async updateProduct(id: string, productData: any) {
    await this.db.collection("products").doc(id).update(productData);
  }

  async deleteProduct(id: string) {
    await this.db.collection("products").doc(id).delete();
  }

  async getPujas(filters: { vendorId?: string }) {
    let query: admin.firestore.Query = this.db.collection("pujas");
    if (filters.vendorId) {
      query = query.where("vendorId", "==", filters.vendorId);
    }
    const snap = await query.get();
    return Promise.all(snap.docs.map(async doc => {
      const pujaData = { id: doc.id, ...doc.data() } as any;
      if (pujaData.vendorId) {
        const vendorDoc = await this.db.collection("vendors").doc(pujaData.vendorId).get();
        if (vendorDoc.exists) pujaData.vendor = vendorDoc.data();
      }
      return pujaData;
    }));
  }

  async getPuja(id: string) {
    const doc = await this.db.collection("pujas").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async addPuja(pujaData: any) {
    const doc = await this.db.collection("pujas").add(pujaData);
    return doc.id;
  }

  async updatePuja(id: string, pujaData: any) {
    await this.db.collection("pujas").doc(id).update(pujaData);
  }

  async deletePuja(id: string) {
    await this.db.collection("pujas").doc(id).delete();
  }

  async getYatras(filters: { vendorId?: string }) {
    let query: admin.firestore.Query = this.db.collection("yatras");
    if (filters.vendorId) {
      query = query.where("vendorId", "==", filters.vendorId);
    }
    const snap = await query.get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getYatra(id: string) {
    const doc = await this.db.collection("yatras").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async addYatra(yatraData: any) {
    const doc = await this.db.collection("yatras").add(yatraData);
    return doc.id;
  }

  async updateYatra(id: string, yatraData: any) {
    await this.db.collection("yatras").doc(id).update(yatraData);
  }

  async deleteYatra(id: string) {
    await this.db.collection("yatras").doc(id).delete();
  }

  async getBookingsByUser(uid: string) {
    const snap = await this.db.collection("bookings").where("userId", "==", uid).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getBookingsByVendor(vendorId: string) {
    const snap = await this.db.collection("bookings").where("vendorId", "==", vendorId).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addBooking(bookingData: any) {
    const doc = await this.db.collection("bookings").add(bookingData);
    return doc.id;
  }

  async updateBookingStatus(id: string, status: string) {
    await this.db.collection("bookings").doc(id).update({ status });
  }

  async updateBookingPaidAmount(id: string, amount: number) {
    await this.db.collection("bookings").doc(id).update({ paidAmount: amount });
  }

  async getBooking(id: string) {
    const doc = await this.db.collection("bookings").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async getOrdersByUser(uid: string) {
    const snap = await this.db.collection("orders").where("userId", "==", uid).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getOrdersByVendor(vendorId: string) {
    const snap = await this.db.collection("orders").orderBy("createdAt", "desc").get();
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((order: any) => order.items.some((item: any) => item.vendorId === vendorId));
  }

  async addOrder(orderData: any) {
    const doc = await this.db.collection("orders").add(orderData);
    return doc.id;
  }

  async getOrder(id: string) {
    const doc = await this.db.collection("orders").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async updateOrderStatus(id: string, status: string, trackingUpdate: any) {
    await this.db.collection("orders").doc(id).update({
      status,
      trackingHistory: admin.firestore.FieldValue.arrayUnion(trackingUpdate)
    });
  }

  async getWallet(vendorId: string) {
    const doc = await this.db.collection("vendor_wallets").doc(vendorId).get();
    return doc.exists ? doc.data() : null;
  }

  async getTransactions(vendorId: string, limit: number) {
    const snap = await this.db.collection("vendor_transactions")
      .where("vendorId", "==", vendorId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateWallet(vendorId: string, earning: number, totalAmount: number, type: string, referenceId: string, commission: number) {
    const walletRef = this.db.collection("vendor_wallets").doc(vendorId);
    await this.db.runTransaction(async (t) => {
      const doc = await t.get(walletRef);
      if (!doc.exists) {
        t.set(walletRef, { balance: earning, totalEarned: earning, payouts: [] });
      } else {
        const data = doc.data()!;
        t.update(walletRef, {
          balance: (data.balance || 0) + earning,
          totalEarned: (data.totalEarned || 0) + earning
        });
      }
      t.set(this.db.collection("vendor_transactions").doc(), {
        vendorId, amount: earning, originalAmount: totalAmount, commission, type, referenceId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  async addPayout(vendorId: string, payout: any) {
    const walletRef = this.db.collection("vendor_wallets").doc(vendorId);
    await this.db.runTransaction(async (t) => {
      const doc = await t.get(walletRef);
      if (!doc.exists || doc.data()!.balance < payout.amount) throw new Error("Insufficient balance");
      t.update(walletRef, {
        balance: doc.data()!.balance - payout.amount
      });
      await this.db.collection("vendor_payouts").add(payout);
    });
  }

  async getPayouts(vendorId?: string) {
    let query: admin.firestore.Query = this.db.collection("vendor_payouts");
    if (vendorId) {
      query = query.where("vendorId", "==", vendorId);
    }
    const snap = await query.orderBy("createdAt", "desc").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updatePayoutStatus(id: string, status: string) {
    await this.db.collection("vendor_payouts").doc(id).update({ status });
  }

  async addNotification(notificationData: any) {
    await this.db.collection("notifications").add(notificationData);
  }

  async getCoupons() {
    const snap = await this.db.collection("coupons").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addCoupon(coupon: any) {
    await this.db.collection("coupons").add(coupon);
  }

  async getFeedback() {
    const snap = await this.db.collection("feedback").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addFeedback(feedback: any) {
    await this.db.collection("feedback").add(feedback);
  }

  async getVisitorStats() {
    const doc = await this.db.collection("stats").doc("visitors").get();
    return doc.exists ? doc.data() : null;
  }

  async updateVisitorStats(stats: any) {
    await this.db.collection("stats").doc("visitors").set(stats);
  }

  async getUsersByRole(role: string): Promise<any[]> {
    let query: admin.firestore.Query = this.db.collection("users");
    if (role && role !== 'all') {
      query = query.where("role", "==", role);
    }
    const snap = await query.get();
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  }

  async getNotifications(userId: string, limit: number): Promise<any[]> {
    const snap = await this.db.collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateNotificationRead(id: string): Promise<void> {
    await this.db.collection("notifications").doc(id).update({ read: true });
  }

  async addWhatsAppBooking(bookingData: any) {
    const doc = await this.db.collection("whatsapp_bookings").add({
      ...bookingData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return doc.id;
  }

  async getWhatsAppBookings() {
    const snap = await this.db.collection("whatsapp_bookings").orderBy("createdAt", "desc").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getWhatsAppBookingsByVendor(vendorId: string) {
    const snap = await this.db.collection("whatsapp_bookings")
      .where("vendorId", "==", vendorId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateWhatsAppBookingStatus(id: string, status: string) {
    await this.db.collection("whatsapp_bookings").doc(id).update({ status });
  }

  async updateWhatsAppBookingPayment(id: string, amount: number) {
    await this.db.collection("whatsapp_bookings").doc(id).update({ paidAmount: amount });
  }

  async runTransaction(fn: (adapter: DatabaseAdapter) => Promise<any>) {
    return this.db.runTransaction(async (t) => {
      // This is a bit tricky because Firestore transactions use a Transaction object
      // For now, we'll just pass the adapter itself, but in a real app we'd need to wrap the transaction
      return fn(this);
    });
  }
}

export class MySQLAdapter implements DatabaseAdapter {
  private pool: mysql.Pool;

  constructor(pool: mysql.Pool) {
    this.pool = pool;
  }

  private async query(sql: string, params: any[] = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows as any[];
  }

  async getUser(uid: string) {
    const rows = await this.query("SELECT * FROM users WHERE uid = ?", [uid]);
    return rows.length ? rows[0] : null;
  }

  async getUserByEmail(email: string) {
    const rows = await this.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows.length ? rows[0] : null;
  }

  async createUser(uid: string, userData: any) {
    const { displayName, email, password, photoURL, address, role, createdAt } = userData;
    await this.query(
      "INSERT INTO users (uid, displayName, email, password, photoURL, address, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [uid, displayName, email, password, photoURL, address, role, createdAt || new Date()]
    );
  }

  async updateUser(uid: string, updateData: any) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    await this.query(`UPDATE users SET ${setClause} WHERE uid = ?`, [...values, uid]);
  }

  async getPendingVendors() {
    const rows = await this.query("SELECT * FROM users WHERE vendorStatus = 'pending'");
    return Promise.all(rows.map(async (user) => {
      const vendorRows = await this.query("SELECT * FROM vendors WHERE userId = ?", [user.uid]);
      return { ...user, businessDetails: vendorRows.length ? vendorRows[0] : null };
    }));
  }

  async getStats() {
    const [users] = await this.query("SELECT COUNT(*) as count FROM users WHERE role = 'devotee'");
    const [vendors] = await this.query("SELECT COUNT(*) as count FROM users WHERE role = 'vendor'");
    const [products] = await this.query("SELECT COUNT(*) as count FROM products");
    const [bookings] = await this.query("SELECT COUNT(*) as count FROM bookings");
    return {
      totalUsers: users.count,
      totalVendors: vendors.count,
      totalProducts: products.count,
      totalBookings: bookings.count
    };
  }

  async getVendor(vendorId: string) {
    const rows = await this.query("SELECT * FROM vendors WHERE userId = ?", [vendorId]);
    return rows.length ? rows[0] : null;
  }

  async createVendor(vendorId: string, vendorData: any) {
    const { name, type, description, rating, reviews, joinedAt } = vendorData;
    await this.query(
      "INSERT INTO vendors (userId, name, type, description, rating, reviews, joinedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [vendorId, name, type, description, rating || 0, reviews || 0, joinedAt || new Date()]
    );
  }

  async getVendorsPerformance() {
    const vendors = await this.query("SELECT * FROM users WHERE role = 'vendor'");
    return Promise.all(vendors.map(async (vendor: any) => {
      const [bookings] = await this.query("SELECT COUNT(*) as count FROM bookings WHERE vendorId = ?", [vendor.uid]);
      const vendorDetails = await this.query("SELECT * FROM vendors WHERE userId = ?", [vendor.uid]);
      return { 
        ...vendor, 
        totalBookings: bookings.count,
        type: (vendorDetails.length ? vendorDetails[0].type : 'shop') as 'priest' | 'temple' | 'shop',
        businessType: vendorDetails.length ? vendorDetails[0].type : 'shop'
      };
    }));
  }

  async getProducts(filters: { category?: string; vendorId?: string }) {
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    if (filters.category && filters.category !== "all") {
      sql += " AND category = ?";
      params.push(filters.category);
    }
    if (filters.vendorId) {
      sql += " AND vendorId = ?";
      params.push(filters.vendorId);
    }
    return this.query(sql, params);
  }

  async addProduct(productData: any) {
    const { vendorId, name, description, price, category, templeName, weightOptions, stock, rating, image } = productData;
    const [result] = await this.pool.execute(
      "INSERT INTO products (vendorId, name, description, price, category, templeName, weightOptions, stock, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [vendorId, name, description, price, category, templeName, JSON.stringify(weightOptions), stock, rating, image]
    );
    return (result as any).insertId.toString();
  }

  async updateProduct(id: string, productData: any) {
    const keys = Object.keys(productData);
    const values = Object.values(productData).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    await this.query(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
  }

  async deleteProduct(id: string) {
    await this.query("DELETE FROM products WHERE id = ?", [id]);
  }

  async getPujas(filters: { vendorId?: string }) {
    let sql = "SELECT * FROM pujas WHERE 1=1";
    const params = [];
    if (filters.vendorId) {
      sql += " AND vendorId = ?";
      params.push(filters.vendorId);
    }
    const rows = await this.query(sql, params);
    return Promise.all(rows.map(async (puja) => {
      if (puja.vendorId) {
        const vendorRows = await this.query("SELECT * FROM vendors WHERE userId = ?", [puja.vendorId]);
        if (vendorRows.length) puja.vendor = vendorRows[0];
      }
      return puja;
    }));
  }

  async getPuja(id: string) {
    const rows = await this.query("SELECT * FROM pujas WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async addPuja(pujaData: any) {
    const { vendorId, title, description, onlinePrice, offlinePrice, duration, samagriList } = pujaData;
    const [result] = await this.pool.execute(
      "INSERT INTO pujas (vendorId, title, description, onlinePrice, offlinePrice, duration, samagriList) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [vendorId, title, description, onlinePrice, offlinePrice, duration, samagriList]
    );
    return (result as any).insertId.toString();
  }

  async updatePuja(id: string, pujaData: any) {
    const keys = Object.keys(pujaData);
    const values = Object.values(pujaData);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    await this.query(`UPDATE pujas SET ${setClause} WHERE id = ?`, [...values, id]);
  }

  async deletePuja(id: string) {
    await this.query("DELETE FROM pujas WHERE id = ?", [id]);
  }

  async getYatras(filters: { vendorId?: string }) {
    let sql = "SELECT * FROM yatras WHERE 1=1";
    const params = [];
    if (filters.vendorId) {
      sql += " AND vendorId = ?";
      params.push(filters.vendorId);
    }
    return this.query(sql, params);
  }

  async getYatra(id: string) {
    const rows = await this.query("SELECT * FROM yatras WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async addYatra(yatraData: any) {
    const { vendorId, title, description, price, duration, location, category, rating, images, itinerary, included, excluded } = yatraData;
    const [result] = await this.pool.execute(
      "INSERT INTO yatras (vendorId, title, description, price, duration, location, category, rating, images, itinerary, included, excluded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [vendorId, title, description, price, duration, location, category, rating, JSON.stringify(images), JSON.stringify(itinerary), JSON.stringify(included), JSON.stringify(excluded)]
    );
    return (result as any).insertId.toString();
  }

  async updateYatra(id: string, yatraData: any) {
    const keys = Object.keys(yatraData);
    const values = Object.values(yatraData).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    await this.query(`UPDATE yatras SET ${setClause} WHERE id = ?`, [...values, id]);
  }

  async deleteYatra(id: string) {
    await this.query("DELETE FROM yatras WHERE id = ?", [id]);
  }

  async getBookingsByUser(uid: string) {
    return this.query("SELECT * FROM bookings WHERE userId = ?", [uid]);
  }

  async getBookingsByVendor(vendorId: string) {
    return this.query("SELECT * FROM bookings WHERE vendorId = ?", [vendorId]);
  }

  async addBooking(bookingData: any) {
    const { userId, serviceId, vendorId, type, isOnline, bringSamagri, date, timeSlot, status, totalAmount, samagriList } = bookingData;
    const [result] = await this.pool.execute(
      "INSERT INTO bookings (userId, serviceId, vendorId, type, isOnline, bringSamagri, date, timeSlot, status, totalAmount, samagriList) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, serviceId, vendorId, type, isOnline, bringSamagri, date, timeSlot, status, totalAmount, samagriList]
    );
    return (result as any).insertId.toString();
  }

  async updateBookingStatus(id: string, status: string) {
    await this.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
  }

  async updateBookingPaidAmount(id: string, amount: number) {
    await this.query("UPDATE bookings SET paidAmount = ? WHERE id = ?", [amount, id]);
  }

  async getBooking(id: string) {
    const rows = await this.query("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async getOrdersByUser(uid: string) {
    const orders = await this.query("SELECT * FROM orders WHERE userId = ?", [uid]);
    return Promise.all(orders.map(async (order) => {
      const items = await this.query("SELECT * FROM order_items WHERE orderId = ?", [order.id]);
      return { ...order, items };
    }));
  }

  async getOrdersByVendor(vendorId: string) {
    const orders = await this.query(`
      SELECT DISTINCT o.* FROM orders o
      JOIN order_items oi ON o.id = oi.orderId
      JOIN products p ON oi.productId = p.id
      WHERE p.vendorId = ?
      ORDER BY o.createdAt DESC
    `, [vendorId]);
    return Promise.all(orders.map(async (order) => {
      const items = await this.query("SELECT * FROM order_items WHERE orderId = ?", [order.id]);
      return { ...order, items };
    }));
  }

  async addOrder(orderData: any) {
    const { userId, totalAmount, status, shippingAddress, createdAt, items } = orderData;
    const [result] = await this.pool.execute(
      "INSERT INTO orders (userId, totalAmount, status, shippingAddress, createdAt) VALUES (?, ?, ?, ?, ?)",
      [userId, totalAmount, status, shippingAddress, createdAt || new Date()]
    );
    const orderId = (result as any).insertId;
    for (const item of items) {
      await this.query(
        "INSERT INTO order_items (orderId, productId, quantity, price, selectedOption) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price, item.selectedOption]
      );
    }
    return orderId.toString();
  }

  async getOrder(id: string) {
    const rows = await this.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (!rows.length) return null;
    const items = await this.query("SELECT * FROM order_items WHERE orderId = ?", [id]);
    return { ...rows[0], items };
  }

  async updateOrderStatus(id: string, status: string, trackingUpdate: any) {
    await this.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    // MySQL schema doesn't have trackingHistory column yet, we could add it as JSON
  }

  async getWallet(vendorId: string) {
    const rows = await this.query("SELECT * FROM vendor_wallets WHERE vendorId = ?", [vendorId]);
    return rows.length ? rows[0] : null;
  }

  async getTransactions(vendorId: string, limit: number) {
    return this.query("SELECT * FROM vendor_transactions WHERE vendorId = ? ORDER BY createdAt DESC LIMIT ?", [vendorId, limit]);
  }

  async updateWallet(vendorId: string, earning: number, totalAmount: number, type: string, referenceId: string, commission: number) {
    const wallet = await this.getWallet(vendorId);
    if (!wallet) {
      await this.query("INSERT INTO vendor_wallets (vendorId, balance, totalEarned) VALUES (?, ?, ?)", [vendorId, earning, earning]);
    } else {
      await this.query("UPDATE vendor_wallets SET balance = balance + ?, totalEarned = totalEarned + ? WHERE vendorId = ?", [earning, earning, vendorId]);
    }
    await this.query(
      "INSERT INTO vendor_transactions (vendorId, amount, originalAmount, commission, type, referenceId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [vendorId, earning, totalAmount, commission, type, referenceId, new Date()]
    );
  }

  async addPayout(vendorId: string, payout: any) {
    const { id, amount, status, bankDetails, createdAt } = payout;
    await this.query("UPDATE vendor_wallets SET balance = balance - ? WHERE vendorId = ?", [amount, vendorId]);
    await this.query(
      "INSERT INTO vendor_payouts (id, vendorId, amount, status, bankDetails, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [id || Math.random().toString(36).substr(2, 9), vendorId, amount, status, JSON.stringify(bankDetails), createdAt]
    );
  }

  async getPayouts(vendorId?: string) {
    let sql = "SELECT * FROM vendor_payouts";
    const params = [];
    if (vendorId) {
      sql += " WHERE vendorId = ?";
      params.push(vendorId);
    }
    sql += " ORDER BY createdAt DESC";
    return this.query(sql, params);
  }

  async updatePayoutStatus(id: string, status: string) {
    await this.query("UPDATE vendor_payouts SET status = ? WHERE id = ?", [status, id]);
  }

  async addNotification(notificationData: any) {
    const { userId, title, message, type, read, createdAt } = notificationData;
    await this.query(
      "INSERT INTO notifications (userId, title, message, type, `read`, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, title, message, type, read || false, createdAt || new Date()]
    );
  }

  async getCoupons() {
    return this.query("SELECT * FROM coupons");
  }

  async addCoupon(coupon: any) {
    const { code, discount, type, minAmount, active } = coupon;
    await this.query(
      "INSERT INTO coupons (code, discount, type, minAmount, active) VALUES (?, ?, ?, ?, ?)",
      [code, discount, type, minAmount, active]
    );
  }

  async getFeedback() {
    return this.query("SELECT * FROM feedback");
  }

  async addFeedback(feedback: any) {
    const { name, city, rating, message, createdAt } = feedback;
    await this.query(
      "INSERT INTO feedback (name, city, rating, message, createdAt) VALUES (?, ?, ?, ?, ?)",
      [name, city, rating, message, createdAt || new Date()]
    );
  }

  async getVisitorStats() {
    const rows = await this.query("SELECT * FROM stats WHERE id = 'visitors'");
    return rows.length ? rows[0] : null;
  }

  async updateVisitorStats(stats: any) {
    const { total, new: newCount, lastReset } = stats;
    const existing = await this.getVisitorStats();
    if (!existing) {
      await this.query("INSERT INTO stats (id, total, `new`, lastReset) VALUES ('visitors', ?, ?, ?)", [total, newCount, lastReset]);
    } else {
      await this.query("UPDATE stats SET total = ?, `new` = ?, lastReset = ? WHERE id = 'visitors'", [total, newCount, lastReset]);
    }
  }

  async getUsersByRole(role: string) {
    let sql = "SELECT * FROM users";
    const params = [];
    if (role && role !== 'all') {
      sql += " WHERE role = ?";
      params.push(role);
    }
    return this.query(sql, params);
  }

  async getNotifications(userId: string, limit: number): Promise<any[]> {
    return this.query("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?", [userId, limit]);
  }

  async updateNotificationRead(id: string): Promise<void> {
    await this.query("UPDATE notifications SET `read` = 1 WHERE id = ?", [id]);
  }

  async addWhatsAppBooking(bookingData: any) {
    const { userId, vendorId, pujaTitle, status, userLocation, distance, whatsappNumber } = bookingData;
    const [result] = await this.pool.execute(
      "INSERT INTO whatsapp_bookings (userId, vendorId, pujaTitle, status, userLocation, distance, whatsappNumber, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, vendorId, pujaTitle, status, JSON.stringify(userLocation), distance, whatsappNumber, new Date()]
    );
    return (result as any).insertId.toString();
  }

  async getWhatsAppBookings() {
    return this.query("SELECT * FROM whatsapp_bookings ORDER BY createdAt DESC");
  }

  async getWhatsAppBookingsByVendor(vendorId: string) {
    return this.query("SELECT * FROM whatsapp_bookings WHERE vendorId = ? ORDER BY createdAt DESC", [vendorId]);
  }

  async updateWhatsAppBookingStatus(id: string, status: string) {
    await this.query("UPDATE whatsapp_bookings SET status = ? WHERE id = ?", [status, id]);
  }

  async updateWhatsAppBookingPayment(id: string, amount: number) {
    await this.query("UPDATE whatsapp_bookings SET paidAmount = ? WHERE id = ?", [amount, id]);
  }

  async runTransaction(fn: (adapter: DatabaseAdapter) => Promise<any>) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    try {
      const result = await fn(this);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}
