import { getPool } from './db.js';

async function migrate() {
  const pool = await getPool();
  
  console.log('🔧 Starting migration...');

  // 1. Add branch column
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN branch VARCHAR(100) AFTER business_name`);
    console.log('✅ Added branch column to users table');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Branch column already exists');
    } else {
      console.error('❌ Error adding branch column:', e.message);
    }
  }

  // 2. Create user_addresses table
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100),
        country VARCHAR(100),
        postal VARCHAR(20),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created user_addresses table');
  } catch (e) {
    console.error('❌ Error creating user_addresses table:', e.message);
  }
  
  console.log('✨ Migration complete');
  process.exit(0);
}

migrate();
