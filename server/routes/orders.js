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
  const invoiceNumber = `INV${new Date().getFullYear()}-${orderId}`;
  const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const pdfFilename = `invoice-${orderId}.pdf`;
  const pdfPath = path.join(invoicesDir, pdfFilename);
  const pdfUrl = `/invoices/${pdfFilename}`;

  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  doc.fontSize(18).text('Invoice', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`);
  doc.text(`Order ID: ${orderId}`);
  doc.text(`Status: ${status}`);
  doc.moveDown();
  doc.text('Bill To:');
  if (contact_first_name || contact_last_name) {
    doc.text(`${contact_first_name || ''} ${contact_last_name || ''}`.trim());
  }
  if (delivery_address) doc.text(delivery_address);
  if (delivery_city || delivery_postal) {
    doc.text(`${delivery_city || ''} ${delivery_postal || ''}`.trim());
  }
  if (delivery_country) doc.text(delivery_country);
  if (contact_email) doc.text(`Email: ${contact_email}`);
  if (contact_phone) doc.text(`Phone: ${contact_phone}`);
  doc.moveDown();

  doc.text('Items:');
  preparedItems.forEach((it) => {
    doc.text(
      `- ${it.type} | Qty: ${it.quantity} | Unit: ${it.unit_price.toFixed(2)} | Total: ${it.total.toFixed(2)}`
    );
  });
  doc.moveDown();

  doc.text(`Subtotal: ${subtotalAmount.toFixed(2)}`);
  doc.text(`Tax: ${taxAmount.toFixed(2)}`);
  doc.text(`Delivery: ${deliveryFee.toFixed(2)}`);
  doc.text(`Discount: ${discountAmount.toFixed(2)}`);
  doc.text(`Total: ${(subtotalAmount + taxAmount + deliveryFee - discountAmount).toFixed(2)}`);

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
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
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must have at least one item' });
    }

    if (!['draft', 'submitted'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    const pool = await getPool();

    // Calculate totals
    let subtotalAmount = 0;
    const preparedItems = items.map((item) => {
      const unitPrice = Number(item.unit_price || 0);
      const quantity = Number(item.quantity || 0);
      const lineTotal = unitPrice * quantity;
      subtotalAmount += lineTotal;
      return {
        inventory_id: item.inventory_id,
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
        user_id, status,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        delivery_address, delivery_city, delivery_country, delivery_postal,
        notes,
        subtotal_amount, tax_amount, delivery_fee, discount_amount, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        status,
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
      ]
    );

    const orderId = orderResult.insertId;

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
         o.status,
         o.total_amount,
         o.created_at,
         o.invoice_pdf_url,
         COALESCE(SUM(oi.quantity), 0) AS total_quantity
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`;
      params = [];
    } else {
      // Merchants/staff see only their own orders
      query = `SELECT 
         o.id,
         o.status,
         o.total_amount,
         o.created_at,
         o.invoice_pdf_url,
         COALESCE(SUM(oi.quantity), 0) AS total_quantity
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`;
      params = [userId];
    }

    const [orders] = await pool.query(query, params);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

export default router;
