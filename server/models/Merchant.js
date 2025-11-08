import User from "./User.js";

class Merchant extends User {
  constructor(data) {
    super(data);
    this.role = 'merchant'; // Ensure role is always merchant
  }

  // Merchant-specific methods
  getBusinessName() {
    return this.business_name;
  }

  getLegalAddress() {
    return this.legal_address;
  }

  getPrimaryContactName() {
    return this.primary_contact_name;
  }

  // Check if merchant has complete business profile
  hasCompleteProfile() {
    return !!(
      this.business_name &&
      this.legal_address &&
      this.primary_contact_name &&
      this.phone
    );
  }

  // Get merchant business information
  getBusinessInfo() {
    return {
      business_name: this.business_name,
      legal_address: this.legal_address,
      primary_contact_name: this.primary_contact_name,
      phone: this.phone,
      email: this.email
    };
  }

  // Update business information
  async updateBusinessInfo(businessData) {
    try {
      const {
        business_name,
        legal_address,
        primary_contact_name,
        phone
      } = businessData;

      return await User.update(this.id, {
        business_name,
        legal_address,
        primary_contact_name,
        phone
      });
    } catch (error) {
      throw new Error(`Failed to update business info: ${error.message}`);
    }
  }

  // Get merchant's media files (if they have any)
  async getMediaFiles() {
    try {
      const db = (await import("../models/db.js")).default;
      const [rows] = await db.query(
        'SELECT * FROM media WHERE user_id = ? ORDER BY created_at DESC',
        [this.id]
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to get media files: ${error.message}`);
    }
  }

  // Upload media file
  async uploadMedia(mediaData) {
    try {
      const db = (await import("../models/db.js")).default;
      const {
        filename,
        original_name,
        file_size,
        mime_type,
        file_path
      } = mediaData;

      const [result] = await db.query(
        `INSERT INTO media (
          user_id, filename, original_name, file_size, 
          mime_type, file_path
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          this.id, filename, original_name, file_size,
          mime_type, file_path
        ]
      );

      return {
        id: result.insertId,
        user_id: this.id,
        filename,
        original_name,
        file_size,
        mime_type,
        file_path
      };
    } catch (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  // Delete media file
  async deleteMedia(mediaId) {
    try {
      const db = (await import("../models/db.js")).default;
      const [result] = await db.query(
        'DELETE FROM media WHERE id = ? AND user_id = ?',
        [mediaId, this.id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }

  // Get merchant statistics
  async getStats() {
    try {
      const db = (await import("../models/db.js")).default;
      
      const [mediaCount] = await db.query(
        'SELECT COUNT(*) as count FROM media WHERE user_id = ?',
        [this.id]
      );

      const [totalFileSize] = await db.query(
        'SELECT SUM(file_size) as size FROM media WHERE user_id = ?',
        [this.id]
      );

      return {
        media_files_count: mediaCount[0].count,
        total_storage_used: totalFileSize[0].size || 0,
        profile_complete: this.hasCompleteProfile(),
        member_since: this.created_at
      };
    } catch (error) {
      throw new Error(`Failed to get merchant stats: ${error.message}`);
    }
  }

  // Override toSafeObject to include merchant-specific data
  toSafeObject() {
    return {
      ...super.toSafeObject(),
      business_info: this.getBusinessInfo(),
      profile_complete: this.hasCompleteProfile(),
      permissions: [
        'upload_media',
        'manage_own_media',
        'view_own_stats',
        'update_business_info'
      ]
    };
  }

  // Static method to create merchant
  static async create(userData) {
    try {
      const merchantData = {
        ...userData,
        role: 'merchant',
        status: 'pending' // Merchants start as pending approval
      };
      const user = await User.create(merchantData);
      return new Merchant(user);
    } catch (error) {
      throw new Error(`Failed to create merchant: ${error.message}`);
    }
  }

  // Static method to find merchant by email
  static async findByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      return user && user.isMerchant() ? new Merchant(user) : null;
    } catch (error) {
      throw new Error(`Failed to find merchant by email: ${error.message}`);
    }
  }

  // Static method to find all approved merchants
  static async findAllApproved() {
    try {
      const users = await User.findAll({ role: 'merchant', status: 'approved' });
      return users.map(user => new Merchant(user));
    } catch (error) {
      throw new Error(`Failed to find approved merchants: ${error.message}`);
    }
  }

  // Static method to find all pending merchants
  static async findAllPending() {
    try {
      const users = await User.findAll({ role: 'merchant', status: 'pending' });
      return users.map(user => new Merchant(user));
    } catch (error) {
      throw new Error(`Failed to find pending merchants: ${error.message}`);
    }
  }
}

export default Merchant;
