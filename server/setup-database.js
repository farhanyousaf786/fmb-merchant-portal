import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

export async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    // 1️⃣ Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' ready.`);

    // 2️⃣ Connect to the new DB
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // 3️⃣ Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('admin', 'merchant', 'staff') DEFAULT 'merchant',
        phone VARCHAR(20),
        country VARCHAR(100),
        address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table ready.");

    // 4️⃣ Create default admin
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [process.env.ADMIN_EMAIL]);
    if (rows.length === 0) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASS, 10);
      await db.query(
        "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        ["Super", "Admin", process.env.ADMIN_EMAIL, hashed, "admin"]
      );
      console.log(`👑 Admin created: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASS}`);
    } else {
      console.log("👑 Admin already exists.");
    }

    await db.end();
    await connection.end();
  } catch (err) {
    console.error("❌ Database setup failed:", err);
  }
}
