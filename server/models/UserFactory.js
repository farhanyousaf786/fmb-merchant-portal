import User from "./User.js";
import Admin from "./Admin.js";
import Merchant from "./Merchant.js";
import Staff from "./Staff.js";

class UserFactory {
  /**
   * Create appropriate user model based on role
   * @param {Object} userData - User data from database
   * @returns {User|Admin|Merchant|Staff} - Appropriate user instance
   */
  static createUser(userData) {
    if (!userData) {
      return null;
    }

    switch (userData.role) {
      case 'admin':
        return new Admin(userData);
      case 'merchant':
        return new Merchant(userData);
      case 'staff':
        return new Staff(userData);
      default:
        return new User(userData);
    }
  }

  /**
   * Find user by ID and return appropriate model
   * @param {number} id - User ID
   * @returns {Promise<User|Admin|Merchant|Staff|null>}
   */
  static async findById(id) {
    try {
      const user = await User.findById(id);
      return this.createUser(user);
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by email and return appropriate model
   * @param {string} email - User email
   * @returns {Promise<User|Admin|Merchant|Staff|null>}
   */
  static async findByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      return this.createUser(user);
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Create new user with appropriate model
   * @param {Object} userData - User creation data
   * @returns {Promise<User|Admin|Merchant|Staff>}
   */
  static async create(userData) {
    try {
      const { role } = userData;
      
      switch (role) {
        case 'admin':
          return await Admin.create(userData);
        case 'merchant':
          return await Merchant.create(userData);
        case 'staff':
          return await Staff.create(userData);
        default:
          return await User.create(userData);
      }
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get all users with appropriate models
   * @param {Object} filters - Filter options
   * @returns {Promise<Array<User|Admin|Merchant|Staff>>}
   */
  static async findAll(filters = {}) {
    try {
      const users = await User.findAll(filters);
      return users.map(user => this.createUser(user));
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  /**
   * Get users by role with appropriate models
   * @param {string} role - User role
   * @param {string} status - User status (optional)
   * @returns {Promise<Array<User|Admin|Merchant|Staff>>}
   */
  static async findByRole(role, status = null) {
    try {
      const filters = { role };
      if (status) {
        filters.status = status;
      }
      return await this.findAll(filters);
    } catch (error) {
      throw new Error(`Failed to find users by role: ${error.message}`);
    }
  }

  /**
   * Get pending users (for admin approval)
   * @returns {Promise<Array<Merchant>>}
   */
  static async getPendingUsers() {
    try {
      const users = await User.findAll({ status: 'pending' });
      return users.map(user => this.createUser(user));
    } catch (error) {
      throw new Error(`Failed to get pending users: ${error.message}`);
    }
  }

  /**
   * Get approved merchants
   * @returns {Promise<Array<Merchant>>}
   */
  static async getApprovedMerchants() {
    try {
      return await this.findByRole('merchant', 'approved');
    } catch (error) {
      throw new Error(`Failed to get approved merchants: ${error.message}`);
    }
  }

  /**
   * Get all staff members
   * @returns {Promise<Array<Staff>>}
   */
  static async getAllStaff() {
    try {
      return await this.findByRole('staff');
    } catch (error) {
      throw new Error(`Failed to get all staff: ${error.message}`);
    }
  }

  /**
   * Update user and return updated model
   * @param {number} id - User ID
   * @param {Object} userData - Update data
   * @returns {Promise<User|Admin|Merchant|Staff>}
   */
  static async update(id, userData) {
    try {
      const updatedUser = await User.update(id, userData);
      return this.createUser(updatedUser);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Update user role and return updated model
   * @param {number} id - User ID
   * @param {string} role - New role
   * @param {string} status - New status
   * @returns {Promise<User|Admin|Merchant|Staff>}
   */
  static async updateRole(id, role, status = 'approved') {
    try {
      const updatedUser = await User.updateRole(id, role, status);
      return this.createUser(updatedUser);
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  /**
   * Authenticate user and return appropriate model
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User|Admin|Merchant|Staff|null>}
   */
  static async authenticate(email, password) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return null;
      }

      // This would need bcrypt import and comparison
      const bcrypt = (await import('bcryptjs')).default;
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return null;
      }

      return this.createUser(user);
    } catch (error) {
      throw new Error(`Failed to authenticate user: ${error.message}`);
    }
  }
}

export default UserFactory;
