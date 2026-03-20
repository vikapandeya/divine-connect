import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let mysqlPool = null;

function isMySqlConfigured() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing on the backend.');
  }

  return new GoogleGenAI({ apiKey });
}

async function initializeDatabase(pool) {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS astrology_readings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(255),
      name VARCHAR(255),
      dob VARCHAR(50),
      tob VARCHAR(50),
      pob VARCHAR(255),
      userQuery TEXT,
      reading LONGTEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_chat_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(255),
      userMessage TEXT,
      assistantMessage LONGTEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [productRows] = await pool.query('SELECT COUNT(*) as count FROM products');
  if (productRows[0].count === 0) {
    const dummyProducts = [
      ['system', 'Brass Ganesha Idol', 'Handcrafted pure brass Ganesha idol for your home altar.', 1250.0, 'Idols', 50, 4.8, 'https://picsum.photos/seed/ganesha/400/400'],
      ['system', 'Sandalwood Incense', 'Premium Mysore sandalwood incense sticks for a divine aroma.', 150.0, 'Incense', 200, 4.5, 'https://picsum.photos/seed/incense/400/400'],
      ['system', 'Rudraksha Mala', 'Original 108+1 beads Panchmukhi Rudraksha mala from Nepal.', 450.0, 'Mala', 100, 4.9, 'https://picsum.photos/seed/mala/400/400'],
      ['system', 'Bhagavad Gita', 'The Bhagavad Gita As It Is - Deluxe Hardbound Edition.', 599.0, 'Books', 75, 5.0, 'https://picsum.photos/seed/gita/400/400'],
      ['system', 'Copper Shri Yantra', 'Energized copper Shri Yantra for prosperity and positive energy.', 850.0, 'Yantras', 30, 4.7, 'https://picsum.photos/seed/yantra/400/400'],
    ];

    await pool.query(
      'INSERT INTO products (vendorId, name, description, price, category, stock, rating, image) VALUES ?',
      [dummyProducts],
    );
  }

  const [pujaRows] = await pool.query('SELECT COUNT(*) as count FROM pujas');
  if (pujaRows[0].count === 0) {
    const dummyPujas = [
      ['system', 'Ganesh Puja', 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.', 2100.0, '1.5 Hours'],
      ['system', 'Satyanarayan Katha', 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.', 5100.0, '3 Hours'],
      ['system', 'Lakshmi Puja', 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.', 3500.0, '2 Hours'],
    ];

    await pool.query(
      'INSERT INTO pujas (vendorId, title, description, price, duration) VALUES ?',
      [dummyPujas],
    );
  }
}

function getMySQL() {
  if (!mysqlPool) {
    const config = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    if (!config.host || !config.user || !config.password || !config.database) {
      console.warn('MySQL environment variables are missing. Database features will fail until configured.');
    }

    mysqlPool = mysql.createPool(config);
  }

  return mysqlPool;
}

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const isProductionServer =
    process.env.NODE_ENV === 'production' || process.argv.includes('--production');
  const isApiOnly = process.argv.includes('--api-only');

  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (allowedOrigins.length > 0 && requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else if (allowedOrigins.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(express.json());

  app.get('/api/setup-db', async (req, res) => {
    try {
      const pool = getMySQL();
      await initializeDatabase(pool);
      res.json({ status: 'success', message: 'Database tables created and seeded successfully.' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, displayName, role } = req.body;

    try {
      const pool = getMySQL();
      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = `custom_${Date.now()}`;
      const userRole = role || 'devotee';

      await pool.query(
        'INSERT INTO users (uid, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
        [uid, email, hashedPassword, displayName, userRole],
      );

      res.json({ success: true, uid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const pool = getMySQL();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
      const pool = getMySQL();
      const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await pool.query(
        'INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)',
        [email, otp, expiresAt],
      );

      console.log(`[AUTH] OTP for ${email}: ${otp}`);
      res.json({ success: true, message: 'OTP sent to your email (Check server logs in this demo)' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      const pool = getMySQL();
      const [otpRows] = await pool.query(
        'SELECT * FROM otps WHERE email = ? AND otp = ? AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1',
        [email, otp],
      );

      if (otpRows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
      await pool.query('DELETE FROM otps WHERE email = ?', [email]);

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { uid, newPassword } = req.body;

    try {
      const pool = getMySQL();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE uid = ?', [hashedPassword, uid]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/health', async (req, res) => {
    try {
      const pool = getMySQL();
      await pool.query('SELECT 1');
      res.json({
        status: 'ok',
        database: 'connected',
        aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        aiConfigured: Boolean(process.env.GEMINI_API_KEY),
        error: error.message,
      });
    }
  });

  app.get('/api/users/:uid', async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query('SELECT * FROM users WHERE uid = ?', [req.params.uid]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    const { uid, displayName, email, photoURL, role } = req.body;

    try {
      const pool = getMySQL();
      await pool.query(
        'INSERT INTO users (uid, displayName, email, photoURL, role, createdAt) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE displayName = ?, photoURL = ?',
        [uid, displayName, email, photoURL, role, displayName, photoURL],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const pool = getMySQL();
      const [userRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'devotee'");
      const [vendorRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'vendor'");
      const [productRows] = await pool.query('SELECT COUNT(*) as count FROM products');
      const [bookingRows] = await pool.query('SELECT COUNT(*) as count FROM bookings');

      res.json({
        totalUsers: userRows[0].count,
        totalVendors: vendorRows[0].count,
        totalProducts: productRows[0].count,
        totalBookings: bookingRows[0].count,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const pool = getMySQL();
      const { category, vendorId } = req.query;
      let query = 'SELECT * FROM products';
      const params = [];
      const conditions = [];

      if (category && category !== 'all') {
        conditions.push('category = ?');
        params.push(category);
      }

      if (vendorId) {
        conditions.push('vendorId = ?');
        params.push(vendorId);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    const { name, description, price, category, stock, rating, image, vendorId } = req.body;

    try {
      const pool = getMySQL();
      await pool.query(
        'INSERT INTO products (name, description, price, category, stock, rating, image, vendorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, description, price, category, stock, rating, image, vendorId || 'system'],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    const { name, description, price, category, stock, rating, image } = req.body;

    try {
      const pool = getMySQL();
      await pool.query(
        'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, rating = ?, image = ? WHERE id = ?',
        [name, description, price, category, stock, rating, image, req.params.id],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const pool = getMySQL();
      await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/pujas', async (req, res) => {
    try {
      const pool = getMySQL();
      const { vendorId } = req.query;
      let query = 'SELECT * FROM pujas';
      const params = [];

      if (vendorId) {
        query += ' WHERE vendorId = ?';
        params.push(vendorId);
      }

      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/pujas', async (req, res) => {
    const { title, description, price, duration, vendorId } = req.body;

    try {
      const pool = getMySQL();
      await pool.query(
        'INSERT INTO pujas (title, description, price, duration, vendorId) VALUES (?, ?, ?, ?, ?)',
        [title, description, price, duration, vendorId],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/pujas/:id', async (req, res) => {
    const { title, description, price, duration } = req.body;

    try {
      const pool = getMySQL();
      await pool.query(
        'UPDATE pujas SET title = ?, description = ?, price = ?, duration = ? WHERE id = ?',
        [title, description, price, duration, req.params.id],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/pujas/:id', async (req, res) => {
    try {
      const pool = getMySQL();
      await pool.query('DELETE FROM pujas WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/pujas/:id', async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query('SELECT * FROM pujas WHERE id = ?', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Puja not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/bookings/:uid', async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query('SELECT * FROM bookings WHERE userId = ?', [req.params.uid]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/vendor/bookings/:vendorId', async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query(
        'SELECT b.*, u.displayName as customerName FROM bookings b JOIN users u ON b.userId = u.uid WHERE b.vendorId = ?',
        [req.params.vendorId],
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/bookings/:id/status', async (req, res) => {
    const { status } = req.body;

    try {
      const pool = getMySQL();
      await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    const { userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount } = req.body;

    try {
      const pool = getMySQL();
      await pool.query(
        'INSERT INTO bookings (userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/orders/:uid', async (req, res) => {
    try {
      const pool = getMySQL();
      const [rows] = await pool.query('SELECT * FROM orders WHERE userId = ?', [req.params.uid]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    const { userId, items, totalAmount, status, shippingAddress } = req.body;

    try {
      const pool = getMySQL();
      const [result] = await pool.query(
        'INSERT INTO orders (userId, totalAmount, status, shippingAddress, createdAt) VALUES (?, ?, ?, ?, NOW())',
        [userId, totalAmount, status, shippingAddress],
      );
      const orderId = result.insertId;

      for (const item of items) {
        await pool.query(
          'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price],
        );
      }

      res.json({ success: true, orderId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/astrology/reading', async (req, res) => {
    const { userId, name, dob, tob, pob, query } = req.body || {};

    if (!name || !dob || !tob || !pob) {
      return res.status(400).json({
        error: 'Name, date of birth, time of birth, and place of birth are required.',
      });
    }

    try {
      const ai = getAiClient();
      const prompt = `
You are an expert Vedic Astrologer for DivineConnect.
Provide a detailed, spiritual, and compassionate reading based on:
- Name: ${name}
- Date of Birth: ${dob}
- Time of Birth: ${tob}
- Place of Birth: ${pob}
- User Query: ${query || 'General life reading and spiritual guidance'}

Include:
1. A brief reading of likely planetary influences.
2. Personality and spiritual-path insights.
3. Guidance for the present period.
4. A practical remedy, mantra, or puja suggestion.

Keep it warm, structured, and easy to read.
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          systemInstruction:
            'You are Jyotish AI, a compassionate Vedic astrology guide for DivineConnect.',
        },
      });

      const reading = response.text?.trim();

      if (!reading) {
        throw new Error('The astrology response was empty.');
      }

      if (isMySqlConfigured()) {
        try {
          const pool = getMySQL();
          await pool.query(
            'INSERT INTO astrology_readings (userId, name, dob, tob, pob, userQuery, reading) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId || null, name, dob, tob, pob, query || null, reading],
          );
        } catch (logError) {
          console.error('Failed to log astrology reading:', logError);
        }
      }

      res.json({ reading });
    } catch (error) {
      console.error('Astrology API error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to generate astrology reading.',
      });
    }
  });

  app.post('/api/support/chat', async (req, res) => {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const userId = typeof req.body?.userId === 'string' ? req.body.userId : null;

    const sanitizedMessages = messages
      .filter(
        (message) =>
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
      .slice(-8);

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: 'At least one chat message is required.' });
    }

    try {
      const ai = getAiClient();
      const transcript = sanitizedMessages
        .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
        .join('\n\n');

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
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      });

      const reply = response.text?.trim();

      if (!reply) {
        throw new Error('The AI support response was empty.');
      }

      const latestUserMessage = [...sanitizedMessages]
        .reverse()
        .find((message) => message.role === 'user');

      if (latestUserMessage && isMySqlConfigured()) {
        try {
          const pool = getMySQL();
          await pool.query(
            'INSERT INTO support_chat_logs (userId, userMessage, assistantMessage) VALUES (?, ?, ?)',
            [userId, latestUserMessage.content, reply],
          );
        } catch (logError) {
          console.error('Failed to log support chat:', logError);
        }
      }

      res.json({ reply });
    } catch (error) {
      console.error('AI support error:', error);
      res.status(500).json({
        error: 'AI support is temporarily unavailable. Please try again shortly.',
      });
    }
  });

  if (!isProductionServer && !isApiOnly) {
    const [{ createServer: createViteServer }, { default: react }, { default: tailwindcss }] =
      await Promise.all([
        import('vite'),
        import('@vitejs/plugin-react'),
        import('@tailwindcss/vite'),
      ]);

    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else if (isProductionServer) {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      throw new Error('dist/index.html was not found. Run "npm run build" before starting the production server.');
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    app.get('/', (req, res) => {
      res.json({
        status: 'ok',
        message: 'DivineConnect API server is running in API-only mode.',
      });
    });
  }

  if (isMySqlConfigured()) {
    try {
      await initializeDatabase(getMySQL());
      console.log('MySQL schema initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize MySQL schema:', error);
    }
  } else {
    console.warn('MySQL credentials are not fully configured. Database-backed features may fail.');
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start DivineConnect server:', error);
  process.exit(1);
});
