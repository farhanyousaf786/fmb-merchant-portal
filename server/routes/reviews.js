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

// Get reviews data
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.userId;

    if (isAdmin) {
      // Admin sees all actual reviews
      const [reviews] = await pool.query(`
        SELECT 
          r.id, r.rating, r.feedback, r.created_at,
          o.id as order_number,
          u.first_name, u.last_name, u.business_name
        FROM reviews r
        JOIN orders o ON r.order_id = o.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
      console.log('Admin reviews data:', reviews);
      res.json({ success: true, reviews, mode: 'admin' });
    } else {
      // Merchant sees their delivered orders with review status
      // 1. Get all orders for the user
      const [orders] = await pool.query(`
        SELECT 
          o.id as order_id,
          o.created_at as order_date
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `, [userId]);

      // 2. Get status for each order and filter for 'delivered'
      const deliveredOrders = [];
      for (const order of orders) {
        const [tracking] = await pool.query(`
          SELECT status FROM order_tracking 
          WHERE order_id = ? 
          ORDER BY created_at DESC 
          LIMIT 1
        `, [order.order_id]);

        const status = tracking.length > 0 ? tracking[0].status : 'draft';
        
        if (status === 'delivered') {
          // 3. Check if reviewed
          const [review] = await pool.query(`
            SELECT id, rating, feedback, created_at 
            FROM reviews 
            WHERE order_id = ?
          `, [order.order_id]);

          deliveredOrders.push({
            orderId: `#ORD-${order.order_id}`,
            date: review.length > 0 ? review[0].created_at : order.order_date,
            rating: review.length > 0 ? review[0].rating : 0,
            feedback: review.length > 0 ? review[0].feedback : '-',
            status: review.length > 0 ? 'Rated' : 'Rate',
            raw_order_id: order.order_id
          });
        }
      }

      res.json({ success: true, reviews: deliveredOrders, mode: 'merchant' });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// Submit a review
router.post('/', auth, async (req, res) => {
  try {
    const { order_id, rating, feedback } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();

    // Verify order belongs to user
    const [orders] = await pool.query(
      'SELECT id FROM orders WHERE id = ? AND user_id = ?',
      [order_id, userId]
    );

    if (orders.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid order' });
    }

    // Verify order is delivered via tracking
    const [tracking] = await pool.query(`
      SELECT status FROM order_tracking 
      WHERE order_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [order_id]);

    const status = tracking.length > 0 ? tracking[0].status : 'draft';

    if (status !== 'delivered') {
      return res.status(400).json({ success: false, error: 'Order must be delivered to review' });
    }

    // Check if already reviewed
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE order_id = ?',
      [order_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Order already reviewed' });
    }

    await pool.query(
      'INSERT INTO reviews (order_id, user_id, rating, feedback) VALUES (?, ?, ?, ?)',
      [order_id, userId, rating, feedback]
    );

    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

export default router;
