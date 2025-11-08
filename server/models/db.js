import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let db = null;

async function initializeDatabase() {
  try {
    console.log("🔍 Checking MySQL connection...");
    
    // First connect without database to create it if needed
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    console.log("✅ MySQL server connected successfully");

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    await connection.end();

    // Connect to the specific database
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    console.log("✅ Connected to database successfully");
    
    return db;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

// Initialize and export
const dbConnection = await initializeDatabase();
export default dbConnection;
