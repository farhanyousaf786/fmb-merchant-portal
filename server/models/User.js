import db from "../models/db.js";

class User {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.phone = data.phone;
    this.country = data.country;
    this.address = data.address;
    this.business_name = data.business_name;
    this.legal_address = data.legal_address;
    this.primary_contact_name = data.primary_contact_name;
    this.status = data.status;
    this.created_at = data.created_at;
  }

  // Get full name
  getFullName() {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Check if user is merchant
  isMerchant() {
    return this.role === 'merchant';
  }

  // Check if user is staff
  isStaff() {
    return this.role === 'staff';
  }

  // Check if user is approved
  isApproved() {
    return this.status === 'approved';
  }

  // Check if user is pending
  isPending() {
    return this.status === 'pending';
  }

  // Check if user is rejected
  isRejected() {
    return this.status === 'rejected';
  }

  // Get user data without sensitive information
  toSafeObject() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      role: this.role,
      phone: this.phone,
      country: this.country,
      address: this.address,
      business_name: this.business_name,
      legal_address: this.legal_address,
      primary_contact_name: this.primary_contact_name,
      status: this.status,
      created_at: this.created_at
    };
  }

  // Static methods for database operations
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  static async create(userData) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        role = null,
        phone = null,
        country = null,
        address = null,
        business_name = null,
        legal_address = null,
        primary_contact_name = null,
        status = 'pending'
      } = userData;

      // Hash password before storing
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        `INSERT INTO users (
          first_name, last_name, email, password, role, phone, 
          country, address, business_name, legal_address, 
          primary_contact_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name, last_name, email, hashedPassword, role, phone,
          country, address, business_name, legal_address,
          primary_contact_name, status
        ]
      );

      return await User.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async update(id, userData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(userData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      await db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return await User.findById(id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM users';
      const values = [];
      const conditions = [];

      if (filters.role) {
        conditions.push('role = ?');
        values.push(filters.role);
      }

      if (filters.status) {
        conditions.push('status = ?');
        values.push(filters.status);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await db.query(query, values);
      return rows.map(row => new User(row));
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  static async updateRole(id, role, status = 'approved') {
    try {
      await db.query(
        'UPDATE users SET role = ?, status = ? WHERE id = ?',
        [role, status, id]
      );
      return await User.findById(id);
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    try {
      await db.query(
        'UPDATE users SET status = ? WHERE id = ?',
        [status, id]
      );
      return await User.findById(id);
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }
}

export default User;
