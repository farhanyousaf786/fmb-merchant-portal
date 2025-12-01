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

// Get all tickets (admin sees all, users see their own)
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const isAdmin = req.user.role === 'admin';
    
    let query = `
      SELECT 
        t.*,
        u.first_name, u.last_name, u.email,
        o.id as order_number,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.order_id = o.id
    `;
    
    if (!isAdmin) {
      query += ` WHERE t.user_id = ?`;
    }
    
    query += ` ORDER BY t.updated_at DESC`;
    
    const [tickets] = isAdmin 
      ? await pool.query(query)
      : await pool.query(query, [req.user.userId]);
    
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
  }
});

// Get single ticket with messages
router.get('/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const ticketId = req.params.id;
    
    // Get ticket details
    const [tickets] = await pool.query(`
      SELECT 
        t.*,
        u.first_name, u.last_name, u.email,
        o.id as order_number
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE t.id = ?
    `, [ticketId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    
    const ticket = tickets[0];
    
    // Check permission
    if (req.user.role !== 'admin' && ticket.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    // Get messages
    const [messages] = await pool.query(`
      SELECT 
        m.*,
        u.first_name, u.last_name, u.role
      FROM ticket_messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.ticket_id = ?
      ORDER BY m.created_at ASC
    `, [ticketId]);
    
    res.json({ success: true, ticket, messages });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket' });
  }
});

// Create new ticket
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message, order_id, priority, image_url } = req.body;
    const userId = req.user.userId;
    const pool = await getPool();
    
    // Create ticket
    const [result] = await pool.query(`
      INSERT INTO support_tickets (user_id, order_id, subject, priority)
      VALUES (?, ?, ?, ?)
    `, [userId, order_id || null, subject, priority || 'medium']);
    
    const ticketId = result.insertId;
    
    // Add first message
    await pool.query(`
      INSERT INTO ticket_messages (ticket_id, user_id, message, image_url)
      VALUES (?, ?, ?, ?)
    `, [ticketId, userId, message, image_url || null]);
    
    res.json({ success: true, ticketId, message: 'Ticket created successfully' });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to create ticket' });
  }
});

// Add message to ticket
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message, image_url } = req.body;
    const ticketId = req.params.id;
    const userId = req.user.userId;
    const pool = await getPool();
    
    // Verify ticket exists and user has access
    const [tickets] = await pool.query('SELECT user_id FROM support_tickets WHERE id = ?', [ticketId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    
    if (req.user.role !== 'admin' && tickets[0].user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    // Add message
    await pool.query(`
      INSERT INTO ticket_messages (ticket_id, user_id, message, image_url)
      VALUES (?, ?, ?, ?)
    `, [ticketId, userId, message, image_url || null]);
    
    // Update ticket timestamp
    await pool.query('UPDATE support_tickets SET updated_at = NOW() WHERE id = ?', [ticketId]);
    
    res.json({ success: true, message: 'Message added successfully' });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ success: false, error: 'Failed to add message' });
  }
});

// Update ticket status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;
    const pool = await getPool();
    
    // Verify ticket exists
    const [tickets] = await pool.query('SELECT user_id FROM support_tickets WHERE id = ?', [ticketId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    
    // Only admin or ticket owner can update status
    if (req.user.role !== 'admin' && tickets[0].user_id !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const closedAt = status === 'closed' ? 'NOW()' : 'NULL';
    
    await pool.query(`
      UPDATE support_tickets 
      SET status = ?, closed_at = ${closedAt}
      WHERE id = ?
    `, [status, ticketId]);
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

export default router;
