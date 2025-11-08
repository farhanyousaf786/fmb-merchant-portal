import express from 'express';
import jwt from 'jsonwebtoken';
import Merchant from '../models/Merchant.js';

const router = express.Router();

// Middleware to verify merchant
const verifyMerchant = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const merchant = await Merchant.findByEmail(decoded.email);
    
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(403).json({ success: false, error: 'Access denied. Merchant only.' });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Business Phones Routes
router.get('/phones', verifyMerchant, async (req, res) => {
  try {
    const phones = await req.merchant.getBusinessPhones();
    res.json({ success: true, phones });
  } catch (error) {
    console.error('Get phones error:', error);
    res.status(500).json({ success: false, error: 'Failed to get business phones' });
  }
});

router.post('/phones', verifyMerchant, async (req, res) => {
  try {
    const phone = await req.merchant.addBusinessPhone(req.body);
    res.json({ success: true, phone });
  } catch (error) {
    console.error('Add phone error:', error);
    res.status(500).json({ success: false, error: 'Failed to add business phone' });
  }
});

router.put('/phones/:id', verifyMerchant, async (req, res) => {
  try {
    await req.merchant.updateBusinessPhone(req.params.id, req.body);
    res.json({ success: true, message: 'Phone updated successfully' });
  } catch (error) {
    console.error('Update phone error:', error);
    res.status(500).json({ success: false, error: 'Failed to update business phone' });
  }
});

router.delete('/phones/:id', verifyMerchant, async (req, res) => {
  try {
    await req.merchant.deleteBusinessPhone(req.params.id);
    res.json({ success: true, message: 'Phone deleted successfully' });
  } catch (error) {
    console.error('Delete phone error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete business phone' });
  }
});

// Shipping Addresses Routes
router.get('/addresses', verifyMerchant, async (req, res) => {
  try {
    const addresses = await req.merchant.getShippingAddresses();
    res.json({ success: true, addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, error: 'Failed to get shipping addresses' });
  }
});

router.post('/addresses', verifyMerchant, async (req, res) => {
  try {
    const address = await req.merchant.addShippingAddress(req.body);
    res.json({ success: true, address });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, error: 'Failed to add shipping address' });
  }
});

router.put('/addresses/:id', verifyMerchant, async (req, res) => {
  try {
    await req.merchant.updateShippingAddress(req.params.id, req.body);
    res.json({ success: true, message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, error: 'Failed to update shipping address' });
  }
});

router.delete('/addresses/:id', verifyMerchant, async (req, res) => {
  try {
    await req.merchant.deleteShippingAddress(req.params.id);
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete shipping address' });
  }
});

router.put('/addresses/:id/default', verifyMerchant, async (req, res) => {
  try {
    await req.merchant.setDefaultShippingAddress(req.params.id);
    res.json({ success: true, message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ success: false, error: 'Failed to set default address' });
  }
});

export default router;
