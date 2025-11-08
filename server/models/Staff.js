import User from "./User.js";

class Staff extends User {
  constructor(data) {
    super(data);
    this.role = 'staff'; // Ensure role is always staff
  }

  // Staff-specific methods
  async getAssignedTasks() {
    try {
      // This would be implemented if you have a tasks table
      // For now, return empty array
      return [];
    } catch (error) {
      throw new Error(`Failed to get assigned tasks: ${error.message}`);
    }
  }

  // Get staff statistics
  async getStats() {
    try {
      const db = (await import("../models/db.js")).default;
      
      const [mediaCount] = await db.query(
        'SELECT COUNT(*) as count FROM media WHERE user_id = ?',
        [this.id]
      );

      return {
        media_files_count: mediaCount[0].count,
        member_since: this.created_at
      };
    } catch (error) {
      throw new Error(`Failed to get staff stats: ${error.message}`);
    }
  }

  // Override toSafeObject to include staff-specific data
  toSafeObject() {
    return {
      ...super.toSafeObject(),
      permissions: [
        'upload_media',
        'manage_own_media',
        'view_own_stats'
      ]
    };
  }

  // Static method to create staff
  static async create(userData) {
    try {
      const staffData = {
        ...userData,
        role: 'staff',
        status: 'approved' // Staff can be auto-approved if created by admin
      };
      const user = await User.create(staffData);
      return new Staff(user);
    } catch (error) {
      throw new Error(`Failed to create staff: ${error.message}`);
    }
  }

  // Static method to find staff by email
  static async findByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      return user && user.isStaff() ? new Staff(user) : null;
    } catch (error) {
      throw new Error(`Failed to find staff by email: ${error.message}`);
    }
  }

  // Static method to find all staff
  static async findAll() {
    try {
      const users = await User.findAll({ role: 'staff' });
      return users.map(user => new Staff(user));
    } catch (error) {
      throw new Error(`Failed to find staff: ${error.message}`);
    }
  }
}

export default Staff;
