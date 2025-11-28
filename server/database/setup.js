import bcrypt from 'bcryptjs';
import { getPool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

export async function setupDatabase() {
  const pool = await getPool();

  console.log('🔧 Setting up database tables...');

  // 1. Create users table (Admin panel users / business accounts)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_name VARCHAR(150) NOT NULL,
      primary_contact_name VARCHAR(150) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      legal_address TEXT NOT NULL,
      country VARCHAR(100) NOT NULL,
      city VARCHAR(100) NOT NULL,
      postal VARCHAR(20),
      zip VARCHAR(20),
      avatar_url VARCHAR(500),
      role ENUM('admin','staff','merchant') NOT NULL DEFAULT 'merchant',
      status ENUM('active','inactive') NOT NULL DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Users table created/verified');

  // 2. Create inventory table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(500),
      description TEXT,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Inventory table created/verified');

  // 3. Create orders table (stores checkout + invoice details)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      status ENUM('draft','submitted','processing','shipped','delivered','cancelled','declined') NOT NULL DEFAULT 'draft',
      tracking_number VARCHAR(100),
      decline_reason TEXT,
      
      -- Contact / billing info
      contact_first_name VARCHAR(100),
      contact_last_name VARCHAR(100),
      contact_email VARCHAR(150),
      contact_phone VARCHAR(50),
      delivery_address TEXT,
      delivery_city VARCHAR(100),
      delivery_country VARCHAR(100),
      delivery_postal VARCHAR(20),
      notes TEXT,

      -- Amount breakdown
      subtotal_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

      -- Invoice metadata
      invoice_number VARCHAR(50),
      invoice_pdf_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Orders table created/verified');

  // 4. Create order_items table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      inventory_id INT NOT NULL,
      type ENUM('sliced','unsliced') NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Order items table created/verified');

  // 5. Create order_tracking table (audit trail for status changes)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_tracking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      status ENUM('draft','submitted','processing','shipped','delivered','cancelled','declined') NOT NULL,
      tracking_number VARCHAR(100),
      notes TEXT,
      updated_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tracking_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_tracking_user FOREIGN KEY (updated_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Order tracking table created/verified');

  // 5. Seed master admin if not exists
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fmb@admin.com';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

  const [adminRows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [ADMIN_EMAIL]);
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash(ADMIN_PASS, 10);
    await pool.query(
      'INSERT INTO users (business_name, primary_contact_name, first_name, last_name, email, password, phone, legal_address, country, city, postal, zip, avatar_url, role, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        'FMB Merchant Portal',
        'System Admin',
        'Master',
        'Admin',
        ADMIN_EMAIL,
        hash,
        null,
        'System generated admin account',
        'N/A',
        'N/A',
        null,
        null,
        null, 
        'admin',
        'active'
      ]
    );
    console.log(`✅ Seeded master admin: ${ADMIN_EMAIL}`);
  } else {
    console.log('ℹ️ Master admin already exists');
  }

  // 4. Seed inventory if empty
  const [inventoryRows] = await pool.query('SELECT id FROM inventory LIMIT 1');
  if (inventoryRows.length === 0) {
    const defaultProducts = [
      {
        name: 'Raisin Bread',
        price: 50,
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format',
        description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
        note: 'Total quantities should not be less than 10 loaves.'
      },
      {
        name: 'Bran Bread',
        price: 50,
        image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop&auto=format',
        description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
        note: 'Total quantities should not be less than 10 loaves.'
      },
      {
        name: 'Whole Wheat Bread',
        price: 45,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
        description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
        note: 'Total quantities should not be less than 10 loaves.'
      },
      {
        name: 'Sourdough Bread',
        price: 55,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format',
        description: 'Convenient Weighing in at 227 grams (0.5 lbs) (8 oz), the "High Fiber Bread."',
        note: 'Total quantities should not be less than 10 loaves.'
      }
    ];

    for (const product of defaultProducts) {
      await pool.query(
        'INSERT INTO inventory (name, price, image, description, note) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.price, product.image, product.description, product.note]
      );
    }
    console.log(`✅ Seeded ${defaultProducts.length} inventory items`);
  }

  console.log('🎉 Database setup completed!');
}

export default setupDatabase;
