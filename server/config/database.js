import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let db;

const connectDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log("✅ MySQL connected successfully");
    
    // Create tables if they don't exist
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Error connecting to MySQL database:', error.message);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'merchant') DEFAULT 'merchant',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create media table with cascade delete
    const createMediaTable = `
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        file_name VARCHAR(255),
        file_url VARCHAR(255),
        file_type VARCHAR(50),
        file_size INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await db.execute(createUsersTable);
    await db.execute(createMediaTable);
    console.log('✅ Database tables ready');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
};

const getConnection = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

export default db;
export { connectDB, getConnection };
