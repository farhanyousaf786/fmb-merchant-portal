import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";
dotenv.config();

export async function setupDatabase(db) {
  try {
    console.log("🔧 Setting up database tables...");

    // 1️⃣ Create users table
    console.log("📝 Creating users table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','merchant','staff') DEFAULT NULL,
        phone VARCHAR(20),
        country VARCHAR(100),
        address VARCHAR(255),
        business_name VARCHAR(255),
        legal_address VARCHAR(500),
        primary_contact_name VARCHAR(200),
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table created/verified");

    // 2️⃣ Create media table
    console.log("📝 Creating media table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Media table created/verified");

    // 3️⃣ Check if admin user exists
    console.log(`🔍 Checking for admin user: ${process.env.ADMIN_EMAIL}`);
    console.log("📋 Admin email from env:", process.env.ADMIN_EMAIL);
    
    // Use Admin model to check if admin exists
    console.log("🔎 Checking if admin exists using Admin model...");
    const existingAdmin = await Admin.findByEmail(process.env.ADMIN_EMAIL);
    console.log("📊 Admin check result:", existingAdmin ? "Admin exists" : "Admin does not exist");
    
    if (!existingAdmin) {
      console.log("👤 Creating admin user using Admin model...");
      console.log("📋 Admin pass from env:", process.env.ADMIN_PASS ? "Exists" : "Missing");
      
      // Create admin using Admin model
      const admin = await Admin.create({
        first_name: 'Admin',
        last_name: 'User',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASS,
        phone: '+1234567890',
        country: 'US',
        address: 'System Admin'
      });

      console.log(`✅ Admin user created with ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.status}`);
    } else {
      console.log("✅ Admin user already exists");
      console.log(`   ID: ${existingAdmin.id}, Role: ${existingAdmin.role}`);
    }

    console.log("🎉 Database setup completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.error("Full error details:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}
