import express from 'express';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateInvoicePdf({
  orderId,
  status,
  contact_first_name,
  contact_last_name,
  contact_email,
  contact_phone,
  delivery_address,
  delivery_city,
  delivery_country,
  delivery_postal,
  subtotalAmount,
  taxAmount,
  deliveryFee,
  discountAmount,
  preparedItems,
}) {
  const invoiceNumber = `INV${new Date().getFullYear()}-${String(orderId).padStart(5, '0')}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const pdfFilename = `invoice-${orderId}.pdf`;
  const pdfPath = path.join(invoicesDir, pdfFilename);
  const pdfUrl = `/invoices/${pdfFilename}`;

  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Header - Company Info
  doc.fontSize(24).fillColor('#DEAD25').text('Famous Moms Bakery', 50, 50);
  doc.fontSize(10).fillColor('#666666')
    .text('Premium Artisan Breads', 50, 80)
    .text('Email: info@famousmomsbakery.com', 50, 95)
    .text('Phone: (555) 123-4567', 50, 110);

  // Invoice Title and Number
  doc.fontSize(20).fillColor('#000000').text('INVOICE', 400, 50, { align: 'right' });
  doc.fontSize(10).fillColor('#666666')
    .text(`Invoice #: ${invoiceNumber}`, 400, 80, { align: 'right' })
    .text(`Date: ${invoiceDate}`, 400, 95, { align: 'right' })
    .text(`Status: ${status.toUpperCase()}`, 400, 110, { align: 'right' });

  // Line separator
  doc.moveTo(50, 140).lineTo(550, 140).stroke('#DEAD25');

  // Bill To Section
  doc.fontSize(12).fillColor('#000000').text('BILL TO:', 50, 160);
  doc.fontSize(10).fillColor('#333333');
  
  const customerName = `${contact_first_name || ''} ${contact_last_name || ''}`.trim();
  if (customerName) doc.text(customerName, 50, 180);
  if (delivery_address) doc.text(delivery_address, 50, 195);
  
  const cityPostal = `${delivery_city || ''} ${delivery_postal || ''}`.trim();
  if (cityPostal) doc.text(cityPostal, 50, 210);
  if (delivery_country) doc.text(delivery_country, 50, 225);
  if (contact_email) doc.text(`Email: ${contact_email}`, 50, 240);
  if (contact_phone) doc.text(`Phone: ${contact_phone}`, 50, 255);

  // Items Table Header
  const tableTop = 300;
  doc.fontSize(10).fillColor('#FFFFFF');
  doc.rect(50, tableTop, 500, 25).fill('#DEAD25');
  
  doc.fillColor('#FFFFFF')
    .text('Item', 60, tableTop + 8)
    .text('Type', 250, tableTop + 8)
    .text('Qty', 350, tableTop + 8)
    .text('Unit Price', 400, tableTop + 8)
    .text('Total', 490, tableTop + 8, { align: 'right', width: 50 });

  // Items
  let yPosition = tableTop + 35;
  doc.fillColor('#333333');
  
  preparedItems.forEach((item, index) => {
    const itemName = item.name || 'Bread';
    const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
    
    doc.rect(50, yPosition - 5, 500, 25).fill(bgColor);
    doc.fillColor('#333333')
      .text(itemName, 60, yPosition)
      .text(item.type, 250, yPosition)
      .text(item.quantity.toString(), 350, yPosition)
      .text(`$${item.unit_price.toFixed(2)}`, 400, yPosition)
      .text(`$${item.total.toFixed(2)}`, 490, yPosition, { align: 'right', width: 50 });
    
    yPosition += 25;
  });

  // Summary Section
  yPosition += 20;
  const summaryX = 350;
  
  doc.fontSize(10).fillColor('#666666');
  doc.text('Subtotal:', summaryX, yPosition);
  doc.text(`$${subtotalAmount.toFixed(2)}`, 490, yPosition, { align: 'right', width: 50 });
  
  yPosition += 20;
  doc.text(`Tax (5%):`, summaryX, yPosition);
  doc.text(`$${taxAmount.toFixed(2)}`, 490, yPosition, { align: 'right', width: 50 });
  
  yPosition += 20;
  doc.text('Delivery Fee:', summaryX, yPosition);
  doc.text(`$${deliveryFee.toFixed(2)}`, 490, yPosition, { align: 'right', width: 50 });
  
  if (discountAmount > 0) {
    yPosition += 20;
    doc.text('Discount:', summaryX, yPosition);
    doc.text(`-$${discountAmount.toFixed(2)}`, 490, yPosition, { align: 'right', width: 50 });
  }

  // Total
  yPosition += 25;
  doc.rect(350, yPosition - 5, 200, 30).fill('#DEAD25');
  doc.fontSize(12).fillColor('#FFFFFF')
    .text('TOTAL:', summaryX + 10, yPosition + 5)
    .text(`$${(subtotalAmount + taxAmount + deliveryFee - discountAmount).toFixed(2)}`, 
          490, yPosition + 5, { align: 'right', width: 50 });

  // Footer
  doc.fontSize(9).fillColor('#999999')
    .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 })
    .text('For questions about this invoice, please contact us at info@famousmomsbakery.com', 
          50, 715, { align: 'center', width: 500 });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`✅ Invoice PDF generated: ${pdfPath}`);
      resolve();
    });
    writeStream.on('error', (err) => {
      console.error('❌ Error writing PDF:', err);
      reject(err);
    });
  });

  return { invoiceNumber, pdfUrl };
}

// Create new order (draft or submitted) with checkout details
router.post('/', auth, async (req, res) => {
  console.log('🧾 Create order request received');
  try {
    const userId = req.user.userId;
    const {
      status = 'draft',
      items,
      contact_first_name,
      contact_last_name,
      contact_email,
      contact_phone,
      delivery_address,
      delivery_city,
      delivery_country,
      delivery_postal,
      notes,
      payment_method_id,
      stripe_payment_intent_id,
      payment_status = 'pending',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must have at least one item' });
    }

    if (!['draft', 'submitted'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    const pool = await getPool();

    // Fetch product names for the items
    const inventoryIds = items.map(item => item.inventory_id);
    const [inventoryItems] = await pool.query(
      `SELECT id, name FROM inventory WHERE id IN (?)`,
      [inventoryIds]
    );
    
    const inventoryMap = {};
    inventoryItems.forEach(inv => {
      inventoryMap[inv.id] = inv.name;
    });

    // Calculate totals
    let subtotalAmount = 0;
    const preparedItems = items.map((item) => {
      const unitPrice = Number(item.unit_price || 0);
      const quantity = Number(item.quantity || 0);
      const lineTotal = unitPrice * quantity;
      subtotalAmount += lineTotal;
      return {
        inventory_id: item.inventory_id,
        name: inventoryMap[item.inventory_id] || 'Product',
        type: item.type,
        unit_price: unitPrice,
        quantity,
        total: lineTotal,
      };
    });

    // Tax / fees (simple example: 5% tax, fixed delivery, no discount)
    const TAX_RATE = 0.05;
    const DELIVERY_FEE = 0; // set non-zero if needed
    const DISCOUNT = 0;

    const taxAmount = Number((subtotalAmount * TAX_RATE).toFixed(2));
    const deliveryFee = DELIVERY_FEE;
    const discountAmount = DISCOUNT;
    const totalAmount = subtotalAmount + taxAmount + deliveryFee - discountAmount;

    // Insert order
    const [orderResult] = await pool.query(
      `INSERT INTO orders (
        user_id,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        delivery_address, delivery_city, delivery_country, delivery_postal,
        notes,
        subtotal_amount, tax_amount, delivery_fee, discount_amount, total_amount,
        payment_method_id, stripe_payment_intent_id, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        contact_first_name || null,
        contact_last_name || null,
        contact_email || null,
        contact_phone || null,
        delivery_address || null,
        delivery_city || null,
        delivery_country || null,
        delivery_postal || null,
        notes || null,
        subtotalAmount,
        taxAmount,
        deliveryFee,
        discountAmount,
        totalAmount,
        payment_method_id || null,
        stripe_payment_intent_id || null,
        payment_status,
      ]
    );

    const orderId = orderResult.insertId;

    // Create initial tracking entry
    await pool.query(
      `INSERT INTO order_tracking (order_id, status, notes, updated_by) 
       VALUES (?, ?, ?, ?)`,
      [orderId, status, 'Order created', userId]
    );

    // Insert order items
    for (const it of preparedItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, inventory_id, type, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, it.inventory_id, it.type, it.unit_price, it.quantity, it.total]
      );
    }

    const { invoiceNumber, pdfUrl } = await generateInvoicePdf({
      orderId,
      status,
      contact_first_name,
      contact_last_name,
      contact_email,
      contact_phone,
      delivery_address,
      delivery_city,
      delivery_country,
      delivery_postal,
      subtotalAmount,
      taxAmount,
      deliveryFee,
      discountAmount,
      preparedItems,
    });

    await pool.query(
      'UPDATE orders SET invoice_number = ?, invoice_pdf_url = ? WHERE id = ?',
      [invoiceNumber, pdfUrl, orderId]
    );

    // Create payment record if payment info is provided
    if (stripe_payment_intent_id && payment_status === 'paid') {
      console.log(`💳 Creating payment record for order ${orderId}...`);
      await pool.query(`
        INSERT INTO payments 
        (order_id, stripe_payment_intent_id, stripe_payment_method_id, amount, currency, status, payment_method_type, receipt_url)
        VALUES (?, ?, ?, ?, ?, ?, 'card', ?)
      `, [
        orderId, 
        stripe_payment_intent_id, 
        payment_method_id || null, 
        totalAmount, 
        'USD', 
        'succeeded',
        `https://pay.stripe.com/receipt/mock/${stripe_payment_intent_id}`
      ]);
      console.log(`✅ Payment record created for order ${orderId}`);
    }

    console.log(`✅ Order ${orderId} created for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        status,
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        invoice_number: invoiceNumber,
        invoice_pdf_url: pdfUrl,
      },
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Get orders list (admin sees all, others see their own) with total quantity and invoice info
router.get('/', auth, async (req, res) => {
  console.log('📄 List orders request received');
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const pool = await getPool();

    let query;
    let params;

    if (userRole === 'admin') {
      // Admins can see all orders
      query = `SELECT 
         o.id,
         o.total_amount,
         o.created_at,
         o.invoice_pdf_url,
         o.payment_status,
         o.stripe_payment_intent_id,
         COALESCE(SUM(oi.quantity), 0) AS total_quantity,
         GROUP_CONCAT(DISTINCT CONCAT(i.name, ' (', oi.type, ')') SEPARATOR ', ') AS item_names
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN inventory i ON oi.inventory_id = i.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`;
      params = [];
    } else {
      // Merchants/staff see only their own orders
      query = `SELECT 
         o.id,
         o.total_amount,
         o.created_at,
         o.invoice_pdf_url,
         o.payment_status,
         o.stripe_payment_intent_id,
         COALESCE(SUM(oi.quantity), 0) AS total_quantity,
         GROUP_CONCAT(DISTINCT CONCAT(i.name, ' (', oi.type, ')') SEPARATOR ', ') AS item_names
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN inventory i ON oi.inventory_id = i.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`;
      params = [userId];
    }

    const [orders] = await pool.query(query, params);
    
    // Get current status and tracking number for each order from order_tracking
    for (let order of orders) {
      const [tracking] = await pool.query(
        `SELECT status, tracking_number FROM order_tracking 
         WHERE order_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [order.id]
      );
      if (tracking.length > 0) {
        order.status = tracking[0].status;
        order.tracking_number = tracking[0].tracking_number;
      } else {
        order.status = 'draft';
        order.tracking_number = null;
      }
    }
    
    console.log('📊 Sample order data:', orders[0]);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Get single order details with tracking history
router.get('/:id', auth, async (req, res) => {
  console.log('📋 Get order details request received');
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const pool = await getPool();

    // Check if order exists and user has access
    const [orders] = await pool.query('SELECT user_id FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Merchants can only see their own orders
    if (userRole !== 'admin' && orders[0].user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Import Order model dynamically
    const Order = (await import('../models/Order.js')).default;
    const orderDetails = await Order.findById(id);

    res.json({ success: true, order: orderDetails });
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  console.log('🔄 Update order status request received');
  try {
    const { id } = req.params;
    const { status, notes, decline_reason } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const validStatuses = ['draft', 'submitted', 'processing', 'shipped', 'delivered', 'cancelled', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const Order = (await import('../models/Order.js')).default;
    
    // Get current tracking number if not provided
    const pool = await getPool();
    const [currentOrder] = await pool.query('SELECT tracking_number FROM orders WHERE id = ?', [id]);
    const currentTrackingNumber = currentOrder[0]?.tracking_number || null;
    
    await Order.updateStatus({
      orderId: id,
      status,
      trackingNumber: currentTrackingNumber,
      notes,
      updatedBy: userId,
      declineReason: status === 'declined' ? decline_reason : null
    });

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// Update tracking number (admin only)
router.put('/:id/tracking', auth, async (req, res) => {
  console.log('📦 Update tracking number request received');
  try {
    const { id } = req.params;
    const { tracking_number, notes } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (!tracking_number) {
      return res.status(400).json({ success: false, error: 'Tracking number is required' });
    }

    const Order = (await import('../models/Order.js')).default;
    await Order.updateTrackingNumber({
      orderId: id,
      trackingNumber: tracking_number,
      notes,
      updatedBy: userId
    });

    res.json({ success: true, message: 'Tracking number updated successfully' });
  } catch (error) {
    console.error('❌ Error updating tracking number:', error);
    res.status(500).json({ success: false, error: 'Failed to update tracking number' });
  }
});

export default router;
