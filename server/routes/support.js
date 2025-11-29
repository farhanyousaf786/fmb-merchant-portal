import express from 'express';
import { getPool } from '../database/db.js';
import { verifyToken } from '../database/auth.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ success: false, error: 'Invalid token' });

  req.user = decoded;
  next();
};

// Get support info (fetches from admin user)
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    
    // Fetch support info from the first admin user
    const [rows] = await pool.query(`
      SELECT s.* 
      FROM support s
      INNER JOIN users u ON s.user_id = u.id
      WHERE u.role = 'admin'
      ORDER BY s.updated_at DESC
      LIMIT 1
    `);
    
    if (rows.length > 0) {
      res.json({ success: true, support: rows[0] });
    } else {
      res.json({ success: true, support: null });
    }
  } catch (error) {
    console.error('Error fetching support info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support info' });
  }
});

// Update or create support info
router.post('/', auth, async (req, res) => {
  const { notice, email, phone } = req.body;
  const userId = req.user.userId;

  try {
    const pool = await getPool();
    
    // Check if record exists
    const [existing] = await pool.query('SELECT id FROM support WHERE user_id = ?', [userId]);

    if (existing.length > 0) {
      // Update
      await pool.query(
        'UPDATE support SET notice = ?, email = ?, phone = ? WHERE user_id = ?',
        [notice, email, phone, userId]
      );
    } else {
      // Insert
      await pool.query(
        'INSERT INTO support (user_id, notice, email, phone) VALUES (?, ?, ?, ?)',
        [userId, notice, email, phone]
      );
    }

    res.json({ success: true, message: 'Support info updated successfully' });
  } catch (error) {
    console.error('Error updating support info:', error);
    res.status(500).json({ success: false, error: 'Failed to update support info' });
  }
});

export default router;
