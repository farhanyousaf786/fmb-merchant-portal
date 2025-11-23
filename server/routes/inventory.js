import express from 'express';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  next();
};

// Default image used when no image is provided
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format';

// Add new item
router.post('/add', auth, async (req, res) => {
  try {
    const { name, price, image, description, note } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const normalizedImage = image && image.trim() !== '' ? image : DEFAULT_IMAGE_URL;

    const id = await Inventory.create({ name, price, image: normalizedImage, description, note });
    res.status(201).json({ success: true, id, message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ success: false, error: 'Failed to add item' });
  }
});

// Get all items
router.get('/all', auth, async (req, res) => {
  try {
    const items = await Inventory.findAll();
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch items' });
  }
});

// Update item
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image, description, note } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const normalizedImage = image && image.trim() !== '' ? image : DEFAULT_IMAGE_URL;

    const updated = await Inventory.update(id, { name, price, image: normalizedImage, description, note });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.remove(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

export default router;
