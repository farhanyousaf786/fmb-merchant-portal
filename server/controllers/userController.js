import db from "../models/db.js";

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    
    res.json({
      success: true,
      users: rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Delete user (will cascade delete their media)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if user exists
    const [users] = await db.query('SELECT id, name FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Delete user (this will cascade delete their media due to ON DELETE CASCADE)
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: `User "${user.name}" and all their media files have been deleted (cascade)`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

export {
  getAllUsers,
  deleteUser
};
