import mysql from 'mysql2/promise';

async function runTests() {
  console.log("Starting RBAC Functional Tests...\n");
  
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Assuming empty password for XAMPP default
  });

  try {
    console.log("1. Database Setup...");
    await connection.query('CREATE DATABASE IF NOT EXISTS test_system');
    await connection.query('USE test_system');

    // Create Tables
    const createTablesSQL = `
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS user_roles;
      DROP TABLE IF EXISTS roles;
      DROP TABLE IF EXISTS users;

      CREATE TABLE roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      CREATE TABLE user_roles (
        user_id INT,
        role_id INT,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      );

      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        is_best_selling BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Execute multiple statements (if supported) or split them
    const statements = createTablesSQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    console.log("Tables created successfully.");

    console.log("\n2. Inserting Dummy Data...");
    // Insert Roles
    await connection.query(`INSERT INTO roles (role_name) VALUES ('user'), ('vendor'), ('admin')`);

    // Insert Users
    await connection.query(`
      INSERT INTO users (name, email, password) VALUES 
      ('Devotee User', 'devotee@test.com', '123456'),
      ('Normal User', 'user@test.com', '123456'),
      ('Vendor User', 'vendor@test.com', '123456'),
      ('Admin User', 'admin@test.com', '123456')
    `);

    // Assign Roles
    await connection.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id FROM users u, roles r 
      WHERE (u.email = 'devotee@test.com' AND r.role_name IN ('user', 'vendor'))
         OR (u.email = 'user@test.com' AND r.role_name = 'user')
         OR (u.email = 'vendor@test.com' AND r.role_name = 'vendor')
         OR (u.email = 'admin@test.com' AND r.role_name = 'admin')
    `);

    // Insert Products
    await connection.query(`
      INSERT INTO products (vendor_id, name, description, price, category, is_best_selling)
      SELECT id, 'Tulsi Mala', 'Holy beads', 150.00, 'Pooja Items', true FROM users WHERE email = 'vendor@test.com'
      UNION ALL
      SELECT id, 'Incense Sticks', 'Rose fragrance', 50.00, 'Pooja Items', false FROM users WHERE email = 'vendor@test.com'
      UNION ALL
      SELECT id, 'Ganga Jal', 'Holy water', 100.00, 'Essentials', true FROM users WHERE email = 'devotee@test.com'
      UNION ALL
      SELECT id, 'Brass Diya', 'Traditional lamp', 250.00, 'Decor', false FROM users WHERE email = 'devotee@test.com'
    `);
    console.log("Dummy data inserted.");

    console.log("\n3. Testing Authentication & Role Handling");
    
    async function loginUser(email, password) {
      const [users] = await connection.query(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password]);
      if (users.length === 0) return null;
      const user = users[0];
      
      const [roles] = await connection.query(`
        SELECT r.role_name FROM roles r 
        JOIN user_roles ur ON r.id = ur.role_id 
        WHERE ur.user_id = ?
      `, [user.id]);
      
      user.roles = roles.map(r => r.role_name);
      return user;
    }

    const devotee = await loginUser('devotee@test.com', '123456');
    console.log(`Login Devotee: `, devotee.email, `Roles:`, devotee.roles);
    
    const vendor = await loginUser('vendor@test.com', '123456');
    console.log(`Login Vendor: `, vendor.email, `Roles:`, vendor.roles);

    console.log("\n4. Testing Access Control Rules");
    
    function canAccessAdmin(user) {
      return user.roles.includes('admin');
    }

    function canAddProduct(user) {
      return user.roles.includes('vendor');
    }

    console.log(`Devotee can access Admin? ${canAccessAdmin(devotee) ? 'FAIL' : 'PASS'} (Expected: No)`);
    console.log(`Devotee can add Product? ${canAddProduct(devotee) ? 'PASS' : 'FAIL'} (Expected: Yes)`);
    console.log(`Vendor can access Admin? ${canAccessAdmin(vendor) ? 'FAIL' : 'PASS'} (Expected: No)`);
    
    const admin = await loginUser('admin@test.com', '123456');
    console.log(`Admin can access Admin? ${canAccessAdmin(admin) ? 'PASS' : 'FAIL'} (Expected: Yes)`);

    console.log("\n5. Functional Queries Validation");
    // View best selling products (User scope)
    const [bestSelling] = await connection.query(`SELECT name, price FROM products WHERE is_best_selling = TRUE`);
    console.log(`Best Selling Products Count: ${bestSelling.length} (Expected: 2) -> ${bestSelling.length === 2 ? 'PASS' : 'FAIL'}`);

    // Devotee viewing own vendor listings
    const [devoteeProducts] = await connection.query(`SELECT name FROM products WHERE vendor_id = ?`, [devotee.id]);
    console.log(`Devotee Vendor Products Count: ${devoteeProducts.length} (Expected: 2) -> ${devoteeProducts.length === 2 ? 'PASS' : 'FAIL'}`);

    console.log("\n✅ All Tests Executed.");

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await connection.end();
  }
}

runTests();
