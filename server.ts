import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";
import mysql from "mysql2/promise";
import { DatabaseAdapter, FirestoreAdapter, MySQLAdapter } from "./src/lib/db.ts";
import rateLimit from "express-rate-limit";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
}) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adapter: DatabaseAdapter;
let firebaseConfig: any = {};

async function initDatabase() {
  const dbType = process.env.DB_TYPE || 'firestore';
  
  if (dbType === 'mysql') {
    console.log("Initializing MySQL Adapter...");
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'punyaseva',
      port: Number(process.env.MYSQL_PORT) || 3306,
    });
    adapter = new MySQLAdapter(pool);
    console.log("MySQL Adapter initialized.");
    return;
  }

  // Default to Firestore
  console.log("Initializing Firestore Adapter...");
  const firebaseConfigPath = path.join(__dirname, "firebase-applet-config.json");
  try {
    const configData = await fs.readFile(firebaseConfigPath, "utf8");
    firebaseConfig = JSON.parse(configData);
    console.log("[Firebase] Loaded config from JSON.");
  } catch (e) {
    console.error("[Firebase] Failed to read firebase-applet-config.json", e);
  }

  // Precedence: We MUST prioritize the environment's project ID if available (deployment/preview context).
  // Fall back to the config file if environment is not set (local dev).
  const envProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || process.env.PROJECT_ID;
  const configProjectId = firebaseConfig.projectId;
  const databaseIdFromConfig = firebaseConfig.firestoreDatabaseId;

  console.log(`[Firebase] process.env.GOOGLE_CLOUD_PROJECT: ${process.env.GOOGLE_CLOUD_PROJECT}`);
  console.log(`[Firebase] process.env.FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`[Firebase] process.env.PROJECT_ID: ${process.env.PROJECT_ID}`);
  console.log(`[Firebase] firebaseConfig.projectId: ${configProjectId}`);
  console.log(`[Firebase] Config Database ID: ${databaseIdFromConfig}`);

  if (admin.apps.length === 0) {
    try {
      if (envProjectId) {
        console.log(`[Firebase] Initializing Admin with environment project: ${envProjectId}`);
        admin.initializeApp({ projectId: envProjectId });
      } else if (configProjectId) {
        console.log(`[Firebase] No environment project ID found. Initializing Admin with config project: ${configProjectId}`);
        admin.initializeApp({ projectId: configProjectId });
      } else {
        console.log("[Firebase] No project ID found in env or config. Using default initialization (ADC).");
        admin.initializeApp();
      }
    } catch (e) {
      console.error("[Firebase] Admin initialization failed", (e as Error).message);
      // Fallback to naked init if explicit init failed and we haven't initialized yet
      if (admin.apps.length === 0) {
        console.log("[Firebase] Attempting naked initialization as fallback...");
        admin.initializeApp();
      }
    }
  }

  const effectiveProjectId = admin.app().options.projectId || envProjectId || configProjectId;
  console.log(`[Firebase] Effective Project ID: ${effectiveProjectId}`);

  let db: admin.firestore.Firestore;
  
  const tryConnect = async (dbInstance: admin.firestore.Firestore, label: string) => {
    console.log(`[Firebase] Testing connection to ${label}...`);
    // Use a light read check on a specific path
    await dbInstance.collection("_health_").limit(1).get();
    console.log(`[Firebase] Successfully connected to ${label}.`);
    return true;
  };

  const tryInitWithDb = async (dbId: string | undefined) => {
    if (dbId && dbId !== "(default)") {
      console.log(`[Firebase] Accessing named database: ${dbId}`);
      db = getFirestore(admin.app(), dbId);
    } else {
      console.log("[Firebase] Accessing (default) database");
      db = admin.firestore();
    }
    await tryConnect(db, dbId || "(default)");
    adapter = new FirestoreAdapter(db);
    return true;
  };

  try {
    // Attempt 1: Using configured Database ID
    await tryInitWithDb(databaseIdFromConfig);
    console.log("Firestore Adapter initialized.");
  } catch (e) {
    console.warn(`[Firebase] Attempt with database "${databaseIdFromConfig || '(default)'}" failed:`, (e as Error).message);
    
    // Fallback 1: If it was a named database, try the (default) one in the SAME project
    if (databaseIdFromConfig && databaseIdFromConfig !== "(default)") {
      console.log("[Firebase] Fallback 1: Attempting (default) database in same project...");
      try {
        await tryInitWithDb("(default)");
        console.log("[Firebase] Fallback 1 successful.");
        return;
      } catch (f1Err) {
        console.warn("[Firebase] Fallback 1 failed:", (f1Err as Error).message);
      }
    }

    // If we reach here, we are in trouble.
    console.error("[Firebase] ALL Firestore connection attempts failed.");
    throw e;
  }
}

async function startServer() {
  console.log("Starting server initialization...");
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  try {
    await initDatabase();
  } catch (error) {
    console.error("Database initialization failed, but starting server anyway:", (error as Error).message);
  }

  // Health check early
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: !!adapter });
  });

  app.use(express.json());
  console.log("Express middleware configured.");

  app.post("/api/admin/send-announcement", async (req, res) => {
    const { title, message, targetRole } = req.body;
    try {
      const users = await adapter.getUsersByRole(targetRole);
        const sendPromises = users.map((user: any) => 
          createNotification(user.uid || user.id, title, message, 'system')
        );
        
        await Promise.all(sendPromises);
        res.json({ success: true, count: users.length });
      } catch (error) {
        console.error("[API] POST /api/admin/send-announcement error:", error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    app.post("/api/users/register-fcm-token", async (req, res) => {
      const { userId, token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ error: "userId and token are required" });
      }
      try {
        await adapter.updateUser(userId, { fcmToken: token });
        res.json({ success: true });
      } catch (error) {
        console.error("[API] POST /api/users/register-fcm-token error:", error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- AUTO SETUP DATABASE ---
    const setupDatabase = async () => {
      try {
        console.log("Checking database state...");
        
        // Ensure Admin User exists
        const adminUser = await adapter.getUserByEmail("pg2331427@gmail.com");
        if (!adminUser) {
          console.log("Seeding admin user...");
          await adapter.createUser("admin_1", {
            uid: "admin_1",
            email: "pg2331427@gmail.com",
            password: await bcrypt.hash("admin123", 10),
            displayName: "Admin User",
            role: "admin",
            createdAt: new Date()
          });
        }

        // Seed Stats
        const stats = await adapter.getVisitorStats();
        if (!stats) {
          await adapter.updateVisitorStats({
            total: 0,
            new: 0,
            lastReset: new Date()
          });
        }

        const users = await adapter.getUsersByRole('all');
        // If only the admin exists or no users, seed the rest
        if (users.length <= 1) {
          console.log("Seeding initial data...");
          
          // Seed other Users
          const initialUsers = [
            {
              uid: "user_1",
              email: "user@test.com",
              password: await bcrypt.hash("user123", 10),
              displayName: "Test User",
              role: "devotee",
              createdAt: new Date()
            },
            {
              uid: "vendor_1",
              email: "vendor@test.com",
              password: await bcrypt.hash("vendor123", 10),
              displayName: "Test Vendor",
              role: "vendor",
              createdAt: new Date()
            }
          ];
          for (const user of initialUsers) {
            const existing = await adapter.getUser(user.uid);
            if (!existing) {
              await adapter.createUser(user.uid, user);
            }
          }

          // Seed Products
          const products = [
            {
              name: "Premium Brass Diya",
              description: "Handcrafted brass diya for your daily puja needs.",
              price: 499,
              category: "Puja Essentials",
              stock: 50,
              rating: 4.8,
              image: "https://picsum.photos/seed/diya/400/400",
              vendorId: "system"
            },
            {
              name: "Sandalwood Incense Sticks",
              description: "Pure sandalwood fragrance for a peaceful atmosphere.",
              price: 150,
              category: "Incense",
              stock: 100,
              rating: 4.5,
              image: "https://picsum.photos/seed/incense/400/400",
              vendorId: "system"
            }
          ];
          for (const product of products) {
            await adapter.addProduct({ ...product, createdAt: new Date() });
          }

          // Seed Pujas
          const pujas = [
            {
              title: "Ganesh Puja",
              description: "Seek blessings from Lord Ganesha for new beginnings.",
              onlinePrice: 1100,
              offlinePrice: 2100,
              duration: "1.5 Hours",
              vendorId: "system",
              samagriList: "Flowers, Sweets, Incense"
            }
          ];
          for (const puja of pujas) {
            await adapter.addPuja({ ...puja, createdAt: new Date() });
          }

          // Seed Feedback
          const feedback = [
            {
              name: "Rahul Sharma",
              city: "Delhi",
              rating: 5,
              message: "Amazing experience! The puja was performed with great devotion.",
              createdAt: new Date()
            },
            {
              name: "Priya Singh",
              city: "Mumbai",
              rating: 4,
              message: "Very convenient service. Pandit ji was very knowledgeable.",
              createdAt: new Date()
            }
          ];
          for (const f of feedback) {
            await adapter.addFeedback(f);
          }

          // Seed Coupons
          const coupons = [
            { code: "DIVINE10", discount: 10, type: "percentage", minAmount: 500, active: true },
            { code: "WELCOME50", discount: 50, type: "fixed", minAmount: 200, active: true },
            { code: "FESTIVE20", discount: 20, type: "percentage", minAmount: 1000, active: true }
          ];
          for (const coupon of coupons) {
            await adapter.addCoupon(coupon);
          }

          console.log("Database seeded successfully.");
        } else {
          console.log("Database already has data, skipping seed.");
        }
      } catch (error) {
        console.error("Auto-setup database error:", error);
      }
    };

    // Run database setup in background
    setupDatabase().catch(e => console.error("Background database setup failed:", e));
    
    // --- STRIPE ENDPOINTS ---
    app.post("/api/create-payment-intent", async (req, res) => {
      const { amount, currency = "inr" } = req.body;
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          // Fallback for demo if key is missing
          return res.json({ clientSecret: "demo_secret_" + Date.now() });
        }
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Stripe expects amount in cents/paisa
          currency,
          automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("[Stripe] Error creating payment intent:", error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- AUTH ENDPOINTS ---
    const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many attempts, try again in 15 minutes" } });
    app.post("/api/auth/register", authLimiter, async (req, res) => {
      const { email, password, displayName, role } = req.body;
      try {
      const existingUser = await adapter.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = `custom_${Date.now()}`;
      
      let userRole = role || 'devotee';
      if (email === 'pg2331427@gmail.com') {
        userRole = 'admin';
      }
      
      const userData = {
        uid,
        email,
        password: hashedPassword,
        displayName,
        role: userRole,
        createdAt: new Date()
      };

      await adapter.createUser(uid, userData);
      
      res.json({ success: true, uid });
    } catch (error) {
      console.error("[API] POST /api/auth/register error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

    app.post("/api/auth/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await adapter.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.password) {
        return res.status(401).json({ message: "Please login with Google" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (error) {
      console.error("[API] POST /api/auth/login error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

    // Users
    app.get("/api/users/:uid", async (req, res) => {
    const { uid } = req.params;
    if (!uid || uid === "undefined" || uid === "null") {
      return res.status(400).json({ message: "Invalid UID" });
    }
    try {
      const user = await adapter.getUser(uid);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _pw, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      console.error(`[API] GET /api/users/${uid} error:`, error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/users/:uid", async (req, res) => {
    const { uid } = req.params;
    const { address, bio, bannerURL } = req.body;
    try {
      const updateData: any = {};
      if (address !== undefined) updateData.address = address;
      if (bio !== undefined) updateData.bio = bio;
      if (bannerURL !== undefined) updateData.bannerURL = bannerURL;

      await adapter.updateUser(uid, updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/users/:uid error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.put("/api/users/:uid/address", async (req, res) => {
    const { address } = req.body;
    try {
      await adapter.updateUser(req.params.uid, { address });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/users/:uid/address error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await adapter.getUsersByRole('vendor');
      const vendorDetails = await Promise.all(vendors.map(async (v: any) => {
        const details = await adapter.getVendor(v.uid);
        return { ...v, ...details };
      }));
      res.json(vendorDetails);
    } catch (error) {
      console.error("[API] GET /api/vendors error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/whatsapp-bookings", async (req, res) => {
    try {
      const bookingId = await adapter.addWhatsAppBooking(req.body);
      res.json({ success: true, bookingId });
    } catch (error) {
      console.error("[API] POST /api/whatsapp-bookings error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/whatsapp-bookings", async (req, res) => {
    try {
      const bookings = await adapter.getWhatsAppBookings();
      res.json(bookings);
    } catch (error) {
      console.error("[API] GET /api/whatsapp-bookings error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/whatsapp-bookings/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      await adapter.updateWhatsAppBookingStatus(req.params.id, status);
      
      // Fetch booking to get userId and vendorId
      const bookings = await adapter.getWhatsAppBookings();
      const booking = bookings.find(b => b.id === req.params.id);
      
      if (booking) {
        const statusMsg = status === 'approved' ? 'approved' : 'rejected';
        await createNotification(booking.userId, "Booking Update", `Your WhatsApp booking request for ${booking.pujaTitle} has been ${statusMsg}.`, "booking");
        await createNotification(booking.vendorId, "Booking Update", `You have ${statusMsg} the WhatsApp booking request for ${booking.pujaTitle}.`, "booking");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/whatsapp-bookings/:id/status error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/whatsapp-bookings/:id/payment", async (req, res) => {
    const { amount } = req.body;
    try {
      const bookings = await adapter.getWhatsAppBookings();
      const booking = bookings.find(b => b.id === req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const newPaidAmount = (booking.paidAmount || 0) + Number(amount);
      await adapter.updateWhatsAppBookingPayment(req.params.id, newPaidAmount);

      // If paid at least half, notify both
      if (newPaidAmount >= (booking.totalAmount || 0) / 2 && (booking.paidAmount || 0) < (booking.totalAmount || 0) / 2) {
        await createNotification(booking.userId, "Payment Received", "We have received at least 50% of your WhatsApp booking amount. Your booking is now fully confirmed.", "booking");
        await createNotification(booking.vendorId, "Payment Update", "The user has paid at least 50% of the WhatsApp booking amount.", "booking");
      }

      res.json({ success: true, paidAmount: newPaidAmount });
    } catch (error) {
      console.error("[API] PATCH /api/whatsapp-bookings/:id/payment error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/whatsapp-bookings/:vendorId", async (req, res) => {
    try {
      const bookings = await adapter.getWhatsAppBookingsByVendor(req.params.vendorId);
      res.json(bookings);
    } catch (error) {
      console.error("[API] GET /api/vendor/whatsapp-bookings/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendors/:vendorId", async (req, res) => {
    const { vendorId } = req.params;
    try {
      const vendorData = await adapter.getVendor(vendorId);
      const userData = await adapter.getUser(vendorId);
      
      if (!vendorData || !userData) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Merge data for the profile
      res.json({
        ...userData,
        ...vendorData,
        uid: vendorId // Ensure UID is correct
      });
    } catch (error) {
      console.error(`[API] GET /api/vendors/${vendorId} error:`, error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/vendor/register", async (req, res) => {
    const { userId, businessName, businessType, description } = req.body;
    try {
      await adapter.updateUser(userId, {
        role: 'vendor',
        vendorStatus: 'pending'
      });

      await adapter.createVendor(userId, {
        name: businessName,
        type: businessType,
        description,
        userId,
        rating: 0,
        reviews: 0,
        joinedAt: new Date()
      });

      await createNotification(userId, "Vendor Registration", "Your vendor registration request has been submitted and is pending approval.", "system");
      
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/vendor/register error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await adapter.getStats();
      res.json(stats);
    } catch (error) {
      console.error("[API] GET /api/admin/stats error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/vendors-performance", async (req, res) => {
    try {
      const performanceData = await adapter.getVendorsPerformance();
      res.json(performanceData);
    } catch (error) {
      console.error("[API] GET /api/admin/vendors-performance error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/pending-vendors", async (req, res) => {
    try {
      const pendingVendors = await adapter.getPendingVendors();
      res.json(pendingVendors);
    } catch (error) {
      console.error("[API] GET /api/admin/pending-vendors error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/admin/approve-vendor", async (req, res) => {
    const { vendorId } = req.body;
    try {
      await adapter.updateUser(vendorId, {
        vendorStatus: 'approved'
      });
      await createNotification(vendorId, "Vendor Approved", "Congratulations! Your vendor registration has been approved. You can now start adding products and pujas.", "system");
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/admin/approve-vendor error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/admin/reject-vendor", async (req, res) => {
    const { vendorId, reason } = req.body;
    try {
      await adapter.updateUser(vendorId, {
        vendorStatus: 'rejected',
        role: 'devotee'
      });
      await createNotification(vendorId, "Vendor Registration Rejected", `Your vendor registration request was rejected. Reason: ${reason || 'Not specified'}`, "system");
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/admin/reject-vendor error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/payouts", async (req, res) => {
    try {
      const payouts = await adapter.getPayouts();
      res.json(payouts);
    } catch (error) {
      console.error("[API] GET /api/admin/payouts error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/admin/payouts/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      await adapter.updatePayoutStatus(req.params.id, status);
      
      // Get payout details to notify vendor
      const payouts = await adapter.getPayouts();
      const payout = payouts.find(p => p.id === req.params.id);
      if (payout) {
        await createNotification(payout.vendorId, "Payout Update", `Your payout request for ₹${payout.amount} has been ${status}.`, 'system');
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/admin/payouts/:id/status error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, vendorId } = req.query;
      const products = await adapter.getProducts({ 
        category: category as string, 
        vendorId: vendorId as string 
      });
      res.json(products);
    } catch (error) {
      console.error("[API] GET /api/products error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/products", async (req, res) => {
    const { name, description, price, category, stock, rating, image, vendorId, templeName, weightOptions } = req.body;
    try {
      await adapter.addProduct({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        rating: Number(rating),
        image,
        vendorId: vendorId || 'system',
        templeName,
        weightOptions,
        createdAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/products error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, description, price, category, stock, rating, image, templeName, weightOptions } = req.body;
    try {
      await adapter.updateProduct(req.params.id, {
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        rating: Number(rating),
        image,
        templeName,
        weightOptions
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/products/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await adapter.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] DELETE /api/products/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Pujas
  app.get("/api/pujas", async (req, res) => {
    try {
      const { vendorId } = req.query;
      const pujas = await adapter.getPujas({ vendorId: vendorId as string });
      res.json(pujas);
    } catch (error) {
      console.error("[API] GET /api/pujas error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/pujas", async (req, res) => {
    const { title, description, onlinePrice, offlinePrice, duration, vendorId, samagriIncluded, isOnline, rating } = req.body;
    try {
      await adapter.addPuja({
        title,
        description,
        onlinePrice: Number(onlinePrice),
        offlinePrice: offlinePrice ? Number(offlinePrice) : null,
        duration,
        vendorId: vendorId || 'system',
        samagriIncluded: Boolean(samagriIncluded),
        isOnline: Boolean(isOnline),
        rating: rating ? Number(rating) : 0,
        createdAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/pujas error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/pujas/:id", async (req, res) => {
    try {
      const puja = await adapter.getPuja(req.params.id);
      if (!puja) return res.status(404).json({ message: "Puja not found" });
      res.json(puja);
    } catch (error) {
      console.error("[API] GET /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/pujas/:id", async (req, res) => {
    const { title, description, onlinePrice, offlinePrice, duration, samagriIncluded, isOnline, rating } = req.body;
    try {
      await adapter.updatePuja(req.params.id, {
        title,
        description,
        onlinePrice: Number(onlinePrice),
        offlinePrice: offlinePrice ? Number(offlinePrice) : null,
        duration,
        samagriIncluded: Boolean(samagriIncluded),
        isOnline: Boolean(isOnline),
        rating: rating ? Number(rating) : 0
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/pujas/:id", async (req, res) => {
    try {
      await adapter.deletePuja(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] DELETE /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Yatras
  app.get("/api/yatras", async (req, res) => {
    try {
      const { vendorId } = req.query;
      const yatras = await adapter.getYatras({ vendorId: vendorId as string });
      res.json(yatras);
    } catch (error) {
      console.error("[API] GET /api/yatras error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/yatras", async (req, res) => {
    const { title, description, price, duration, location, vendorId, category, rating, images, itinerary, included, excluded } = req.body;
    try {
      await adapter.addYatra({
        title,
        description,
        price: Number(price),
        duration,
        location,
        vendorId: vendorId || 'system',
        category,
        rating: rating ? Number(rating) : 0,
        images: images || [],
        itinerary: itinerary || [],
        included: included || [],
        excluded: excluded || [],
        createdAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/yatras error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Bookings
  app.get("/api/bookings/:uid", async (req, res) => {
    try {
      const bookings = await adapter.getBookingsByUser(req.params.uid);
      res.json(bookings);
    } catch (error) {
      console.error("[API] GET /api/bookings/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/bookings/:vendorId", async (req, res) => {
    try {
      const bookings = await adapter.getBookingsByVendor(req.params.vendorId);
      res.json(bookings);
    } catch (error) {
      console.error("[API] GET /api/vendor/bookings/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Commission Logic
  const COMMISSION_PERCENT = 10;

  async function updateVendorWallet(vendorId: string, amount: number, type: 'order' | 'booking', referenceId: string) {
    if (!vendorId || vendorId === 'system') return;
    const earning = amount * (1 - COMMISSION_PERCENT / 100);
    const commission = amount - earning;
    
    try {
      await adapter.updateWallet(vendorId, earning, amount, type, referenceId, commission);
    } catch (err) {
      console.error("Error updating vendor wallet:", err);
    }
  }

  app.get("/api/vendor/wallet/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const wallet = await adapter.getWallet(vendorId);
      const transactions = await adapter.getTransactions(vendorId, 20);
      
      if (!wallet) {
        return res.json({ balance: 0, totalEarned: 0, payouts: [], transactions: [] });
      }
      
      res.json({ ...wallet, transactions });
    } catch (error) {
      console.error("[API] GET /api/vendor/wallet/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/vendor/payout/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { amount, bankDetails } = req.body;
      
      const payout = {
        id: Math.random().toString(36).substr(2, 9),
        amount: Number(amount),
        status: 'pending',
        bankDetails,
        createdAt: new Date().toISOString()
      };
      
      await adapter.addPayout(vendorId, payout);
      
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/vendor/payout/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/stats/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const products = await adapter.getProducts({ vendorId });
      const bookings = await adapter.getBookingsByVendor(vendorId);
      const wallet = await adapter.getWallet(vendorId);
      
      const lastBooking = bookings.length ? bookings[0] : null;
      const walletData = wallet || { balance: 0, totalEarned: 0 };
      
      // Calculate performance data (last 6 months)
      const performance: any[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
        
        const monthBookings = bookings.filter(b => {
          const createdAt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return createdAt >= monthStart && createdAt <= monthEnd;
        });
        
        const revenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        performance.push({
          month: monthName,
          bookings: monthBookings.length,
          revenue: revenue
        });
      }
      
      res.json({
        totalProducts: products.length,
        totalBookings: bookings.length,
        lastBookingPrice: lastBooking ? lastBooking.totalAmount : 0,
        balance: walletData?.balance || 0,
        totalEarned: walletData?.totalEarned || 0,
        performance
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Notifications
  async function createNotification(userId: string, title: string, message: string, type: 'order' | 'booking' | 'system') {
    if (!userId) return;
    try {
      // Save to Database
      await adapter.addNotification({
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date()
      });

      // Send Push Notification
      const userData = await adapter.getUser(userId);
      if (userData) {
        const token = userData.fcmToken;
        if (token) {
          const fcmMessage = {
            notification: { title, body: message },
            data: { type, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
            token: token
          };
          await admin.messaging().send(fcmMessage);
          console.log(`Successfully sent FCM to user ${userId}`);
        }
      }
    } catch (err) {
      console.error("Error creating/sending notification:", err);
    }
  }

  app.post("/api/bookings", async (req, res) => {
    const { userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount, isOnline, bringSamagri, samagriList } = req.body;
    try {
      const bookingId = await adapter.addBooking({
        userId,
        serviceId,
        vendorId,
        type,
        date,
        time: timeSlot,
        totalAmount: Number(totalAmount),
        isOnline: !!isOnline,
        bringSamagri: !!bringSamagri,
        samagriList,
        status: status || 'pending',
        createdAt: new Date()
      });
      
      // Update vendor wallet
      await updateVendorWallet(vendorId, Number(totalAmount), 'booking', bookingId);
      
      // Create notifications
      await createNotification(userId, "Booking Placed", `Your booking for ${type} on ${date} is pending confirmation.`, 'booking');
      if (vendorId && vendorId !== 'system') {
        await createNotification(vendorId, "New Booking", `You have a new booking request for ${type} on ${date}.`, 'booking');
      }
      
      res.json({ success: true, id: bookingId });
    } catch (error) {
      console.error("[API] POST /api/bookings error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      const booking = await adapter.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      // Check if user has paid at least half amount for confirmation notification
      const halfAmount = booking.totalAmount / 2;
      const isPaidEnough = (booking.paidAmount || 0) >= halfAmount;

      await adapter.updateBookingStatus(req.params.id, status);
      
      // Notify user
      if (status === 'confirmed' && !isPaidEnough) {
        await createNotification(booking.userId, "Booking Update", `Your booking for ${booking.type} on ${booking.date} has been ${status}, but please complete at least 50% payment to receive final confirmation.`, 'booking');
      } else {
        await createNotification(booking.userId, "Booking Update", `Your booking for ${booking.type} on ${booking.date} has been ${status}.`, 'booking');
      }

      // Notify vendor
      if (booking.vendorId && booking.vendorId !== 'system') {
        await createNotification(booking.vendorId, "Booking Status Changed", `The booking for ${booking.type} on ${booking.date} is now ${status}.`, 'booking');
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/bookings/:id/status error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/bookings/:id/payment", async (req, res) => {
    const { amount } = req.body;
    try {
      const booking = await adapter.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      const newPaidAmount = (booking.paidAmount || 0) + Number(amount);
      await adapter.updateBookingPaidAmount(req.params.id, newPaidAmount);

      // If paid at least half, notify both
      if (newPaidAmount >= booking.totalAmount / 2 && (booking.paidAmount || 0) < booking.totalAmount / 2) {
        await createNotification(booking.userId, "Payment Received", "We have received at least 50% of your booking amount. Your booking is now fully confirmed.", "booking");
        if (booking.vendorId && booking.vendorId !== 'system') {
          await createNotification(booking.vendorId, "Payment Update", "The user has paid at least 50% of the booking amount.", "booking");
        }
      }

      res.json({ success: true, paidAmount: newPaidAmount });
    } catch (error) {
      console.error("[API] PATCH /api/bookings/:id/payment error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Orders
  app.get("/api/orders/:uid", async (req, res) => {
    try {
      const orders = await adapter.getOrdersByUser(req.params.uid);
      res.json(orders);
    } catch (error) {
      console.error("[API] GET /api/orders/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, items, totalAmount, status, shippingAddress, couponUsed, discountAmount, paymentMethod, paymentStatus, paymentId, signatureURL } = req.body;
    try {
      const orderData = {
        userId,
        items,
        totalAmount: Number(totalAmount),
        status,
        shippingAddress,
        signatureURL: signatureURL || null,
        couponUsed: couponUsed || null,
        discountAmount: Number(discountAmount) || 0,
        paymentMethod,
        paymentStatus,
        paymentId,
        trackingHistory: [
          {
            status,
            message: "Order placed successfully",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date()
      };

      const orderId = await adapter.addOrder(orderData);

      // Update vendor wallets for each item
      for (const item of items) {
        if (item.vendorId) {
          const itemTotal = item.price * item.quantity;
          await updateVendorWallet(item.vendorId, itemTotal, 'order', orderId);
          
          // Notify vendor
          await createNotification(item.vendorId, "New Order", `You have a new order for ${item.name}.`, 'order');
        }
      }

      // Notify user
      await createNotification(userId, "Order Placed", `Your order for ${items.length} items has been placed successfully.`, 'order');

      res.json({ success: true, orderId });
    } catch (error) {
      console.error("[API] POST /api/orders error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/orders/details/:id", async (req, res) => {
    try {
      const order = await adapter.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      console.error("[API] GET /api/orders/details/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    const { status, message } = req.body;
    try {
      const trackingUpdate = {
        status,
        message: message || `Order status updated to ${status}`,
        timestamp: new Date().toISOString()
      };

      await adapter.updateOrderStatus(req.params.id, status, trackingUpdate);

      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/orders/:id/status error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/orders/:vendorId", async (req, res) => {
    try {
      const vendorId = req.params.vendorId;
      const vendorOrders = await adapter.getOrdersByVendor(vendorId);
      res.json(vendorOrders);
    } catch (error) {
      console.error("[API] GET /api/vendor/orders/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await adapter.getNotifications(req.params.userId, 50);
      res.json(notifications);
    } catch (error) {
      console.error("[API] GET /api/notifications/:userId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await adapter.updateNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/notifications/:id/read error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/orders/:id/receipt", async (req, res) => {
    try {
      const order = await adapter.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      // Simple HTML receipt
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #eee;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://punyaseva.in/logo/horizontal-logo.png" alt="PunyaSeva" style="height: 50px; width: auto;" />
            </div>
            <h1 style="color: #f97316; text-align: center;">Order Receipt</h1>
            <p>Order ID: ${order.id}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <hr/>
            <h3>Items:</h3>
            <ul>
              ${order.items?.map((item: any) => `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
            </ul>
            <hr/>
            <h3>Total: ₹${order.totalAmount}</h3>
            <p>Status: ${order.status}</p>
            <p>Shipping to: ${order.shippingAddress}</p>
          </body>
        </html>
      `;
      res.send(html);
    } catch (error) {
      console.error("[API] GET /api/orders/:id/receipt error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Feedback
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await adapter.getFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("[API] GET /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { userId, userName, city, rating, message, serviceId, type, imageURL } = req.body;
    try {
      await adapter.addFeedback({
        userId: userId || null,
        userName: userName || 'Anonymous',
        city: city || null,
        rating: Number(rating) || 5,
        message: message || '',
        serviceId: serviceId || null,
        type: type || 'general',
        imageURL: imageURL || '',
        createdAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });


  app.post("/api/inquiry", async (req, res) => {
    const { name, phone, yatra, date, message } = req.body;
    try {
      await adapter.addNotification({
        userId: 'admin',
        title: `New Inquiry: ${yatra}`,
        message: `From: ${name} (${phone})\nDate: ${date}\n\n${message}`,
        type: 'system',
        read: false,
        createdAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/inquiry error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });


  // Stats
  app.get("/api/stats/visitors", async (req, res) => {
    try {
      const stats = await adapter.getVisitorStats();
      res.json(stats);
    } catch (error) {
      console.error("[API] GET /api/stats/visitors error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Coupons
  app.post("/api/coupons/validate", async (req, res) => {
    const { code, cartTotal } = req.body;
    try {
      if (!code) return res.status(400).json({ message: "Coupon code is required" });
      
      const coupons = await adapter.getCoupons();
      const coupon = coupons.find(c => c.code === code.toUpperCase() && c.active);
        
      if (!coupon) {
        return res.status(404).json({ message: "Invalid or expired coupon code" });
      }
      
      if (cartTotal < coupon.minAmount) {
        return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minAmount}` });
      }
      
      res.json({ success: true, discount: coupon.discount, type: coupon.type });
    } catch (error) {
      console.error("[API] POST /api/coupons/validate error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/stats/visitors/increment", async (req, res) => {
    const { isNew } = req.body;
    try {
      const stats = await adapter.getVisitorStats();
      const currentStats = stats || { total: 0, new: 0 };
      await adapter.updateVisitorStats({
        total: (currentStats.total || 0) + 1,
        new: isNew ? (currentStats.new || 0) + 1 : (currentStats.new || 0),
        lastReset: currentStats.lastReset || new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/stats/visitors/increment error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      // For now, we'll just return feedback as reviews if they match serviceId
      const feedback = await adapter.getFeedback();
      const reviews = feedback.filter(f => f.serviceId === req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("[API] GET /api/products/:id/reviews error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });


  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  } else {
    console.log("Serving static files in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  console.log("Vite middleware/static serving configured.");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

