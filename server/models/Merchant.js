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

  // Business Phones Management
  async getBusinessPhones() {
    try {
      const db = (await import("../models/db.js")).default;
      const [phones] = await db.query(
        'SELECT * FROM business_phones WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC',
        [this.id]
      );
      return phones;
    } catch (error) {
      throw new Error(`Failed to get business phones: ${error.message}`);
    }
  }

  async addBusinessPhone(phoneData) {
    try {
      const db = (await import("../models/db.js")).default;
      const { phone_number, phone_type = 'office', is_primary = false } = phoneData;

      // If this is set as primary, unset other primary phones
      if (is_primary) {
        await db.query(
          'UPDATE business_phones SET is_primary = FALSE WHERE user_id = ?',
          [this.id]
        );
      }

      const [result] = await db.query(
        'INSERT INTO business_phones (user_id, phone_number, phone_type, is_primary) VALUES (?, ?, ?, ?)',
        [this.id, phone_number, phone_type, is_primary]
      );

      return {
        id: result.insertId,
        user_id: this.id,
        phone_number,
        phone_type,
        is_primary
      };
    } catch (error) {
      throw new Error(`Failed to add business phone: ${error.message}`);
    }
  }

  async updateBusinessPhone(phoneId, phoneData) {
    try {
      const db = (await import("../models/db.js")).default;
      const { phone_number, phone_type, is_primary } = phoneData;

      // If this is set as primary, unset other primary phones
      if (is_primary) {
        await db.query(
          'UPDATE business_phones SET is_primary = FALSE WHERE user_id = ? AND id != ?',
          [this.id, phoneId]
        );
      }

      await db.query(
        'UPDATE business_phones SET phone_number = ?, phone_type = ?, is_primary = ? WHERE id = ? AND user_id = ?',
        [phone_number, phone_type, is_primary, phoneId, this.id]
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to update business phone: ${error.message}`);
    }
  }

  async deleteBusinessPhone(phoneId) {
    try {
      const db = (await import("../models/db.js")).default;
      const [result] = await db.query(
        'DELETE FROM business_phones WHERE id = ? AND user_id = ?',
        [phoneId, this.id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete business phone: ${error.message}`);
    }
  }

  // Shipping Addresses Management
  async getShippingAddresses() {
    try {
      const db = (await import("../models/db.js")).default;
      const [addresses] = await db.query(
        'SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
        [this.id]
      );
      return addresses;
    } catch (error) {
      throw new Error(`Failed to get shipping addresses: ${error.message}`);
    }
  }

  async addShippingAddress(addressData) {
    try {
      const db = (await import("../models/db.js")).default;
      const { 
        address_label, 
        full_address, 
        city, 
        state, 
        postal_code, 
        country, 
        is_default = false 
      } = addressData;

      // If this is set as default, unset other default addresses
      if (is_default) {
        await db.query(
          'UPDATE shipping_addresses SET is_default = FALSE WHERE user_id = ?',
          [this.id]
        );
      }

      const [result] = await db.query(
        'INSERT INTO shipping_addresses (user_id, address_label, full_address, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [this.id, address_label, full_address, city, state, postal_code, country, is_default]
      );

      return {
        id: result.insertId,
        user_id: this.id,
        address_label,
        full_address,
        city,
        state,
        postal_code,
        country,
        is_default
      };
    } catch (error) {
      throw new Error(`Failed to add shipping address: ${error.message}`);
    }
  }

  async updateShippingAddress(addressId, addressData) {
    try {
      const db = (await import("../models/db.js")).default;
      const { address_label, full_address, city, state, postal_code, country, is_default } = addressData;

      // If this is set as default, unset other default addresses
      if (is_default) {
        await db.query(
          'UPDATE shipping_addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
          [this.id, addressId]
        );
      }

      await db.query(
        'UPDATE shipping_addresses SET address_label = ?, full_address = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ? WHERE id = ? AND user_id = ?',
        [address_label, full_address, city, state, postal_code, country, is_default, addressId, this.id]
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to update shipping address: ${error.message}`);
    }
  }

  async deleteShippingAddress(addressId) {
    try {
      const db = (await import("../models/db.js")).default;
      const [result] = await db.query(
        'DELETE FROM shipping_addresses WHERE id = ? AND user_id = ?',
        [addressId, this.id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete shipping address: ${error.message}`);
    }
  }

  async setDefaultShippingAddress(addressId) {
    try {
      const db = (await import("../models/db.js")).default;
      
      // Unset all default addresses
      await db.query(
        'UPDATE shipping_addresses SET is_default = FALSE WHERE user_id = ?',
        [this.id]
      );

      // Set the new default
      await db.query(
        'UPDATE shipping_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
        [addressId, this.id]
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to set default shipping address: ${error.message}`);
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
