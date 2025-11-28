import { getPool } from '../database/db.js';

class Order {
  /**
   * Get single order with items and tracking history
   */
  static async findById(orderId) {
    const pool = await getPool();
    
    // Get order details
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    
    // Get current status from order_tracking (latest entry)
    const [currentTracking] = await pool.query(
      `SELECT status, tracking_number, notes, created_at 
       FROM order_tracking 
       WHERE order_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [orderId]
    );
    
    // Add current status to order object
    if (currentTracking.length > 0) {
      order.status = currentTracking[0].status;
      order.tracking_number = currentTracking[0].tracking_number;
      order.last_updated = currentTracking[0].created_at;
    } else {
      order.status = 'draft'; // Default if no tracking entry
      order.tracking_number = null;
    }
    
    // Get order items
    const [items] = await pool.query(
      `SELECT oi.*, i.name as product_name 
       FROM order_items oi 
       LEFT JOIN inventory i ON i.id = oi.inventory_id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    // Get tracking history
    const [tracking] = await pool.query(
      `SELECT ot.*, u.first_name, u.last_name, u.email as admin_email
       FROM order_tracking ot
       LEFT JOIN users u ON u.id = ot.updated_by
       WHERE ot.order_id = ?
       ORDER BY ot.created_at DESC`,
      [orderId]
    );
    
    // Get real customer details from users table
    const [customer] = await pool.query(
      `SELECT id, business_name, first_name, last_name, email, phone, legal_address, city, country, postal 
       FROM users 
       WHERE id = ?`,
      [order.user_id]
    );
    
    return {
      ...order,
      items,
      tracking_history: tracking,
      customer_detail: customer[0] || null
    };
  }

  /**
   * Update order status and tracking - status stored ONLY in order_tracking table
   */
  static async updateStatus({ orderId, status, trackingNumber, notes, updatedBy, declineReason }) {
    const pool = await getPool();
    
    // Update orders table (only tracking_number and decline_reason, NOT status)
    const updateFields = [];
    const updateValues = [];
    
    if (trackingNumber !== undefined && trackingNumber !== null) {
      updateFields.push('tracking_number = ?');
      updateValues.push(trackingNumber);
    }
    
    if (declineReason !== undefined && declineReason !== null) {
      updateFields.push('decline_reason = ?');
      updateValues.push(declineReason);
    }
    
    // Only update orders table if there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(orderId);
      await pool.query(
        `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }
    
    // Check if tracking entry exists for this order
    const [existing] = await pool.query(
      'SELECT id FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    
    if (existing.length > 0) {
      // Update the existing tracking entry
      await pool.query(
        `UPDATE order_tracking 
         SET status = ?, tracking_number = ?, notes = ?, updated_by = ?, created_at = NOW()
         WHERE id = ?`,
        [status, trackingNumber || null, notes || null, updatedBy, existing[0].id]
      );
    } else {
      // Create first tracking entry
      await pool.query(
        `INSERT INTO order_tracking (order_id, status, tracking_number, notes, updated_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, status, trackingNumber || null, notes || null, updatedBy]
      );
    }
    
    return true;
  }

  /**
   * Update only tracking number
   */
  static async updateTrackingNumber({ orderId, trackingNumber, updatedBy, notes }) {
    const pool = await getPool();
    
    // Update tracking number in orders table (since column exists)
    await pool.query(
      'UPDATE orders SET tracking_number = ? WHERE id = ?',
      [trackingNumber, orderId]
    );
    
    // Get current status from order_tracking (since status column dropped from orders)
    const [currentTracking] = await pool.query(
      'SELECT status FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    const currentStatus = currentTracking[0]?.status || 'draft';
    
    // Check if tracking entry exists
    const [existing] = await pool.query(
      'SELECT id FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    
    if (existing.length > 0) {
      // Update existing entry
      await pool.query(
        `UPDATE order_tracking 
         SET status = ?, tracking_number = ?, notes = ?, updated_by = ?, created_at = NOW()
         WHERE id = ?`,
        [currentStatus, trackingNumber, notes || 'Tracking number updated', updatedBy, existing[0].id]
      );
    } else {
      // Create first entry
      await pool.query(
        `INSERT INTO order_tracking (order_id, status, tracking_number, notes, updated_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, currentStatus, trackingNumber, notes || 'Tracking number updated', updatedBy]
      );
    }
    
    return true;
  }
}

export default Order;
