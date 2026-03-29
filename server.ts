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

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: admin.firestore.Firestore;
let firebaseConfig: any = {};

async function initFirebaseAdmin() {
  const firebaseConfigPath = path.join(__dirname, "firebase-applet-config.json");
  try {
    const configData = await fs.readFile(firebaseConfigPath, "utf8");
    firebaseConfig = JSON.parse(configData);
  } catch (e) {
    console.error("Failed to read firebase-applet-config.json", e);
  }

  // Use config project ID if available, otherwise fallback to environment
  const projectId = firebaseConfig.projectId || process.env.GOOGLE_CLOUD_PROJECT;

  if (admin.apps.length === 0) {
    try {
      console.log(`Initializing Firebase Admin for project: ${projectId}`);
      admin.initializeApp({
        projectId: projectId
      });
    } catch (e) {
      console.error("Firebase Admin initialization failed", e);
    }
  }

  try {
    console.log("Initializing Firestore...");
    // If a specific database ID is provided and it's not (default), use it
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)") {
      try {
        console.log(`Attempting to use Firestore Database: ${firebaseConfig.firestoreDatabaseId}`);
        db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
        console.log(`Successfully initialized Firestore Database: ${firebaseConfig.firestoreDatabaseId}`);
      } catch (e) {
        console.warn("Failed to initialize Firestore with specific databaseId, falling back to default", e);
        db = admin.firestore();
      }
    } else {
      db = admin.firestore();
      console.log("Using default Firestore database.");
    }
  } catch (e) {
    console.error("Firestore initialization failed", e);
  }
}

async function startServer() {
  console.log("Starting server initialization...");
  try {
    const app = express();
    const PORT = 3000;

    // Health check early
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    app.use(express.json());
    console.log("Express middleware configured.");

    app.post("/api/admin/send-announcement", async (req, res) => {
      const { title, message, targetRole } = req.body;
      try {
        let query: any = db.collection("users");
        if (targetRole && targetRole !== 'all') {
          query = query.where("role", "==", targetRole);
        }
        
        const usersSnap = await query.get();
        const sendPromises = usersSnap.docs.map((doc: any) => 
          createNotification(doc.id, title, message, 'system')
        );
        
        await Promise.all(sendPromises);
        res.json({ success: true, count: usersSnap.size });
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
        await db.collection("users").doc(userId).update({ fcmToken: token });
        res.json({ success: true });
      } catch (error) {
        console.error("[API] POST /api/users/register-fcm-token error:", error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- AUTO SETUP DATABASE (Firestore Seeding) ---
    const setupDatabase = async () => {
      try {
        console.log("Checking Firestore data...");
        
        // Ensure Admin User exists regardless of other data
        const adminQuery = await db.collection("users").where("email", "==", "pg2331427@gmail.com").limit(1).get();
        if (adminQuery.empty) {
          console.log("Seeding admin user...");
          await db.collection("users").doc("admin_1").set({
            uid: "admin_1",
            email: "pg2331427@gmail.com",
            password: await bcrypt.hash("admin123", 10),
            displayName: "Admin User",
            role: "admin",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // Seed Stats
        const statsDoc = await db.collection("stats").doc("visitors").get();
        if (!statsDoc.exists) {
          await db.collection("stats").doc("visitors").set({
            total: 0,
            new: 0,
            lastReset: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        const usersSnap = await db.collection("users").limit(1).get();
        // If only the admin exists or no users, seed the rest
        if (usersSnap.size <= 1) {
          console.log("Seeding initial Firestore data...");
          
          // Seed other Users
          const users = [
            {
              uid: "user_1",
              email: "user@test.com",
              password: await bcrypt.hash("user123", 10),
              displayName: "Test User",
              role: "devotee",
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
              uid: "vendor_1",
              email: "vendor@test.com",
              password: await bcrypt.hash("vendor123", 10),
              displayName: "Test Vendor",
              role: "vendor",
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            }
          ];
          for (const user of users) {
            // Don't overwrite if exists
            const existing = await db.collection("users").doc(user.uid).get();
            if (!existing.exists) {
              await db.collection("users").doc(user.uid).set(user);
            }
          }

          // Seed Products
          const products = [
            {
              name: "Premium Brass Diya",
              description: "Handcrafted brass diya for your daily puja needs.",
              spiritualSignificance: "The Diya represents the triumph of light over darkness and knowledge over ignorance. Lighting a brass diya in the home is believed to attract the grace of Goddess Lakshmi, bringing prosperity and peace. This handcrafted piece follows traditional designs used in ancient Indian temples.",
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
              spiritualSignificance: "Sandalwood (Chandan) has been used for millennia in Vedic rituals for its cooling and purifying properties. The fragrance is said to calm the mind, making it ideal for meditation and prayer. It is traditionally associated with Lord Vishnu and is believed to create a protective spiritual shield around the home.",
              price: 150,
              category: "Incense",
              stock: 100,
              rating: 4.5,
              image: "https://picsum.photos/seed/incense/400/400",
              vendorId: "system"
            }
          ];
          for (const product of products) {
            await db.collection("products").add(product);
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
              samagriList: ["Flowers", "Sweets", "Incense"]
            }
          ];
          for (const puja of pujas) {
            await db.collection("pujas").add(puja);
          }

          // Seed Feedback
          const feedback = [
            {
              name: "Rahul Sharma",
              city: "Delhi",
              rating: 5,
              message: "Amazing experience! The puja was performed with great devotion.",
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
              name: "Priya Singh",
              city: "Mumbai",
              rating: 4,
              message: "Very convenient service. Pandit ji was very knowledgeable.",
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            }
          ];
          for (const f of feedback) {
            await db.collection("feedback").add(f);
          }

          // Seed Coupons
          const coupons = [
            { code: "DIVINE10", discount: 10, type: "percentage", minAmount: 500, active: true },
            { code: "WELCOME50", discount: 50, type: "fixed", minAmount: 200, active: true },
            { code: "FESTIVE20", discount: 20, type: "percentage", minAmount: 1000, active: true }
          ];
          for (const coupon of coupons) {
            await db.collection("coupons").add(coupon);
          }

          console.log("Firestore seeded successfully.");
        } else {
          console.log("Firestore already has data, skipping seed.");
        }
      } catch (error) {
        console.error("Auto-setup Firestore error:", error);
      }
    };

    // Initialize Firebase before registering routes
    await initFirebaseAdmin();
    console.log("Firebase Admin initialized.");
    
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
    app.post("/api/auth/register", async (req, res) => {
      const { email, password, displayName, role } = req.body;
      try {
      const userSnap = await db.collection("users").where("email", "==", email).limit(1).get();
      if (!userSnap.empty) {
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
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("users").doc(uid).set(userData);
      
      res.json({ success: true, uid });
    } catch (error) {
      console.error("[API] POST /api/auth/register error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const userSnap = await db.collection("users").where("email", "==", email).limit(1).get();
      if (userSnap.empty) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const user = userSnap.docs[0].data();
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
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) return res.status(404).json({ message: "User not found" });
      res.json(userDoc.data());
    } catch (error) {
      console.error(`[API] GET /api/users/${uid} error:`, error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/users/:uid", async (req, res) => {
    const { uid } = req.params;
    const { address, bio, bannerURL } = req.body;
    try {
      const userRef = db.collection("users").doc(uid);
      const updateData: any = {};
      if (address !== undefined) updateData.address = address;
      if (bio !== undefined) updateData.bio = bio;
      if (bannerURL !== undefined) updateData.bannerURL = bannerURL;

      await userRef.update(updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/users/:uid error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.put("/api/users/:uid/address", async (req, res) => {
    const { address } = req.body;
    try {
      await db.collection("users").doc(req.params.uid).update({ address });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/users/:uid/address error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendors/:vendorId", async (req, res) => {
    const { vendorId } = req.params;
    try {
      const vendorDoc = await db.collection("vendors").doc(vendorId).get();
      const userDoc = await db.collection("users").doc(vendorId).get();
      
      if (!vendorDoc.exists || !userDoc.exists) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      const vendorData = vendorDoc.data();
      const userData = userDoc.data();
      
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
      await db.collection("users").doc(userId).update({
        role: 'vendor',
        vendorStatus: 'pending'
      });

      await db.collection("vendors").doc(userId).set({
        name: businessName,
        type: businessType,
        description,
        userId,
        rating: 0,
        reviews: 0,
        joinedAt: admin.firestore.FieldValue.serverTimestamp()
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
      const usersSnap = await db.collection("users").where("role", "==", "devotee").get();
      const vendorsSnap = await db.collection("users").where("role", "==", "vendor").get();
      const productsSnap = await db.collection("products").get();
      const bookingsSnap = await db.collection("bookings").get();
      
      res.json({
        totalUsers: usersSnap.size,
        totalVendors: vendorsSnap.size,
        totalProducts: productsSnap.size,
        totalBookings: bookingsSnap.size
      });
    } catch (error) {
      console.error("[API] GET /api/admin/stats error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/vendors-performance", async (req, res) => {
    try {
      const vendorsSnap = await db.collection("users").where("role", "==", "vendor").get();
      const vendors = vendorsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      
      const performanceData = await Promise.all(vendors.map(async (vendor: any) => {
        const bookingsSnap = await db.collection("bookings").where("vendorId", "==", vendor.uid).get();
        return {
          ...vendor,
          totalBookings: bookingsSnap.size
        };
      }));
      
      res.json(performanceData);
    } catch (error) {
      console.error("[API] GET /api/admin/vendors-performance error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/pending-vendors", async (req, res) => {
    try {
      const usersSnap = await db.collection("users").where("vendorStatus", "==", "pending").get();
      const pendingVendors = await Promise.all(usersSnap.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const vendorDoc = await db.collection("vendors").doc(userDoc.id).get();
        return {
          uid: userDoc.id,
          ...userData,
          businessDetails: vendorDoc.exists ? vendorDoc.data() : null
        };
      }));
      res.json(pendingVendors);
    } catch (error) {
      console.error("[API] GET /api/admin/pending-vendors error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/admin/approve-vendor", async (req, res) => {
    const { vendorId } = req.body;
    try {
      await db.collection("users").doc(vendorId).update({
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
      await db.collection("users").doc(vendorId).update({
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

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, vendorId } = req.query;
      let query: admin.firestore.Query = db.collection("products");
      
      if (category && category !== "all") {
        query = query.where("category", "==", category);
      }
      
      if (vendorId) {
        query = query.where("vendorId", "==", vendorId);
      }
      
      const snap = await query.get();
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      console.error("[API] GET /api/products error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/products", async (req, res) => {
    const { name, description, price, category, stock, rating, image, vendorId, templeName, weightOptions } = req.body;
    try {
      await db.collection("products").add({
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
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
      await db.collection("products").doc(req.params.id).update({
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
      await db.collection("products").doc(req.params.id).delete();
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
      let query: admin.firestore.Query = db.collection("pujas");
      if (vendorId) {
        query = query.where("vendorId", "==", vendorId);
      }
      const snap = await query.get();
      const pujas = await Promise.all(snap.docs.map(async doc => {
        const pujaData = { id: doc.id, ...doc.data() } as any;
        if (pujaData.vendorId) {
          const vendorDoc = await db.collection("vendors").doc(pujaData.vendorId).get();
          if (vendorDoc.exists) {
            pujaData.vendor = vendorDoc.data();
          }
        }
        return pujaData;
      }));
      res.json(pujas);
    } catch (error) {
      console.error("[API] GET /api/pujas error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/pujas", async (req, res) => {
    const { title, description, onlinePrice, offlinePrice, duration, vendorId, samagriIncluded, isOnline, rating } = req.body;
    try {
      await db.collection("pujas").add({
        title,
        description,
        onlinePrice: Number(onlinePrice),
        offlinePrice: offlinePrice ? Number(offlinePrice) : null,
        duration,
        vendorId: vendorId || 'system',
        samagriIncluded: Boolean(samagriIncluded),
        isOnline: Boolean(isOnline),
        rating: rating ? Number(rating) : 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/pujas error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/pujas/:id", async (req, res) => {
    try {
      const doc = await db.collection("pujas").doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ message: "Puja not found" });
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("[API] GET /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/pujas/:id", async (req, res) => {
    const { title, description, onlinePrice, offlinePrice, duration, samagriIncluded, isOnline, rating } = req.body;
    try {
      await db.collection("pujas").doc(req.params.id).update({
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
      await db.collection("pujas").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error("[API] DELETE /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Bookings
  app.get("/api/bookings/:uid", async (req, res) => {
    try {
      const snap = await db.collection("bookings").where("userId", "==", req.params.uid).get();
      const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(bookings);
    } catch (error) {
      console.error("[API] GET /api/bookings/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/bookings/:vendorId", async (req, res) => {
    try {
      const snap = await db.collection("bookings").where("vendorId", "==", req.params.vendorId).get();
      const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const walletRef = db.collection("vendor_wallets").doc(vendorId);
    
    try {
      await db.runTransaction(async (t) => {
        const doc = await t.get(walletRef);
        if (!doc.exists) {
          t.set(walletRef, {
            balance: earning,
            totalEarned: earning,
            payouts: []
          });
        } else {
          const data = doc.data()!;
          t.update(walletRef, {
            balance: (data.balance || 0) + earning,
            totalEarned: (data.totalEarned || 0) + earning
          });
        }
        
        // Log transaction
        t.set(db.collection("vendor_transactions").doc(), {
          vendorId,
          amount: earning,
          originalAmount: amount,
          commission: amount - earning,
          type,
          referenceId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch (err) {
      console.error("Error updating vendor wallet:", err);
    }
  }

  app.get("/api/vendor/wallet/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const walletDoc = await db.collection("vendor_wallets").doc(vendorId).get();
      const transactionsSnap = await db.collection("vendor_transactions")
        .where("vendorId", "==", vendorId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
      
      const transactions = transactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (!walletDoc.exists) {
        return res.json({ balance: 0, totalEarned: 0, payouts: [], transactions: [] });
      }
      
      res.json({ ...walletDoc.data(), transactions });
    } catch (error) {
      console.error("[API] GET /api/vendor/wallet/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/vendor/payout/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { amount, bankDetails } = req.body;
      const walletRef = db.collection("vendor_wallets").doc(vendorId);
      
      await db.runTransaction(async (t) => {
        const doc = await t.get(walletRef);
        if (!doc.exists || doc.data()!.balance < amount) {
          throw new Error("Insufficient balance");
        }
        
        const data = doc.data()!;
        const payout = {
          id: Math.random().toString(36).substr(2, 9),
          amount: Number(amount),
          status: 'pending',
          bankDetails,
          createdAt: new Date().toISOString()
        };
        
        t.update(walletRef, {
          balance: data.balance - Number(amount),
          payouts: admin.firestore.FieldValue.arrayUnion(payout)
        });
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/vendor/payout/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/stats/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const productsSnap = await db.collection("products").where("vendorId", "==", vendorId).get();
      const bookingsSnap = await db.collection("bookings").where("vendorId", "==", vendorId).orderBy("createdAt", "desc").get();
      const walletDoc = await db.collection("vendor_wallets").doc(vendorId).get();
      
      const lastBooking = bookingsSnap.empty ? null : bookingsSnap.docs[0].data();
      const walletData = walletDoc.exists ? walletDoc.data() : { balance: 0, totalEarned: 0 };
      
      // Calculate performance data (last 6 months)
      const performance: any[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const monthStart = admin.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), 1));
        const monthEnd = admin.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59));
        
        const monthBookings = bookingsSnap.docs.filter(doc => {
          const createdAt = doc.data().createdAt;
          return createdAt && createdAt.toMillis() >= monthStart.toMillis() && createdAt.toMillis() <= monthEnd.toMillis();
        });
        
        const revenue = monthBookings.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
        
        performance.push({
          month: monthName,
          bookings: monthBookings.length,
          revenue: revenue
        });
      }
      
      res.json({
        totalProducts: productsSnap.size,
        totalBookings: bookingsSnap.size,
        lastBookingPrice: lastBooking ? lastBooking.totalAmount : 0,
        balance: walletData?.balance || 0,
        totalEarned: walletData?.totalEarned || 0,
        performance
      });
    } catch (error) {
      const { vendorId } = req.params;
      console.error("[API] GET /api/vendor/stats/:vendorId error:", error);
      // Fallback if orderBy fails due to missing index
      try {
        const productsSnap = await db.collection("products").where("vendorId", "==", vendorId).get();
        const bookingsSnap = await db.collection("bookings").where("vendorId", "==", vendorId).get();
        const walletDoc = await db.collection("vendor_wallets").doc(vendorId).get();
        
        let lastBooking = null;
        if (!bookingsSnap.empty) {
          const sorted = bookingsSnap.docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis() || 0;
            const bTime = b.data().createdAt?.toMillis() || 0;
            return bTime - aTime;
          });
          lastBooking = sorted[0].data();
        }

        const walletData = walletDoc.exists ? walletDoc.data() : { balance: 0, totalEarned: 0 };

        res.json({
          totalProducts: productsSnap.size,
          totalBookings: bookingsSnap.size,
          lastBookingPrice: lastBooking ? lastBooking.totalAmount : 0,
          balance: walletData?.balance || 0,
          totalEarned: walletData?.totalEarned || 0
        });
      } catch (innerError) {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  // Notifications
  async function createNotification(userId: string, title: string, message: string, type: 'order' | 'booking' | 'system') {
    if (!userId) return;
    try {
      // Save to Firestore
      await db.collection("notifications").add({
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send Push Notification
      const userDoc = await db.collection("users").doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const token = userData?.fcmToken;
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
      const docRef = await db.collection("bookings").add({
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
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update vendor wallet
      await updateVendorWallet(vendorId, Number(totalAmount), 'booking', docRef.id);
      
      // Create notifications
      await createNotification(userId, "Booking Placed", `Your booking for ${type} on ${date} is pending confirmation.`, 'booking');
      if (vendorId && vendorId !== 'system') {
        await createNotification(vendorId, "New Booking", `You have a new booking request for ${type} on ${date}.`, 'booking');
      }
      
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error("[API] POST /api/bookings error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      const bookingDoc = await db.collection("bookings").doc(req.params.id).get();
      if (!bookingDoc.exists) return res.status(404).json({ message: "Booking not found" });
      const booking = bookingDoc.data()!;

      await db.collection("bookings").doc(req.params.id).update({ status });
      
      // Notify user
      await createNotification(booking.userId, "Booking Update", `Your booking for ${booking.type} on ${booking.date} has been ${status}.`, 'booking');
      
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/bookings/:id/status error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Orders
  app.get("/api/orders/:uid", async (req, res) => {
    try {
      const snap = await db.collection("orders").where("userId", "==", req.params.uid).get();
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      console.error("[API] GET /api/orders/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, items, totalAmount, status, shippingAddress, couponUsed, discountAmount, paymentMethod, paymentStatus, paymentId } = req.body;
    try {
      const docRef = await db.collection("orders").add({
        userId,
        items,
        totalAmount: Number(totalAmount),
        status,
        shippingAddress,
        couponUsed: couponUsed || null,
        discountAmount: Number(discountAmount) || 0,
        paymentMethod,
        paymentStatus,
        paymentId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update vendor wallets for each item
      for (const item of items) {
        if (item.vendorId) {
          const itemTotal = item.price * item.quantity;
          await updateVendorWallet(item.vendorId, itemTotal, 'order', docRef.id);
          
          // Notify vendor
          await createNotification(item.vendorId, "New Order", `You have a new order for ${item.name}.`, 'order');
        }
      }

      // Notify user
      await createNotification(userId, "Order Placed", `Your order for ${items.length} items has been placed successfully.`, 'order');

      res.json({ success: true, orderId: docRef.id });
    } catch (error) {
      console.error("[API] POST /api/orders error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const snap = await db.collection("notifications")
        .where("userId", "==", req.params.userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
      const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(notifications);
    } catch (error) {
      console.error("[API] GET /api/notifications/:userId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await db.collection("notifications").doc(req.params.id).update({ read: true });
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/notifications/:id/read error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/orders/:id/receipt", async (req, res) => {
    try {
      const doc = await db.collection("orders").doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ message: "Order not found" });
      
      const order = doc.data();
      // Simple HTML receipt
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #eee;">
            <h1 style="color: #f97316;">DivineConnect Receipt</h1>
            <p>Order ID: ${doc.id}</p>
            <p>Date: ${order?.createdAt?.toDate().toLocaleDateString()}</p>
            <hr/>
            <h3>Items:</h3>
            <ul>
              ${order?.items?.map((item: any) => `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
            </ul>
            <hr/>
            <h3>Total: ₹${order?.totalAmount}</h3>
            <p>Status: ${order?.status}</p>
            <p>Shipping to: ${order?.shippingAddress}</p>
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
      const { serviceId, type, limit: limitVal } = req.query;
      let query: admin.firestore.Query = db.collection("feedback");
      
      if (serviceId) {
        query = query.where("serviceId", "==", serviceId);
      }
      if (type) {
        query = query.where("type", "==", type);
      }
      
      try {
        query = query.orderBy("createdAt", "desc");
      } catch (e) {
        console.warn("Feedback orderBy failed, falling back to simple get", e);
      }
      
      if (limitVal) {
        query = query.limit(Number(limitVal));
      } else {
        query = query.limit(20);
      }
      
      const snap = await query.get();
      const feedback = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(feedback);
    } catch (error) {
      console.error("[API] GET /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { userId, userName, city, rating, message, serviceId, type, imageURL } = req.body;
    try {
      const docRef = await db.collection("feedback").add({
        userId: userId || null,
        userName: userName || 'Anonymous',
        city: city || null,
        rating: Number(rating) || 5,
        message: message || '',
        serviceId: serviceId || null,
        type: type || 'general',
        imageURL: imageURL || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error("[API] POST /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });


  app.post("/api/inquiry", async (req, res) => {
    const { name, phone, yatra, date, message } = req.body;
    try {
      await db.collection("inquiries").add({
        name,
        phone,
        yatra,
        date,
        message,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
      const doc = await db.collection("stats").doc("visitors").get();
      res.json(doc.data());
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
      
      const snap = await db.collection("coupons")
        .where("code", "==", code.toUpperCase())
        .where("active", "==", true)
        .limit(1)
        .get();
        
      if (snap.empty) {
        return res.status(404).json({ message: "Invalid or expired coupon code" });
      }
      
      const coupon = snap.docs[0].data();
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
      const statsRef = db.collection("stats").doc("visitors");
      await statsRef.update({
        total: admin.firestore.FieldValue.increment(1),
        new: isNew ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0)
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
      const snap = await db.collection("reviews")
        .where("productId", "==", req.params.id)
        .orderBy("createdAt", "desc")
        .get();
      const reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(reviews);
    } catch (error) {
      console.error("[API] GET /api/products/:id/reviews error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });


  // Support Chat Proxy
  app.post("/api/support/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured on server" });
      }

      // We'll use a simple fetch to the Gemini API to avoid adding @google/genai to the backend if not needed,
      // but since we already have it in the project, we could use it.
      // Actually, let's just use a direct fetch to keep the backend simple and avoid dependency bloat if possible.
      // Or better, use the SDK if it's already in package.json.
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.4,
          }
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      res.json({ text });
    } catch (error) {
      console.error("[API] POST /api/support/chat error:", error);
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
} catch (error) {
  console.error("Failed to start server:", error);
}
}

startServer();

