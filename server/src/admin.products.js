import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Product } from './models/Product.js';
import { requireAdmin } from './auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage });

// Admin: list products
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const list = await Product.find({}).sort({ createdAt: -1 });
    return res.json({ products: list });
  } catch {
    return res.status(500).json({ error: 'Fetch failed' });
  }
});

// Admin: create product
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const p = req.body || {};
    if (!p.name || typeof p.price !== 'number') {
      return res.status(400).json({ error: 'name and price are required' });
    }
    const created = await Product.create({
      name: p.name.trim(),
      price: p.price,
      rating: Number(p.rating || 0),
      imageUrl: p.imageUrl || '',
      description: p.description || '',
      category: p.category || 'General',
      stock: Number(p.stock || 0),
      isActive: p.isActive !== false,
    });
    return res.status(201).json({ product: created });
  } catch {
    return res.status(500).json({ error: 'Create failed' });
  }
});

// Admin: upload image
router.post('/products/upload-image', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded (field name: image)' });
    const publicUrl = `/uploads/products/${req.file.filename}`;
    return res.json({ imageUrl: publicUrl });
  } catch {
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// Admin: update product
router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product: updated });
  } catch {
    return res.status(500).json({ error: 'Update failed' });
  }
});

// Admin: delete (soft by default)
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const hard = String(req.query.hard || '').toLowerCase() === 'true';
    if (hard) {
      const del = await Product.findByIdAndDelete(req.params.id);
      if (!del) return res.status(404).json({ error: 'Product not found' });
      return res.json({ ok: true });
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product: updated });
  } catch {
    return res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;