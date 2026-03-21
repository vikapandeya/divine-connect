import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import mysql from "mysql2/promise";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mysqlPool: mysql.Pool | null = null;

type SupportMessage = {
  role: "user" | "assistant";
  content: string;
};

export function getMySQL(): mysql.Pool {
  if (!mysqlPool) {
    const config = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    if (!config.host || !config.user || !config.password || !config.database) {
      console.warn("⚠️ MySQL environment variables are missing. Database features will fail until configured.");
    }
    
    mysqlPool = mysql.createPool(config);
  }
  return mysqlPool;
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // --- AUTO SETUP DATABASE ---
    const setupDatabase = async () => {
      try {
        const db = getMySQL();
        console.log("Checking database tables...");
        
        // Read schema and seed files
        const schema = await fs.readFile(path.join(__dirname, "database", "schema.sql"), "utf8");
        const seed = await fs.readFile(path.join(__dirname, "database", "seed.sql"), "utf8");
        
        const schemaQueries = schema.split(";").map(q => q.trim()).filter(q => q.length > 0);
        const seedQueries = seed.split(";").map(q => q.trim()).filter(q => q.length > 0);
        
        // Execute schema queries (they use CREATE TABLE IF NOT EXISTS)
        for (const query of schemaQueries) {
          await db.execute(query);
        }
        
        // Check if we need to seed (only if users table is empty)
        const [users]: any = await db.execute("SELECT COUNT(*) as count FROM users");
        if (users[0].count === 0) {
          console.log("Seeding initial data...");
          for (const query of seedQueries) {
            await db.execute(query);
          }
          console.log("Database seeded successfully.");
        } else {
          console.log("Database already has data, skipping seed.");
          // Check if address column exists in users table
          const [columns]: any = await db.execute("SHOW COLUMNS FROM users LIKE 'address'");
          if (columns.length === 0) {
            console.log("Adding address column to users table...");
            await db.execute("ALTER TABLE users ADD COLUMN address TEXT AFTER photoURL");
            console.log("Address column added successfully.");
          }
        }
        
        console.log("Database initialization check complete.");
      } catch (error) {
        console.error("Auto-setup database error:", error);
      }
    };
    
    // Run setup in background
    setupDatabase();

  // --- API ROUTES ---

  // Setup Database (Create tables and seed data in MySQL)
  app.get("/api/setup-db", async (req, res) => {
    try {
      const db = getMySQL();
      const schema = await fs.readFile(path.join(__dirname, "database", "schema.sql"), "utf8");
      const seed = await fs.readFile(path.join(__dirname, "database", "seed.sql"), "utf8");
      
      // Split by semicolon and filter out empty strings
      const schemaQueries = schema.split(";").map(q => q.trim()).filter(q => q.length > 0);
      const seedQueries = seed.split(";").map(q => q.trim()).filter(q => q.length > 0);
      
      for (const query of schemaQueries) {
        await db.execute(query);
      }
      
      for (const query of seedQueries) {
        await db.execute(query);
      }
      
      res.json({ status: "success", message: "MySQL database setup successfully." });
    } catch (error) {
      console.error("MySQL setup error:", error);
      res.status(500).json({ status: "error", message: (error as Error).message });
    }
  });

  // --- AUTH ENDPOINTS ---

  app.post("/api/auth/register", async (req, res) => {
    const { email, password, displayName, role } = req.body;
    console.log(`[AUTH] Registration attempt for: ${email}`);
    try {
      const db = getMySQL();
      
      // Check if user already exists
      const [existing]: any = await db.execute("SELECT uid FROM users WHERE email = ?", [email]);
      if (existing.length > 0) {
        console.log(`[AUTH] Registration failed: Email ${email} already exists.`);
        return res.status(400).json({ success: false, error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = `custom_${Date.now()}`;
      
      // Default admin logic for the user's email
      let userRole = role || 'devotee';
      if (email === 'pg2331427@gmail.com') {
        userRole = 'admin';
        console.log(`[AUTH] Assigning admin role to: ${email}`);
      }
      
      await db.execute(
        "INSERT INTO users (uid, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
        [uid, email, hashedPassword, displayName, userRole]
      );
      
      console.log(`[AUTH] User registered successfully: ${email} (UID: ${uid}, Role: ${userRole})`);
      res.json({ success: true, uid });
    } catch (error) {
      console.error("[API] POST /api/auth/register error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/google-sync", async (req, res) => {
    const { email, displayName, photoURL, uid: firebaseUid, role } = req.body;
    console.log(`[AUTH] Google Sync attempt for: ${email} (Requested Role: ${role})`);
    try {
      const db = getMySQL();
      
      // Check if user already exists
      const [existing]: any = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
      
      let user;
      if (existing.length > 0) {
        user = existing[0];
        console.log(`[AUTH] Google Sync: User ${email} already exists in MySQL.`);
      } else {
        // Create new user
        let userRole = role || 'devotee';
        if (email === 'pg2331427@gmail.com') {
          userRole = 'admin';
          console.log(`[AUTH] Google Sync: Assigning admin role to: ${email}`);
        }
        
        await db.execute(
          "INSERT INTO users (uid, email, displayName, photoURL, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
          [firebaseUid, email, displayName, photoURL, userRole]
        );
        
        const [newUser]: any = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        user = newUser[0];
        console.log(`[AUTH] Google Sync: New user created for: ${email} (Role: ${userRole})`);
      }
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("[API] POST /api/auth/google-sync error:", error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${email}`);
    try {
      const db = getMySQL();
      const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
      if (rows.length === 0) {
        console.log(`[AUTH] Login failed: User not found - ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`[AUTH] Login failed: Incorrect password for - ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log(`[AUTH] User logged in successfully: ${email} (Role: ${user.role})`);
      res.json({ success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (error) {
      console.error("[API] POST /api/auth/login error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
      const db = getMySQL();
      const [users]: any = await db.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
      if (users.length === 0) return res.status(404).json({ error: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db.execute(
        "INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)",
        [email, otp, expiresAt]
      );

      // In a real app, send email here. For now, we log it.
      console.log(`[AUTH] OTP for ${email}: ${otp}`);
      
      res.json({ success: true, message: "OTP sent to your email (Check server logs in this demo)" });
    } catch (error) {
      console.error("[API] POST /api/auth/forgot-password error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const db = getMySQL();
      const [otps]: any = await db.execute(
        "SELECT * FROM otps WHERE email = ? AND otp = ? AND expiresAt > NOW() ORDER BY expiresAt DESC LIMIT 1",
        [email, otp]
      );

      if (otps.length === 0) return res.status(400).json({ error: "Invalid or expired OTP" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await db.execute("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

      // Delete the OTP
      await db.execute("DELETE FROM otps WHERE id = ?", [otps[0].id]);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("[API] POST /api/auth/verify-otp error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { uid, newPassword } = req.body;
    try {
      const db = getMySQL();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.execute("UPDATE users SET password = ? WHERE uid = ?", [hashedPassword, uid]);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/auth/reset-password error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      const db = getMySQL();
      await db.execute("SELECT 1");
      res.json({ status: "ok", database: "mysql_connected" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "MySQL connection failed", error: (error as Error).message });
    }
  });

  // Users
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const db = getMySQL();
      const [rows]: any = await db.execute("SELECT * FROM users WHERE uid = ? LIMIT 1", [req.params.uid]);
      if (rows.length === 0) return res.status(404).json({ message: "User not found" });
      res.json(rows[0]);
    } catch (error) {
      console.error("[API] GET /api/users/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/users/:uid/address", async (req, res) => {
    const { address } = req.body;
    try {
      const db = getMySQL();
      await db.execute("UPDATE users SET address = ? WHERE uid = ?", [address, req.params.uid]);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/users/:uid/address error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/users", async (req, res) => {
    const { uid, displayName, email, photoURL, role } = req.body;
    try {
      const db = getMySQL();
      await db.execute(
        "INSERT INTO users (uid, displayName, email, photoURL, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE displayName = ?, email = ?, photoURL = ?, role = ?",
        [uid, displayName, email, photoURL, role || 'devotee', displayName, email, photoURL, role || 'devotee']
      );
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/users error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const db = getMySQL();
      const [[{ count: usersCount }]]: any = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'devotee'");
      const [[{ count: vendorsCount }]]: any = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'vendor'");
      const [[{ count: productsCount }]]: any = await db.execute("SELECT COUNT(*) as count FROM products");
      const [[{ count: bookingsCount }]]: any = await db.execute("SELECT COUNT(*) as count FROM bookings");
      
      res.json({
        totalUsers: usersCount,
        totalVendors: vendorsCount,
        totalProducts: productsCount,
        totalBookings: bookingsCount
      });
    } catch (error) {
      console.error("[API] GET /api/admin/stats error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const db = getMySQL();
      const { category, vendorId } = req.query;
      let query = "SELECT * FROM products WHERE 1=1";
      const params = [];
      
      if (category && category !== "all") {
        query += " AND category = ?";
        params.push(category);
      }
      
      if (vendorId) {
        query += " AND vendorId = ?";
        params.push(vendorId);
      }
      
      const [rows]: any = await db.execute(query, params);
      res.json(rows);
    } catch (error) {
      console.error("[API] GET /api/products error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/products", async (req, res) => {
    const { name, description, price, category, stock, rating, image, vendorId, templeName, weightOptions } = req.body;
    try {
      const db = getMySQL();
      await db.execute(
        "INSERT INTO products (name, description, price, category, stock, rating, image, vendorId, templeName, weightOptions, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [name, description, Number(price), category, Number(stock), Number(rating), image, vendorId || 'system', templeName, JSON.stringify(weightOptions)]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/products error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, description, price, category, stock, rating, image, templeName, weightOptions } = req.body;
    try {
      const db = getMySQL();
      await db.execute(
        "UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, rating = ?, image = ?, templeName = ?, weightOptions = ? WHERE id = ?",
        [name, description, Number(price), category, Number(stock), Number(rating), image, templeName, JSON.stringify(weightOptions), req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/products/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const db = getMySQL();
      await db.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] DELETE /api/products/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Pujas
  app.get("/api/pujas", async (req, res) => {
    try {
      const db = getMySQL();
      const { vendorId } = req.query;
      let query = "SELECT * FROM pujas WHERE 1=1";
      const params = [];
      if (vendorId) {
        query += " AND vendorId = ?";
        params.push(vendorId);
      }
      const [rows]: any = await db.execute(query, params);
      res.json(rows);
    } catch (error) {
      console.error("[API] GET /api/pujas error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/pujas", async (req, res) => {
    const { title, description, onlinePrice, offlinePrice, duration, vendorId, samagriList } = req.body;
    try {
      const db = getMySQL();
      await db.execute(
        "INSERT INTO pujas (title, description, onlinePrice, offlinePrice, duration, vendorId, samagriList, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [title, description, Number(onlinePrice), Number(offlinePrice), duration, vendorId || 'system', JSON.stringify(samagriList)]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/pujas error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/pujas/:id", async (req, res) => {
    const { title, description, onlinePrice, offlinePrice, duration, samagriList } = req.body;
    try {
      const db = getMySQL();
      await db.execute(
        "UPDATE pujas SET title = ?, description = ?, onlinePrice = ?, offlinePrice = ?, duration = ?, samagriList = ? WHERE id = ?",
        [title, description, Number(onlinePrice), Number(offlinePrice), duration, JSON.stringify(samagriList), req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PUT /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/pujas/:id", async (req, res) => {
    try {
      const db = getMySQL();
      await db.execute("DELETE FROM pujas WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] DELETE /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/pujas/:id", async (req, res) => {
    try {
      const db = getMySQL();
      const [rows]: any = await db.execute("SELECT * FROM pujas WHERE id = ? LIMIT 1", [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: "Puja not found" });
      res.json(rows[0]);
    } catch (error) {
      console.error("[API] GET /api/pujas/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Bookings
  app.get("/api/bookings/:uid", async (req, res) => {
    try {
      const db = getMySQL();
      const [rows]: any = await db.execute("SELECT * FROM bookings WHERE userId = ?", [req.params.uid]);
      res.json(rows);
    } catch (error) {
      console.error("[API] GET /api/bookings/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/bookings/:vendorId", async (req, res) => {
    try {
      const db = getMySQL();
      const [rows]: any = await db.execute(`
        SELECT b.*, u.displayName as customerName 
        FROM bookings b 
        LEFT JOIN users u ON b.userId = u.uid 
        WHERE b.vendorId = ?
      `, [req.params.vendorId]);
      res.json(rows);
    } catch (error) {
      console.error("[API] GET /api/vendor/bookings/:vendorId error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      const db = getMySQL();
      await db.execute("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error("[API] PATCH /api/bookings/:id/status error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    const { userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount, isOnline, bringSamagri, samagriList } = req.body;
    try {
      const db = getMySQL();
      const [result]: any = await db.execute(
        "INSERT INTO bookings (userId, serviceId, vendorId, type, date, time, totalAmount, isOnline, bringSamagri, samagriList, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [userId, serviceId, vendorId, type, date, timeSlot, Number(totalAmount), isOnline ? 1 : 0, bringSamagri ? 1 : 0, JSON.stringify(samagriList), status || 'pending']
      );
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      console.error("[API] POST /api/bookings error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Receipt Generation
  app.get("/api/receipt/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    try {
      const db = getMySQL();
      if (type === 'booking') {
        const [bookings]: any = await db.execute("SELECT * FROM bookings WHERE id = ? LIMIT 1", [id]);
        if (bookings.length === 0) return res.status(404).json({ error: "Booking not found" });
        const booking = bookings[0];

        const [pujas]: any = await db.execute("SELECT * FROM pujas WHERE id = ? LIMIT 1", [booking.serviceId]);
        const [users]: any = await db.execute("SELECT * FROM users WHERE uid = ? LIMIT 1", [booking.userId]);

        res.json({
          receiptId: `BK-${booking.id}`,
          date: booking.date,
          customer: users.length > 0 ? users[0].displayName : 'Unknown',
          email: users.length > 0 ? users[0].email : 'N/A',
          item: pujas.length > 0 ? pujas[0].title : 'Unknown Service',
          type: booking.isOnline ? 'Online' : 'Offline',
          amount: booking.totalAmount,
          samagriStatus: booking.isOnline ? 'Provided Online' : (booking.bringSamagri ? 'Brought by Pandit Ji' : 'Arranged by Customer'),
          samagriList: typeof booking.samagriList === 'string' ? JSON.parse(booking.samagriList) : booking.samagriList,
          status: booking.status
        });
      } else {
        const [orders]: any = await db.execute("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
        if (orders.length === 0) return res.status(404).json({ error: "Order not found" });
        const order = orders[0];

        const [users]: any = await db.execute("SELECT * FROM users WHERE uid = ? LIMIT 1", [order.userId]);
        const [items]: any = await db.execute("SELECT * FROM order_items WHERE orderId = ?", [id]);

        res.json({
          receiptId: `ORD-${order.id}`,
          date: order.createdAt,
          customer: users.length > 0 ? users[0].displayName : 'Unknown',
          email: users.length > 0 ? users[0].email : 'N/A',
          items: items.map((i: any) => ({ name: i.productName, qty: i.quantity, price: i.price })),
          total: order.totalAmount,
          address: order.shippingAddress,
          status: order.status
        });
      }
    } catch (error) {
      console.error("[API] GET /api/receipt/:type/:id error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Orders
  app.get("/api/orders/:uid", async (req, res) => {
    try {
      const db = getMySQL();
      const [orders]: any = await db.execute("SELECT * FROM orders WHERE userId = ?", [req.params.uid]);
      
      // For each order, fetch its items
      const rows = await Promise.all(orders.map(async (order: any) => {
        const [items]: any = await db.execute("SELECT * FROM order_items WHERE orderId = ?", [order.id]);
        return { ...order, items };
      }));
      
      res.json(rows);
    } catch (error) {
      console.error("[API] GET /api/orders/:uid error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, items, totalAmount, status, shippingAddress } = req.body;
    try {
      const db = getMySQL();
      // Start transaction
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        
        const [orderResult]: any = await conn.execute(
          "INSERT INTO orders (userId, totalAmount, status, shippingAddress, createdAt) VALUES (?, ?, ?, ?, NOW())",
          [userId, Number(totalAmount), status, shippingAddress]
        );
        
        const orderId = orderResult.insertId;
        
        for (const item of items) {
          await conn.execute(
            "INSERT INTO order_items (orderId, productId, quantity, price, selectedOption, productName) VALUES (?, ?, ?, ?, ?, ?)",
            [orderId, item.productId, item.quantity, Number(item.price), item.selectedOption, item.productName]
          );
        }
        
        await conn.commit();
        res.json({ success: true, orderId });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error("[API] POST /api/orders error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

   app.post("/api/feedback", async (req, res) => {
    const { name, city, rating, message } = req.body;
    try {
      const db = getMySQL();
      await db.execute(
        "INSERT INTO feedback (name, city, rating, message) VALUES (?, ?, ?, ?)",
        [name, city, rating, message]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("[API] POST /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const db = getMySQL();
      const [rows] = await db.execute("SELECT * FROM feedback ORDER BY createdAt DESC LIMIT 10");
      res.json(rows);
    } catch (error) {
      console.error("[API] GET /api/feedback error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/support/chat", async (req, res) => {
    const messages = Array.isArray(req.body?.messages)
      ? (req.body.messages as SupportMessage[])
      : [];

    const sanitizedMessages = messages
      .filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
      .slice(-20);

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: "At least one chat message is required." });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "AI support is not configured yet. Please add API_KEY on the backend.",
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: sanitizedMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        config: {
          systemInstruction: `
You are DivineConnect AI Support.
Your role is to help users with:
- Puja bookings (online/offline)
- Darshan and Prasad guidance
- Order status and delivery support
- Account access and sign-in issues
- Vendor onboarding questions (how to join as a priest, temple, or shop)

Puja Booking Flow:
If a user expresses interest in booking a puja:
1. Prompt them for the type of puja or service they are interested in. Provide a selectable list of common types in this format: [OPTIONS: Ganesh Puja, Lakshmi Puja, Satyanarayan Katha, Durga Puja, Saraswati Puja].
2. Prompt them for their preferred date.
3. Prompt them for their preferred time slot (morning, afternoon, or evening). Provide a selectable list in this format: [OPTIONS: Morning, Afternoon, Evening].
4. Ask if they prefer an online (virtual) or offline (in-person) service. Provide a selectable list in this format: [OPTIONS: Online (Virtual), Offline (In-person)].
5. Once you have these details, provide a summary and guide them to the official "Pujas" page to finalize the booking.

Rules:
- Be concise, practical, and warm.
- Stay focused on product and platform support.
- Use the provided conversation history to maintain context and provide relevant answers.
- If the user needs direct human help, tell them to use the Contact Us page email or phone support.
- Do not invent order status, account status, or booking confirmations.
- If information is unavailable, say so clearly.
- Use a helpful, spiritual, yet professional tone.
          `.trim(),
          temperature: 0.4,
        },
      });

      const reply = response.text?.trim();

      if (!reply) {
        throw new Error("The AI support response was empty.");
      }

      res.json({ reply });
    } catch (error) {
      console.error("AI support error:", error);
      const errorMessage = error instanceof Error ? error.message : "AI support is temporarily unavailable.";
      
      // If the error is about the API key, provide a helpful instruction to the user
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
        return res.status(401).json({
          error: "Invalid Gemini API Key. Please ensure you have a valid API_KEY set in the 'Settings' menu of AI Studio.",
        });
      }

      res.status(500).json({
        error: `AI support is temporarily unavailable. ${errorMessage}`,
      });
    }
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
}
}

startServer();

