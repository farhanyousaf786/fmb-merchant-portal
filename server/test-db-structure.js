import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function testDBStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log("✅ Connected to MySQL\n");

    // Show table structure
    const [columns] = await connection.query(`
      DESCRIBE users
    `);

    console.log("📋 Users table structure:");
    console.table(columns);

    // Show current data
    const [users] = await connection.query(`
      SELECT id, name, last_name, email, phone, country, address, role FROM users
    `);

    console.log("\n👥 Current users data:");
    console.table(users);

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testDBStructure();
