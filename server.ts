import express from "express";
import cors from "cors";
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
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type } from "@google/genai";
import { DatabaseAdapter, FirestoreAdapter, MySQLAdapter } from "./src/lib/db.ts";

dotenv.config();

let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });
    console.log("[Stripe] Initialized successfully.");
  } else {
    console.warn("[Stripe] STRIPE_SECRET_KEY is missing. Payment features will operate in demo mode.");
  }
} catch (error) {
  console.error("[Stripe] Initialization failed:", (error as Error).message);
}

// ── Gemini AI client (server-side only) ──────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
try {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    aiClient = new GoogleGenAI({ apiKey: geminiKey });
    console.log("[Gemini] AI client initialized.");
  } else {
    console.warn("[Gemini] GEMINI_API_KEY not set. AI features will use fallback responses.");
  }
} catch (e) {
  console.error("[Gemini] Failed to initialize:", (e as Error).message);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = String(error?.message || '').match(/429|rate|limit/i);
    if (retries > 0 && isRateLimit) {
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adapter: DatabaseAdapter;
let firebaseConfig: any = {};

async function initDatabase() {
  const dbType = process.env.DB_TYPE || process.env.DB_PROVIDER || 'firestore';
  
  if (dbType === 'mysql') {
    console.log("[DB] Attempting MySQL connection...");
    try {
      const pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'divine',
        port: Number(process.env.MYSQL_PORT) || 3306,
        connectTimeout: 5000,
      });
      // Verify the connection is actually reachable
      const conn = await pool.getConnection();
      conn.release();
      adapter = new MySQLAdapter(pool);
      console.log("[DB] MySQL Adapter initialized successfully.");
      return;
    } catch (mysqlErr: any) {
      console.error(`[DB] MySQL connection failed (${mysqlErr.code || mysqlErr.message}). Auto-falling back to Firestore...`);
      // Fall through to Firestore init below
    }
  }

  // Default to Firestore
  console.log("Initializing Firestore Adapter...");
  const firebaseConfigPath = path.join(__dirname, "firebase-applet-config.json");
  try {
    const configData = await fs.readFile(firebaseConfigPath, "utf8");
    firebaseConfig = JSON.parse(configData);
    console.log("[Firebase] Loaded config from JSON. Project ID in config:", firebaseConfig.projectId);
  } catch (e) {
    console.error("[Firebase] Failed to read firebase-applet-config.json", e);
  }

  // Precedence: We MUST prioritize the environment's project ID if available (deployment/preview context).
  const envProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.PROJECT_ID;
  const configProjectId = firebaseConfig.projectId;
  const databaseIdFromConfig = firebaseConfig.firestoreDatabaseId;

  console.log(`[Firebase] envProjectId (detected): ${envProjectId}`);
  console.log(`[Firebase] configProjectId: ${configProjectId}`);
  console.log(`[Firebase] databaseIdFromConfig: ${databaseIdFromConfig}`);

  const activeProjectId = envProjectId || configProjectId;

  if (admin.apps.length === 0) {
    try {
      console.log(`[Firebase] Initializing Admin SDK with Project: ${activeProjectId || 'ADC'}`);
      admin.initializeApp({
        projectId: activeProjectId
      });
    } catch (e) {
      console.error("[Firebase] Admin initialization failed:", (e as Error).message);
    }
  }

  const tryInitWithDb = async (pId: string | undefined, dId: string | undefined) => {
    const label = `Project: ${pId || 'default'}, DB: ${dId || '(default)'}`;
    console.log(`[Firebase] Attempting initialization for ${label}...`);
    
    let db: admin.firestore.Firestore;
    if (dId && dId !== "(default)") {
      db = getFirestore(admin.app(), dId);
    } else {
      db = admin.firestore();
    }
    
    // Test read
    await db.collection("_health_").limit(1).get();
    console.log(`[Firebase] Read test passed for ${label}`);
    
    // Canary write
    await db.collection("_health_").doc("check").set({ 
      lastCheck: admin.firestore.FieldValue.serverTimestamp(),
      projectId: pId || 'unknown'
    });
    console.log(`[Firebase] Canary write successful for ${label}`);
    
    adapter = new FirestoreAdapter(db);
    return true;
  };

  const attempts = [
    { p: envProjectId, d: databaseIdFromConfig },
    { p: envProjectId, d: "(default)" },
    { p: configProjectId, d: databaseIdFromConfig },
    { p: configProjectId, d: "(default)" },
  ];

  let success = false;
  for (const attempt of attempts) {
    if (!attempt.p && !attempt.d) continue;
    try {
      if (success) break;
      success = await tryInitWithDb(attempt.p, attempt.d);
      if (success) {
        console.log(`[Firebase] SUCCESSFULLY INITIALIZED with Attempt: Project=${attempt.p}, DB=${attempt.d}`);
        break;
      }
    } catch (e) {
      console.warn(`[Firebase] Attempt failed (Project=${attempt.p}, DB=${attempt.d}):`, (e as Error).message);
    }
  }

  if (!success) {
    console.error("[Firebase] ALL Firestore connection attempts failed. Falling back to ADC (default)");
    try {
      adapter = new FirestoreAdapter(admin.firestore());
    } catch (e) {
      console.error("[Firebase] ADC Fallback failed too.");
    }
  }
}

async function startServer() {
  console.log("Starting server initialization...");
  const app = express();
  const PORT = 3000;

  try {
    // Initialize database in background or with timeout to prevent blocking whole server start
    const dbPromise = initDatabase();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database initialization timed out")), 5000)
    );
    await Promise.race([dbPromise, timeoutPromise]).catch(err => {
      console.warn("Database initialization taking too long or failed, continuing server start:", err.message);
    });
  } catch (error) {
    console.error("Database initialization check failed:", (error as Error).message);
  }

  // Health check early
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: !!adapter });
  });

  // ── CORS ─────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
  ];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }));

  // ── Rate Limiters ────────────────────────────────────────────────────────
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  const aiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'AI request limit reached. Please wait a moment before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  const apiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth', authRateLimit);
  app.use('/api/ai', aiRateLimit);
  app.use('/api', apiRateLimit);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log("Express middleware configured.");

  // Response logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[Response] ${req.method} ${req.url} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Request logging for API
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    if (req.method === "POST" && req.path === "/vendor/register") {
      console.log(`[Vendor Registration Body]`, JSON.stringify(req.body));
    }
    next();
  });

  // Middleware to ensure database is ready
  app.use("/api", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isHealthCheck = req.path === "/health" || req.path === "/debug/firebase";
    if (!adapter && !isHealthCheck) {
      console.warn(`[API] 503 returned for ${req.path} because adapter is not ready.`);
      return res.status(503).json({ 
        error: "Database service is initializing or unavailable. Please try again in a few moments." 
      });
    }
    next();
  });

  // Debug / Test Endpoints
  app.get("/api/test/403", (req, res) => {
    res.status(403).json({ error: "This is a test 403 error" });
  });

  app.get("/api/debug/firebase", async (req, res) => {
    res.json({
      initialized: admin.apps.length > 0,
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.PROJECT_ID || "unknown",
      configProjectId: firebaseConfig.projectId,
      adapterReady: !!adapter,
      dbIdFromConfig: firebaseConfig.firestoreDatabaseId
    });
  });

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
      if (!adapter) {
        console.warn("Database adapter not initialized, skipping setupDatabase.");
        return;
      }
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
    app.post("/api/auth/social-sync", async (req, res) => {
      const { uid, email, displayName, photoURL, role } = req.body;
      try {
        const existingUser = await adapter.getUser(uid);
        let userRole = role || 'devotee';
        if (email === 'pg2331427@gmail.com') userRole = 'admin';

        if (!existingUser) {
          await adapter.createUser(uid, {
            uid,
            email,
            displayName,
            photoURL,
            role: userRole,
            createdAt: new Date()
          });
        } else {
          // Update existing user with latest social info if needed
          await adapter.updateUser(uid, {
            displayName,
            photoURL
          });
          userRole = existingUser.role;
        }
        res.json({ success: true, role: userRole });
      } catch (error) {
        console.error("[API] POST /api/auth/social-sync error:", error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    app.post("/api/auth/register", async (req, res) => {
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

    app.post("/api/auth/login", async (req, res) => {
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
      
      // If user is a vendor or has a pending application, merge vendor details
      if (user.vendorStatus && user.vendorStatus !== 'none') {
        const vendorDetails = await adapter.getVendor(uid);
        if (vendorDetails) {
          return res.json({ ...user, vendorDetails });
        }
      }
      
      res.json(user);
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

  // Naam Jap Endpoints
  app.get("/api/naam-jap/logs", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    try {
      const logs = await adapter!.getNaamJapLogs(userId as string);
      res.json(logs);
    } catch (error) {
      console.error("[API] GET /api/naam-jap/logs error:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/naam-jap/save", async (req, res) => {
    const { userId, date, count, target, mantraName } = req.body;
    if (!userId || !date) return res.status(400).json({ error: "userId and date are required" });
    try {
      await adapter!.updateNaamJap({ userId, date, count, target, mantraName });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/naam-jap/save error:", error);
      res.status(500).json({ error: "Failed to save Naam Jap" });
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
    const { userId, businessName, businessType, description, contactPhone, contactAddress } = req.body;
    console.log(`[Vendor Registration] Attempt for userId: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required for registration. Please ensure you are logged in." });
    }

    try {
      // Step 0: Check if user document exists to avoid obscure errors
      const userDoc = await adapter.getUser(userId);
      if (!userDoc) {
        console.warn(`[Vendor Registration] User document not found for UID: ${userId}. Creating a placeholder profile.`);
        // If user doesn't exist in Firestore but reached here (Auth exists), create a basic profile
        await adapter.createUser(userId, {
          uid: userId,
          email: "unknown@punyaseva.com", // Placeholder
          displayName: "Devotee",
          role: "devotee",
          createdAt: new Date()
        });
      }
      
      if (userDoc && userDoc.vendorStatus === 'pending') {
        return res.status(400).json({ error: "Your registration is already pending review." });
      }
      if (userDoc && userDoc.vendorStatus === 'approved') {
        return res.status(400).json({ error: "You are already a registered vendor." });
      }

      console.log(`[Vendor Registration] Updating user status for ${userId}...`);
      await adapter.updateUser(userId, {
        vendorStatus: 'pending',
        phoneNumber: contactPhone,
        address: contactAddress
      });

      console.log(`[Vendor Registration] Creating vendor profile for ${userId}...`);
      await adapter.createVendor(userId, {
        uid: userId,
        businessName,
        type: businessType,
        description,
        status: 'pending',
        rating: 0,
        reviews: 0,
        createdAt: new Date()
      });

      console.log(`[Vendor Registration] Creating notification for ${userId}...`);
      await createNotification(userId, "Vendor Registration", "Your vendor registration request has been submitted and is pending approval.", "system");
      
      console.log(`[Vendor Registration] Registration successful for ${userId}`);
      res.json({ success: true });
    } catch (error) {
      const err = error as any;
      const message = err.message || String(err);
      const code = err.code || "unknown";
      
      console.error(`[API] POST /api/vendor/register error [Code: ${code}]:`, message);
      if (err.stack) console.error(err.stack);
      
      // Map common Firestore/gRPC codes to friendly messages
      if (code === 5 || message.includes("NOT_FOUND")) {
        return res.status(500).json({ 
          error: "Resource Not Found: The database reported a missing entity. This often happens if the initial synchronization is incomplete. Please refresh and try again.",
          code: code 
        });
      }
      
      if (message.includes("PERMISSION_DENIED") || code === 7 || code === "permission-denied") {
        return res.status(403).json({ 
          error: "Permission Denied: Backend unauthorized to access database.",
          details: message
        });
      }
      
      res.status(500).json({ 
        error: `Submission Error: ${message}`,
        code: code 
      });
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
        vendorStatus: 'approved',
        role: 'vendor'
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
      const { serviceId, type, vendorId } = req.query;
      const feedback = await adapter.getFeedback();
      let filtered = feedback;
      if (serviceId) filtered = filtered.filter((f: any) => f.serviceId === serviceId);
      if (type) filtered = filtered.filter((f: any) => f.type === type);
      if (vendorId) filtered = filtered.filter((f: any) => f.vendorId === vendorId);
      res.json(filtered);
    } catch (error) {
      console.error("[API] GET /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendors/:id/reviews", async (req, res) => {
    const { id } = req.params;
    try {
      const feedback = await adapter.getFeedback();
      const vendorReviews = feedback.filter((f: any) => f.vendorId === id || (f.type === 'puja' && f.serviceId && id === 'system')); // fallback for system
      
      // In a real app we'd query by vendorId. For now let's also check pujas and products
      const pujas = await adapter.getPujas({ vendorId: id });
      const products = await adapter.getProducts({ vendorId: id });
      const serviceIds = [...pujas.map(p => p.id), ...products.map(p => p.id)];
      
      const allVendorReviews = feedback.filter((f: any) => 
        f.vendorId === id || serviceIds.includes(f.serviceId)
      );

      const total = allVendorReviews.length;
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;
      
      allVendorReviews.forEach((r: any) => {
        const rating = Math.round(r.rating) as keyof typeof breakdown;
        if (breakdown[rating] !== undefined) breakdown[rating]++;
        sum += r.rating;
      });

      const average = total > 0 ? sum / total : 0;

      res.json({
        reviews: allVendorReviews,
        stats: {
          total,
          average,
          breakdown
        }
      });
    } catch (error) {
      console.error("[API] GET /api/vendors/:id/reviews error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { userId, userName, city, rating, message, serviceId, type, imageURL, vendorId } = req.body;
    try {
      await adapter.addFeedback({
        userId: userId || null,
        userName: userName || 'Anonymous',
        city: city || null,
        rating: Number(rating) || 5,
        message: message || '',
        serviceId: serviceId || null,
        vendorId: vendorId || null,
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


  // ── /api/ai/* — Gemini AI Proxy Routes (API key stays server-side) ─────────

  // GET /api/ai/panchang?date=YYYY-MM-DD&lang=en
  app.get("/api/ai/panchang", async (req, res) => {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const lang = (req.query.lang as string) || 'en';
    const cacheKey = `panchang_${dateStr}_${lang}`;
    
    // Check in-memory cache (resets when server restarts — that's fine)
    if ((app as any)._panchangCache?.[cacheKey]) {
      return res.json((app as any)._panchangCache[cacheKey]);
    }

    const fallback = {
      tithi: 'Dwitiya', paksha: 'Shukla Paksha', nakshatra: 'Pushya',
      yoga: 'Siddha', karana: 'Vanija', mahina: 'Vaishakha',
      vikramSamvat: '2083', samvatName: 'Siddharthi',
      sunrise: '05:52 AM', sunset: '06:49 PM',
      moonrise: '07:38 AM', moonset: '08:52 PM',
      rahukaal: '05:12 PM - 06:49 PM', gulika: '03:35 PM - 05:12 PM',
      yamaganda: '12:21 PM - 01:58 PM', auspicious: 'Abhijit Muhurat: 11:55 AM - 12:47 PM',
      location: 'New Delhi, India'
    };

    if (!aiClient) return res.json(fallback);

    try {
      const langLabel = lang === 'hi' ? 'Hindi' : lang === 'sa' ? 'Sanskrit' : 'English';
      const prompt = `Return detailed Vedic Panchang for ${dateStr} for New Delhi, India. Include: Vikram Samvat year, Samvatsara name, Paksha, Tithi with end time, Nakshatra with end time, Yoga, Karana, Hindu month, Sunrise, Sunset, Moonrise, Moonset, Rahukaal, Gulika, Yamaganda, Abhijit Muhurta, festivals list, Sun sign, Moon sign. Labels and values in ${langLabel}. Return as JSON.`;
      const result = await withRetry(() => aiClient!.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tithi: { type: Type.STRING }, tithiEnd: { type: Type.STRING },
              paksha: { type: Type.STRING }, nakshatra: { type: Type.STRING },
              nakshatraEnd: { type: Type.STRING }, yoga: { type: Type.STRING },
              yogaEnd: { type: Type.STRING }, karana: { type: Type.STRING },
              karanaEnd: { type: Type.STRING }, mahina: { type: Type.STRING },
              vikramSamvat: { type: Type.STRING }, samvatName: { type: Type.STRING },
              sunrise: { type: Type.STRING }, sunset: { type: Type.STRING },
              moonrise: { type: Type.STRING }, moonset: { type: Type.STRING },
              rahukaal: { type: Type.STRING }, gulika: { type: Type.STRING },
              yamaganda: { type: Type.STRING }, auspicious: { type: Type.STRING },
              festivals: { type: Type.ARRAY, items: { type: Type.STRING } },
              sunSign: { type: Type.STRING }, moonSign: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ["tithi","paksha","nakshatra","yoga","karana","mahina","vikramSamvat","samvatName","sunrise","sunset","moonrise","moonset","rahukaal","gulika","yamaganda","auspicious","location"]
          }
        }
      }));
      const text = result.text || "";
      if (!text) throw new Error("Empty response");
      const data = JSON.parse(text);
      if (!(app as any)._panchangCache) (app as any)._panchangCache = {};
      (app as any)._panchangCache[cacheKey] = data;
      res.json(data);
    } catch (err: any) {
      console.warn("[AI] Panchang fallback used:", err.message);
      res.json(fallback);
    }
  });

  // GET /api/ai/horoscope?sign=Aries&lang=en
  app.get("/api/ai/horoscope", async (req, res) => {
    const sign = (req.query.sign as string) || 'Aries';
    const lang = (req.query.lang as string) || 'en';
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `horoscope_${sign}_${lang}_${today}`;

    if ((app as any)._horoscopeCache?.[cacheKey]) {
      return res.json({ prediction: (app as any)._horoscopeCache[cacheKey] });
    }

    const fallback = "The stars illuminate your path with grace and divine purpose today. Embrace tranquility and let your inner wisdom be your guide.";
    if (!aiClient) return res.json({ prediction: fallback });

    try {
      const langLabel = lang === 'hi' ? 'Hindi' : lang === 'sa' ? 'Sanskrit' : 'English';
      const result = await withRetry(() => aiClient!.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `As a spiritual Vedic Astrologer, write a 2-3 sentence daily horoscope for ${sign} for ${today}. Tone: spiritual, encouraging, divine. Language: ${langLabel}. Return only the prediction text, no labels or intros.`,
        config: { temperature: 0.8, topP: 0.95 }
      }));
      const prediction = result.text?.trim() || fallback;
      if (!(app as any)._horoscopeCache) (app as any)._horoscopeCache = {};
      (app as any)._horoscopeCache[cacheKey] = prediction;
      res.json({ prediction });
    } catch (err: any) {
      console.warn("[AI] Horoscope fallback used:", err.message);
      res.json({ prediction: fallback });
    }
  });

  // POST /api/ai/chat { message, history }
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!aiClient) {
      return res.status(503).json({ error: "AI Chat is not configured." });
    }

    try {
      const SYSTEM_INSTRUCTION = `
You are Veda AI, a divine Vedic Scholar and spiritual assistant for the PunyaSeva platform. 
Your purpose is to provide sacred wisdom, explain Vedic traditions, guide users through puja bookings, and offer peace and clarity.

Tone: 
- Compassionate, wise, and serene.
- Use spiritual metaphors where appropriate.
- Be respectful of all traditions while focusing on Vedic/Hindu spirituality.
- Address the user with respect (e.g., "Dear Seeker" or "Namaste").

Capabilities:
- Explain the significance of various pujas (Ganesh Puja, Lakshmi Puja, etc.).
- Provide mantra explanations and their benefits.
- Guide users on how to use the PunyaSeva platform (booking pujas, ordering prasad, checking astrology).
- Offer general spiritual guidance and meditation tips.

Rules:
- If a user asks about booking a puja, guide them to the /services page.
- If a user asks about their future or horoscope, guide them to the /astrology page.
- Do not provide medical, legal, or financial advice.
- Keep responses concise but meaningful.
`;

      const formattedHistory = (history || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }));
      formattedHistory.push({ role: 'user', parts: [{ text: message }] });

      const response = await withRetry(() => aiClient!.models.generateContent({
        model: "gemini-2.0-flash",
        contents: formattedHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
        }
      }));

      const reply = response.text || "I am currently in deep meditation. Please try again later.";
      const sources = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

      res.json({ reply, sources });
    } catch (err: any) {
      const isRateLimit = String(err.message).match(/429|rate|limit/i);
      if (isRateLimit) {
        return res.status(429).json({ error: "Rate limit reached" });
      }
      console.error("[AI] Chat error:", err.message);
      res.status(500).json({ error: "Failed to connect to divine insights" });
    }
  });

  // GET /api/ai/search?q=query&type=service
  app.get("/api/ai/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query || !aiClient) {
      return res.status(503).json({ error: "Search unavailable" });
    }
    
    try {
      const systemInstruction = `
        You are a sacred Vedic assistant for the PunyaSeva platform. A user is searching for "${query}" across our spiritual platform.
        Our platform offers:
        1. Puja Services (e.g., Satyanarayan Puja, Ganesh Puja)
        2. Sacred Yatras (e.g., Char Dham, Kashi Yatra)
        3. Spiritual Products (e.g., Rudraksha, Idols, Incense)
        4. Temple Knowledge (Historical and spiritual info about Indian temples)

        Provide a brief, grounded explanation of the spiritual significance of "${query}".
        If applicable, guide them on what to look for on our platform.
        Keep it under 3 sentences. Use a serene, helpful, and knowledgeable tone.
      `;

      const response = await withRetry(() => aiClient!.models.generateContent({
        model: "gemini-2.0-flash", // Updated from deprecated gemini-3-flash-preview
        contents: query,
        config: { systemInstruction, temperature: 0.5, tools: [{ googleSearch: {} }] }
      }));
      
      const result = response.text || "No divine insights found for this search.";
      // Note: Grounding metadata extraction depends on SDK version; keeping it simple
      const sources = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];
      
      res.json({ result, sources });
    } catch (err: any) {
      console.error("[AI] Search error:", err.message);
      res.status(500).json({ error: "Failed to connect to divine insights" });
    }
  });

  // POST /api/ai/astrology  { tab, formData, rashifalData, kundliData }
  app.post("/api/ai/astrology", async (req, res) => {
    const { tab, formData, rashifalData, kundliData } = req.body;
    if (!aiClient) {
      return res.status(503).json({ error: "AI astrology is not configured. Please add GEMINI_API_KEY to the server environment." });
    }

    let prompt = '';
    let systemInstruction = "You are a divine Vedic Astrologer named 'Jyotish AI'. Provide accurate and spiritual guidance.";

    if (tab === 'birth-chart') {
      prompt = `Provide a detailed spiritual Vedic astrological reading for:\nName: ${formData?.name}\nDOB: ${formData?.dob}\nTOB: ${formData?.tob}\nPOB: ${formData?.pob}\nQuery: ${formData?.query || 'General life reading'}\n\nInclude: planetary positions, personality/spiritual path, current dasha guidance, and a specific remedy (Mantra/Puja). Format in Markdown.`;
    } else if (tab === 'rashifal') {
      prompt = `Provide a detailed ${rashifalData?.timeframe || 'Daily'} Rashifal for ${rashifalData?.sign || 'Aries'}. Include: General Outlook, Career & Finance, Health, Love, Lucky Color & Number, and a spiritual tip. Format in Markdown.`;
      systemInstruction = "You are an expert Vedic Astrologer providing Rashifal insights.";
    } else if (tab === 'kundli') {
      prompt = `Perform Ashta-Koota Kundli Milan for:\nGroom: ${kundliData?.p1Name}, DOB: ${kundliData?.p1Dob}, TOB: ${kundliData?.p1Tob}, POB: ${kundliData?.p1Pob}\nBride: ${kundliData?.p2Name}, DOB: ${kundliData?.p2Dob}, TOB: ${kundliData?.p2Tob}, POB: ${kundliData?.p2Pob}\n\nProvide: Gun Milan score, Dosha analysis, Compatibility verdict, and Remedies if applicable. Format in Markdown.`;
      systemInstruction = "You are an advanced Vedic Astrology engine specializing in Kundli Milan.";
    } else if (tab === 'adv-chart') {
      prompt = `Generate a technical Vedic D1 Lagna Chart for:\nName: ${formData?.name}, DOB: ${formData?.dob}, TOB: ${formData?.tob}, POB: ${formData?.pob}\n\nInclude: Planetary degrees and Nakshatra Padas, Lagna, Bhava positions, Vimshottari Dasha overview, major Yogas. Use Markdown tables where appropriate.`;
      systemInstruction = "You are a high-precision Vedic Astrology Software engine.";
    } else {
      return res.status(400).json({ error: "Invalid tab type." });
    }

    try {
      const result = await withRetry(() => aiClient!.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { systemInstruction, temperature: 0.7, tools: [{ googleSearch: {} }] }
      }));
      const reading = result.text;
      if (!reading) throw new Error("Empty response from AI");
      res.json({ reading });
    } catch (err: any) {
      const isRateLimit = String(err.message).match(/429|rate|limit/i);
      if (isRateLimit) {
        return res.status(429).json({ error: "The cosmic energies are aligning. Please try again in a few minutes." });
      }
      console.error("[AI] Astrology error:", err.message);
      res.status(500).json({ error: "The stars are currently obscured. Please try again later." });
    }
  });

  // Catch-all for undefined API routes
  app.all("/api/*", (req, res) => {
    console.warn(`[API] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
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

  // Global Error Handler for API (Moved to end)
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[API Global Error]", err);
    if (!res.headersSent) {
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        code: err.code || "UNKNOWN_ERROR"
      });
    } else {
      next(err);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

