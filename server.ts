import express from "express";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";

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
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Setup Database (Create tables and seed data)
  app.get("/api/setup-db", async (req, res) => {
    try {
      const pool = getMySQL();
      
      // Create Tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          uid VARCHAR(255) PRIMARY KEY,
          displayName VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255),
          photoURL TEXT,
          role ENUM('devotee', 'vendor', 'admin') DEFAULT 'devotee',
          createdAt DATETIME
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vendorId VARCHAR(255),
          name VARCHAR(255),
          description TEXT,
          price DECIMAL(10, 2),
          category VARCHAR(100),
          stock INT,
          rating DECIMAL(3, 2),
          image TEXT
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS pujas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vendorId VARCHAR(255),
          title VARCHAR(255),
          description TEXT,
          price DECIMAL(10, 2),
          duration VARCHAR(50)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId VARCHAR(255),
          serviceId INT,
          vendorId VARCHAR(255),
          type ENUM('puja', 'darshan'),
          date DATE,
          timeSlot VARCHAR(50),
          status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
          totalAmount DECIMAL(10, 2),
          FOREIGN KEY (userId) REFERENCES users(uid)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId VARCHAR(255),
          totalAmount DECIMAL(10, 2),
          status ENUM('processing', 'shipped', 'delivered', 'cancelled'),
          shippingAddress TEXT,
          createdAt DATETIME,
          FOREIGN KEY (userId) REFERENCES users(uid)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          orderId INT,
          productId INT,
          quantity INT,
          price DECIMAL(10, 2),
          FOREIGN KEY (orderId) REFERENCES orders(id)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS otps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255),
          otp VARCHAR(6),
          expiresAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Seed Products if empty
      const [productRows]: any = await pool.query("SELECT COUNT(*) as count FROM products");
      if (productRows[0].count === 0) {
        const dummyProducts = [
          ['system', 'Brass Ganesha Idol', 'Handcrafted pure brass Ganesha idol for your home altar.', 1250.00, 'Idols', 50, 4.8, 'https://picsum.photos/seed/ganesha/400/400'],
          ['system', 'Sandalwood Incense', 'Premium Mysore sandalwood incense sticks for a divine aroma.', 150.00, 'Incense', 200, 4.5, 'https://picsum.photos/seed/incense/400/400'],
          ['system', 'Rudraksha Mala', 'Original 108+1 beads Panchmukhi Rudraksha mala from Nepal.', 450.00, 'Mala', 100, 4.9, 'https://picsum.photos/seed/mala/400/400'],
          ['system', 'Bhagavad Gita', 'The Bhagavad Gita As It Is - Deluxe Hardbound Edition.', 599.00, 'Books', 75, 5.0, 'https://picsum.photos/seed/gita/400/400'],
          ['system', 'Copper Shri Yantra', 'Energized copper Shri Yantra for prosperity and positive energy.', 850.00, 'Yantras', 30, 4.7, 'https://picsum.photos/seed/yantra/400/400']
        ];
        await pool.query(
          "INSERT INTO products (vendorId, name, description, price, category, stock, rating, image) VALUES ?",
          [dummyProducts]
        );
      }

      // Seed Pujas if empty
      const [pujaRows]: any = await pool.query("SELECT COUNT(*) as count FROM pujas");
      if (pujaRows[0].count === 0) {
        const dummyPujas = [
          ['system', 'Ganesh Puja', 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.', 2100.00, '1.5 Hours'],
          ['system', 'Satyanarayan Katha', 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.', 5100.00, '3 Hours'],
          ['system', 'Lakshmi Puja', 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.', 3500.00, '2 Hours']
        ];
        await pool.query(
          "INSERT INTO pujas (vendorId, title, description, price, duration) VALUES ?",
          [dummyPujas]
        );
      }

      res.json({ status: "success", message: "Database tables created and seeded successfully." });
    } catch (error) {
      res.status(500).json({ status: "error", message: (error as Error).message });
    }
  });

  // --- AUTH ENDPOINTS ---

  app.post("/api/auth/register", async (req, res) => {
    const { email, password, displayName, role } = req.body;
    try {
      const pool = getMySQL();
      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = `custom_${Date.now()}`;
      const userRole = role || 'devotee';
      await pool.query(
        "INSERT INTO users (uid, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
        [uid, email, hashedPassword, displayName, userRole]
      );
      res.json({ success: true, uid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const pool = getMySQL();
      const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });
      
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
      
      res.json({ success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
      const pool = getMySQL();
      const [userRows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      if (userRows.length === 0) return res.status(404).json({ error: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await pool.query(
        "INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)",
        [email, otp, expiresAt]
      );

      // In a real app, send email here. For now, we log it.
      console.log(`[AUTH] OTP for ${email}: ${otp}`);
      
      res.json({ success: true, message: "OTP sent to your email (Check server logs in this demo)" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const pool = getMySQL();
      const [otpRows]: any = await pool.query(
        "SELECT * FROM otps WHERE email = ? AND otp = ? AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1",
        [email, otp]
      );

      if (otpRows.length === 0) return res.status(400).json({ error: "Invalid or expired OTP" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
      await pool.query("DELETE FROM otps WHERE email = ?", [email]);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { uid, newPassword } = req.body;
    try {
      const pool = getMySQL();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE users SET password = ? WHERE uid = ?", [hashedPassword, uid]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      const pool = getMySQL();
      await pool.query("SELECT 1");
      res.json({ status: "ok", database: "connected" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Database connection failed", error: (error as Error).message });
    }
  });

  // Users
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows]: any = await pool.query("SELECT * FROM users WHERE uid = ?", [req.params.uid]);
      if (rows.length === 0) return res.status(404).json({ message: "User not found" });
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/users", async (req, res) => {
    const { uid, displayName, email, photoURL, role } = req.body;
    try {
      const pool = getMySQL();
      await pool.query(
        "INSERT INTO users (uid, displayName, email, photoURL, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE displayName = ?, photoURL = ?",
        [uid, displayName, email, photoURL, role, displayName, photoURL]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const pool = getMySQL();
      const [userRows]: any = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'devotee'");
      const [vendorRows]: any = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'vendor'");
      const [productRows]: any = await pool.query("SELECT COUNT(*) as count FROM products");
      const [bookingRows]: any = await pool.query("SELECT COUNT(*) as count FROM bookings");
      
      res.json({
        totalUsers: userRows[0].count,
        totalVendors: vendorRows[0].count,
        totalProducts: productRows[0].count,
        totalBookings: bookingRows[0].count
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const pool = getMySQL();
      const { category, vendorId } = req.query;
      let query = "SELECT * FROM products";
      let params: any[] = [];
      let conditions: string[] = [];
      
      if (category && category !== "all") {
        conditions.push("category = ?");
        params.push(category);
      }
      
      if (vendorId) {
        conditions.push("vendorId = ?");
        params.push(vendorId);
      }
      
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/products", async (req, res) => {
    const { name, description, price, category, stock, rating, image, vendorId } = req.body;
    try {
      const pool = getMySQL();
      await pool.query(
        "INSERT INTO products (name, description, price, category, stock, rating, image, vendorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, description, price, category, stock, rating, image, vendorId || 'system']
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, description, price, category, stock, rating, image } = req.body;
    try {
      const pool = getMySQL();
      await pool.query(
        "UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, rating = ?, image = ? WHERE id = ?",
        [name, description, price, category, stock, rating, image, req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const pool = getMySQL();
      await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Pujas
  app.get("/api/pujas", async (req, res) => {
    try {
      const pool = getMySQL();
      const { vendorId } = req.query;
      let query = "SELECT * FROM pujas";
      let params: any[] = [];
      if (vendorId) {
        query += " WHERE vendorId = ?";
        params.push(vendorId);
      }
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/pujas", async (req, res) => {
    const { title, description, price, duration, vendorId } = req.body;
    try {
      const pool = getMySQL();
      await pool.query(
        "INSERT INTO pujas (title, description, price, duration, vendorId) VALUES (?, ?, ?, ?, ?)",
        [title, description, price, duration, vendorId]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/pujas/:id", async (req, res) => {
    const { title, description, price, duration } = req.body;
    try {
      const pool = getMySQL();
      await pool.query(
        "UPDATE pujas SET title = ?, description = ?, price = ?, duration = ? WHERE id = ?",
        [title, description, price, duration, req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/pujas/:id", async (req, res) => {
    try {
      const pool = getMySQL();
      await pool.query("DELETE FROM pujas WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/pujas/:id", async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows]: any = await pool.query("SELECT * FROM pujas WHERE id = ?", [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: "Puja not found" });
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Bookings
  app.get("/api/bookings/:uid", async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query("SELECT * FROM bookings WHERE userId = ?", [req.params.uid]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/vendor/bookings/:vendorId", async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query(
        "SELECT b.*, u.displayName as customerName FROM bookings b JOIN users u ON b.userId = u.uid WHERE b.vendorId = ?",
        [req.params.vendorId]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      const pool = getMySQL();
      await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    const { userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount } = req.body;
    try {
      const pool = getMySQL();
      await pool.query(
        "INSERT INTO bookings (userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Orders
  app.get("/api/orders/:uid", async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query("SELECT * FROM orders WHERE userId = ?", [req.params.uid]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, items, totalAmount, status, shippingAddress } = req.body;
    try {
      const pool = getMySQL();
      const [result]: any = await pool.query(
        "INSERT INTO orders (userId, totalAmount, status, shippingAddress, createdAt) VALUES (?, ?, ?, ?, NOW())",
        [userId, totalAmount, status, shippingAddress]
      );
      const orderId = result.insertId;
      
      for (const item of items) {
        await pool.query(
          "INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.productId, item.quantity, item.price]
        );
      }
      res.json({ success: true, orderId });
    } catch (error) {
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
      .slice(-8);

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: "At least one chat message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "AI support is not configured yet. Please add GEMINI_API_KEY on the backend.",
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const transcript = sanitizedMessages
        .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
        .join("\n\n");

      const prompt = `
You are DivineConnect AI Support.
Your role is to help users with:
- puja bookings
- darshan and prasad guidance
- order and delivery support
- account and sign-in issues
- vendor onboarding questions

Rules:
- Be concise, practical, and warm.
- Stay focused on product support, not open-ended spiritual predictions.
- If the user needs direct human help, tell them to use the Contact Us page email or phone support.
- Do not invent order status, account status, or booking confirmations.
- If information is unavailable, say so clearly.

Conversation:
${transcript}

Write the next assistant reply only.
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
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
      res.status(500).json({
        error: "AI support is temporarily unavailable. Please try again shortly.",
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
}

startServer();

