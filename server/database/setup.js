import bcrypt from 'bcryptjs';
import { getPool } from './db.js';

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
      role ENUM('admin','staff','merchant') NOT NULL DEFAULT 'merchant',
      status ENUM('active','inactive') NOT NULL DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Users table created/verified');

  // 3. Seed master admin if not exists
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fmb@admin.com';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

  const [adminRows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [ADMIN_EMAIL]);
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash(ADMIN_PASS, 10);
    await pool.query(
      'INSERT INTO users (business_name, primary_contact_name, first_name, last_name, email, password, phone, legal_address, country, city, postal, zip, role, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
        'admin',
        'active'
      ]
    );
    console.log(`✅ Seeded master admin: ${ADMIN_EMAIL}`);
  } else {
    console.log('ℹ️ Master admin already exists');
  }

  console.log('🎉 Database setup completed!');
}

export default setupDatabase;
