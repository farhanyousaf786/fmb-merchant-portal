import bcrypt from "bcryptjs";
import db from "../models/db.js";

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, country, address, currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    const actualUserId = req.body.userId || userId;

    console.log('📝 Update Profile Request:', {
      firstName,
      lastName,
      phone,
      country,
      address,
      userId: actualUserId
    });

    if (!actualUserId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get current user data
    const [users] = await db.query(
      'SELECT id, password FROM users WHERE id = ?',
      [actualUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to change password'
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update all fields including password
      await db.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, country = ?, address = ?, password = ? WHERE id = ?',
        [firstName, lastName, phone, country, address, hashedPassword, actualUserId]
      );
    } else {
      // Update all fields except password
      const result = await db.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, country = ?, address = ? WHERE id = ?',
        [firstName, lastName, phone, country, address, actualUserId]
      );
      console.log('✅ Update result:', result[0]);
    }

    console.log('✅ Profile updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

export { updateProfile };
