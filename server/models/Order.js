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
    
    return {
      ...order,
      items,
      tracking_history: tracking
    };
  }

  /**
   * Update order status and add tracking entry
   */
  static async updateStatus({ orderId, status, trackingNumber, notes, updatedBy, declineReason }) {
    const pool = await getPool();
    
    // Update orders table
    const updateFields = ['status = ?'];
    const updateValues = [status];
    
    if (trackingNumber !== undefined) {
      updateFields.push('tracking_number = ?');
      updateValues.push(trackingNumber);
    }
    
    if (declineReason !== undefined) {
      updateFields.push('decline_reason = ?');
      updateValues.push(declineReason);
    }
    
    updateValues.push(orderId);
    
    await pool.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Add tracking history entry
    await pool.query(
      `INSERT INTO order_tracking (order_id, status, tracking_number, notes, updated_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, status, trackingNumber || null, notes || null, updatedBy]
    );
    
    return true;
  }

  /**
   * Update only tracking number
   */
  static async updateTrackingNumber({ orderId, trackingNumber, updatedBy, notes }) {
    const pool = await getPool();
    
    await pool.query(
      'UPDATE orders SET tracking_number = ? WHERE id = ?',
      [trackingNumber, orderId]
    );
    
    // Get current status
    const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
    const currentStatus = orders[0]?.status || 'submitted';
    
    // Add tracking history entry
    await pool.query(
      `INSERT INTO order_tracking (order_id, status, tracking_number, notes, updated_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, currentStatus, trackingNumber, notes || 'Tracking number updated', updatedBy]
    );
    
    return true;
  }
}

export default Order;
