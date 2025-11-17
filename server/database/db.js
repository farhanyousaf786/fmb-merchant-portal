import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'fmb-merchat-portal',
} = process.env;

let pool;

export async function getPool() {
  if (pool) return pool;

  // Ensure database exists (DB name contains hyphen so we must quote it)
  const root = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS });
  await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await root.end();

  pool = await mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export default { getPool };
