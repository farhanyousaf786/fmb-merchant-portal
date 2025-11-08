import User from "./User.js";

class Admin extends User {
  constructor(data) {
    super(data);
    this.role = 'admin'; // Ensure role is always admin
  }

  // Admin-specific methods
  async approveUser(userId) {
    try {
      return await User.updateRole(userId, 'merchant', 'approved');
    } catch (error) {
      throw new Error(`Failed to approve user: ${error.message}`);
    }
  }

  async rejectUser(userId) {
    try {
      return await User.updateStatus(userId, 'rejected');
    } catch (error) {
      throw new Error(`Failed to reject user: ${error.message}`);
    }
  }

  async assignRole(userId, role) {
    try {
      if (!['admin', 'merchant', 'staff'].includes(role)) {
        throw new Error('Invalid role');
      }
      return await User.updateRole(userId, role, 'approved');
    } catch (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  async getAllUsers(filters = {}) {
    try {
      return await User.findAll(filters);
    } catch (error) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }
  }

  async getPendingUsers() {
    try {
      return await User.findAll({ status: 'pending' });
    } catch (error) {
      throw new Error(`Failed to get pending users: ${error.message}`);
    }
  }

  async getMerchants() {
    try {
      return await User.findAll({ role: 'merchant' });
    } catch (error) {
      throw new Error(`Failed to get merchants: ${error.message}`);
    }
  }

  async getStaff() {
    try {
      return await User.findAll({ role: 'staff' });
    } catch (error) {
      throw new Error(`Failed to get staff: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    try {
      // Prevent admin from deleting themselves
      if (userId === this.id) {
        throw new Error('Cannot delete your own admin account');
      }
      return await User.delete(userId);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      // Admin can create users with specific roles
      const { role, ...otherData } = userData;
      
      if (role && !['admin', 'merchant', 'staff'].includes(role)) {
        throw new Error('Invalid role specified');
      }

      // Admin-created users are automatically approved
      const userToCreate = {
        ...otherData,
        role: role || 'staff',
        status: 'approved'
      };

      return await User.create(userToCreate);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(userId, userData) {
    try {
      // Admin can update any user field
      return await User.update(userId, userData);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async getDashboardStats() {
    try {
      const db = (await import("../models/db.js")).default;
      
      const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
      const [pendingUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE status = "pending"');
      const [merchants] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "merchant"');
      const [staff] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "staff"');
      const [admins] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');

      return {
        total_users: totalUsers[0].count,
        pending_users: pendingUsers[0].count,
        merchants: merchants[0].count,
        staff: staff[0].count,
        admins: admins[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  // Override toSafeObject to include admin-specific data
  toSafeObject() {
    return {
      ...super.toSafeObject(),
      permissions: [
        'manage_users',
        'approve_reject_users',
        'assign_roles',
        'view_all_data',
        'delete_users',
        'create_users'
      ]
    };
  }

  // Static method to create admin
  static async create(userData) {
    try {
      const adminData = {
        ...userData,
        role: 'admin',
        status: 'approved'
      };
      const user = await User.create(adminData);
      return new Admin(user);
    } catch (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  // Static method to find admin by email
  static async findByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      return user && user.isAdmin() ? new Admin(user) : null;
    } catch (error) {
      throw new Error(`Failed to find admin by email: ${error.message}`);
    }
  }
}

export default Admin;
