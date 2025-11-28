import { getPool } from '../database/db.js';
import bcrypt from 'bcryptjs';

class AdminUser {
  constructor(data) {
    this.id = data.id;
    this.business_name = data.business_name;
    this.branch = data.branch;
    this.primary_contact_name = data.primary_contact_name;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.legal_address = data.legal_address;
    this.country = data.country;
    this.city = data.city;
    this.postal = data.postal;
    this.zip = data.zip;
    this.avatar_url = data.avatar_url;
    this.role = data.role;
    this.status = data.status;
    this.created_at = data.created_at;
  }

  // Find admin by email
  static async findByEmail(email) {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1', 
      [email]
    );
    return rows.length > 0 ? new AdminUser(rows[0]) : null;
  }

  // Find admin by ID
  static async findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, business_name, branch, primary_contact_name, first_name, last_name, email, phone, legal_address, country, city, postal, zip, avatar_url, role, status, created_at FROM users WHERE id = ? LIMIT 1', 
      [id]
    );
    return rows.length > 0 ? new AdminUser(rows[0]) : null;
  }

  // Create new admin user
  static async create(userData) {
    const {
      business_name,
      primary_contact_name,
      first_name,
      last_name,
      email,
      password,
      phone,
      legal_address,
      country,
      city,
      postal,
      zip,
      role = 'staff',
      status
    } = userData;
    
    const pool = await getPool();
    const hash = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (business_name, primary_contact_name, first_name, last_name, email, password, phone, legal_address, country, city, postal, zip, role, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        business_name,
        primary_contact_name,
        first_name,
        last_name,
        email,
        hash,
        phone || null,
        legal_address,
        country,
        city,
        postal || null,
        zip || null,
        role,
        status || 'inactive'
      ]
    );

    return await AdminUser.findById(result.insertId);
  }

  // Verify password
  async verifyPassword(password) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [this.id]);
    if (rows.length === 0) return false;
    
    return await bcrypt.compare(password, rows[0].password);
  }

  // Check if active
  isActive() {
    return this.status === 'active';
  }

  // Check if admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Check if staff
  isStaff() {
    return this.role === 'staff';
  }

  // Get safe object (no sensitive data)
  toJSON() {
    return {
      id: this.id,
      business_name: this.business_name,
      branch: this.branch,
      primary_contact_name: this.primary_contact_name,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      legal_address: this.legal_address,
      country: this.country,
      city: this.city,
      postal: this.postal,
      zip: this.zip,
      avatar_url: this.avatar_url,
      role: this.role,
      status: this.status,
      user_type: 'admin',
      created_at: this.created_at
    };
  }
}

export default AdminUser;
