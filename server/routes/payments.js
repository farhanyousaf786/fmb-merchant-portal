import express from 'express';
import { verifyToken } from '../database/auth.js';
import { getPool } from '../database/db.js';

// Stripe will be initialized here
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Auth middleware (same pattern as orders.js)
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, error: 'No token' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('❌ Invalid token');
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  console.log('🧪 Payment routes test endpoint hit!');
  res.json({ success: true, message: 'Payment routes are working!' });
});

// Get user's saved payment methods
router.get('/methods', auth, async (req, res) => {
  console.log('\n💳 ========== GET PAYMENT METHODS ==========');
  try {
    const userId = req.user.userId;
    console.log(`👤 User ID: ${userId}`);
    const pool = await getPool();
    
    const [methods] = await pool.query(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    
    console.log(`✅ Found ${methods.length} payment methods for user ${userId}`);
    res.json({
      success: true,
      paymentMethods: methods
    });
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods',
      details: error.message
    });
  }
});

// Create payment intent for checkout
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    const userId = req.user.userId;
    
    console.log(`\n💳 ========== CREATE PAYMENT INTENT ==========`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`💰 Amount: ${amount} ${currency.toUpperCase()}`);
    
    if (!amount || amount <= 0) {
      console.warn(`❌ Invalid amount: ${amount}`);
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    console.log(`✅ Amount validation passed`);

    // Create Stripe Payment Intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency,
    //   metadata: {
    //     userId: req.user.userId
    //   }
    // });

    // Mock response for now
    const paymentIntent = {
      id: 'pi_mock_' + Date.now(),
      client_secret: 'pi_mock_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9),
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method'
    };
    
    console.log(`✅ Payment Intent created`);
    console.log(`📋 Intent ID: ${paymentIntent.id}`);
    console.log(`🔐 Client Secret: ${paymentIntent.client_secret}`);
    console.log(`✅ ========== END CREATE PAYMENT INTENT ==========\n`);
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error(`❌ Error creating payment intent:`, error.message);
    console.error(`Stack:`, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
});

// Save payment method (after successful card setup)
router.post('/methods', auth, async (req, res) => {
  try {
    const { 
      stripePaymentMethodId, 
      type, 
      brand, 
      last4, 
      expiryMonth, 
      expiryYear,
      isDefault = false 
    } = req.body;
    
    const userId = req.user.userId;
    
    console.log(`\n💳 ========== SAVE PAYMENT METHOD ==========`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🏷️  Stripe PM ID: ${stripePaymentMethodId}`);
    console.log(`💳 Type: ${type}, Brand: ${brand}, Last4: ${last4}`);
    console.log(`📅 Expiry: ${expiryMonth}/${expiryYear}`);
    console.log(`⭐ Default: ${isDefault}`);
    
    if (!stripePaymentMethodId || !type || !last4) {
      console.warn(`❌ Missing required fields`);
      return res.status(400).json({
        success: false,
        error: 'Required payment method details missing'
      });
    }

    const pool = await getPool();
    console.log(`✅ Database pool acquired`);
    
    // If setting as default, unset other defaults
    if (isDefault) {
      console.log(`🔄 Unsetting other default methods...`);
      await pool.query(
        'UPDATE payment_methods SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
      console.log(`✅ Other defaults unset`);
    }
    
    // Insert new payment method
    console.log(`📝 Inserting new payment method...`);
    const [result] = await pool.query(`
      INSERT INTO payment_methods 
      (user_id, stripe_payment_method_id, type, brand, last4, expiry_month, expiry_year, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, stripePaymentMethodId, type, brand, last4, expiryMonth, expiryYear, isDefault]);
    
    console.log(`✅ Payment method saved`);
    console.log(`📋 Method ID: ${result.insertId}`);
    console.log(`✅ ========== END SAVE PAYMENT METHOD ==========\n`);
    
    res.json({
      success: true,
      paymentMethodId: result.insertId
    });
  } catch (error) {
    console.error(`❌ Error saving payment method:`, error.message);
    console.error(`Stack:`, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to save payment method',
      details: error.message
    });
  }
});

// Process payment for order
router.post('/confirm', auth, async (req, res) => {
  try {
    const { 
      orderId, 
      paymentIntentId, 
      paymentMethodId 
    } = req.body;
    
    console.log(`💰 Confirming payment - Order: ${orderId}, Intent: ${paymentIntentId}, Method: ${paymentMethodId}`);
    
    if (!orderId || !paymentIntentId) {
      console.warn('❌ Missing required fields: orderId or paymentIntentId');
      return res.status(400).json({
        success: false,
        error: 'Order ID and Payment Intent ID are required'
      });
    }

    const pool = await getPool();

    // Get order details
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.userId]
    );
    
    console.log(`📋 Order lookup result: ${orders.length} orders found`);
    
    if (orders.length === 0) {
      console.warn(`❌ Order ${orderId} not found for user ${req.user.userId}`);
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    const order = orders[0];
    console.log(`✅ Order found - Total: $${order.total_amount}`);
    
    // Confirm payment with Stripe
    // const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    
    // Mock successful payment for now
    const paymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
      charges: {
        data: [{
          receipt_url: `https://pay.stripe.com/receipt/mock/${paymentIntentId}`
        }]
      }
    };
    
    console.log(`🔄 Payment intent status: ${paymentIntent.status}`);
    
    // Update order with payment info
    const updateResult = await pool.query(`
      UPDATE orders 
      SET payment_status = ?, 
          stripe_payment_intent_id = ?,
          payment_method_id = ?,
          status = 'processing'
      WHERE id = ?
    `, [paymentIntent.status === 'succeeded' ? 'paid' : 'failed', paymentIntentId, paymentMethodId, orderId]);
    
    console.log(`✅ Order updated with payment info`);
    
    // Create payment record
    const [paymentResult] = await pool.query(`
      INSERT INTO payments 
      (order_id, stripe_payment_intent_id, stripe_payment_method_id, amount, currency, status, payment_method_type, receipt_url)
      VALUES (?, ?, ?, ?, ?, ?, 'card', ?)
    `, [orderId, paymentIntentId, paymentIntentId, order.total_amount, 'USD', paymentIntent.status, paymentIntent.charges.data[0].receipt_url]);
    
    console.log(`✅ Payment record created - ID: ${paymentResult.insertId}`);
    
    res.json({
      success: true,
      paymentStatus: paymentIntent.status,
      paymentId: paymentResult.insertId
    });
  } catch (error) {
    console.error('❌ Error confirming payment:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
      details: error.message
    });
  }
});

// Delete payment method
router.delete('/methods/:methodId', auth, async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();
    
    // Verify ownership
    const [methods] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ? AND user_id = ?',
      [methodId, userId]
    );
    
    if (methods.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    // Delete from Stripe
    // await stripe.paymentMethods.detach(methods[0].stripe_payment_method_id);
    
    // Delete from database
    await pool.query(
      'DELETE FROM payment_methods WHERE id = ?',
      [methodId]
    );
    
    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment method'
    });
  }
});

// Set default payment method
router.put('/methods/:methodId/default', auth, async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();
    
    // Verify ownership
    const [methods] = await pool.query(
      'SELECT * FROM payment_methods WHERE id = ? AND user_id = ?',
      [methodId, userId]
    );
    
    if (methods.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    // Unset all methods as default
    await pool.query(
      'UPDATE payment_methods SET is_default = FALSE WHERE user_id = ?',
      [userId]
    );
    
    // Set this method as default
    await pool.query(
      'UPDATE payment_methods SET is_default = TRUE WHERE id = ?',
      [methodId]
    );
    
    res.json({
      success: true,
      message: 'Default payment method updated'
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set default payment method'
    });
  }
});

// Get payment history for user (all payments across orders)
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = await getPool();
    
    const [payments] = await pool.query(`
      SELECT 
        p.*,
        o.invoice_number,
        o.total_amount as order_total,
        o.status as order_status
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment history'
    });
  }
});

// Get payment details for a specific order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;
    const pool = await getPool();
    
    // Verify order ownership
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Get payment for this order
    const [payments] = await pool.query(`
      SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC
    `, [orderId]);
    
    // Get payment method details if available
    let paymentMethod = null;
    if (orders[0].payment_method_id) {
      const [methods] = await pool.query(
        'SELECT id, type, brand, last4, expiry_month, expiry_year FROM payment_methods WHERE id = ?',
        [orders[0].payment_method_id]
      );
      paymentMethod = methods[0] || null;
    }
    
    res.json({
      success: true,
      order: {
        id: orders[0].id,
        payment_status: orders[0].payment_status,
        stripe_payment_intent_id: orders[0].stripe_payment_intent_id,
        total_amount: orders[0].total_amount
      },
      payments,
      paymentMethod
    });
  } catch (error) {
    console.error('Error fetching order payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order payment details'
    });
  }
});

export default router;
