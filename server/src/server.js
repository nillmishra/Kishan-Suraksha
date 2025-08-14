import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import contactRouter from './contact.js';
import { authRouter } from './auth.js';
import { connectMongo } from './db.js';
import accountRouter from './account.js';
import ordersRouter from './orders.js';
import adminProductsRouter from './admin.products.js';
import adminOrdersRouter from './admin.orders.js';
import paymentsRazorpayRouter from './payments.razorpay.js';
import { Product } from './models/Product.js';

const app = express();

const PORT = process.env.PORT || 5000;

// Allow multiple origins via comma-separated env
const ORIGINS = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ML service URL (Render ML service)
const MODEL_API_URL = process.env.MODEL_API_URL || process.env.FLASK_URL || '';

app.set('trust proxy', 1); // needed for secure cookies behind Render proxy

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS (supports credentials and multiple allowed origins)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // non-browser or same-origin
      if (ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);

// Routers
app.use('/payments/razorpay', paymentsRazorpayRouter);
app.use('/contact', contactRouter);
app.use('/auth', authRouter);
if (accountRouter) app.use('/account', accountRouter);
app.use('/orders', ordersRouter);
app.use('/admin', adminProductsRouter);
app.use('/admin', adminOrdersRouter);

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Health routes
app.get('/', (_req, res) => res.json({ ok: true, service: 'ks-server', mlConfigured: Boolean(MODEL_API_URL) }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Public products for UI (active only)
app.get('/products', async (_req, res) => {
  try {
    const list = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(200);
    res.json({ products: list });
  } catch (e) {
    console.error('Products error:', e.message);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Predict proxy
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
app.post('/api/ml/predict', upload.single('file'), async (req, res) => {
  try {
    if (!MODEL_API_URL) return res.status(501).json({ error: 'ML service not configured. Set MODEL_API_URL or FLASK_URL' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype || 'application/octet-stream',
      knownLength: req.file.size,
    });

    const r = await axios.post(`${MODEL_API_URL}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 120000, // allow cold start
    });

    res.status(r.status).json(r.data);
  } catch (err) {
    console.error('ML proxy error:', err?.response?.data || err.message);
    const status = err?.response?.status || 500;
    res.status(status).json({ error: 'ML proxy failed' });
  }
});

// Seed admin on boot (Option A)
// Seed admin on boot (Option A) — FIXED to use passwordHash and patch existing admin
async function ensureAdmin() {
  try {
    const email = String(process.env.ADMIN_EMAIL || '').toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Admin';
    const collection = process.env.USERS_COLLECTION || 'users';

    if (!email || !password) {
      console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping admin seed');
      return;
    }

    const col = mongoose.connection.collection(collection);
    const existing = await col.findOne({ email });

    if (existing) {
      // Patch existing admin if it has no passwordHash yet
      if (!existing.passwordHash) {
        const hash = await bcrypt.hash(password, 10);
        await col.updateOne(
          { _id: existing._id },
          { $set: { passwordHash: hash, isAdmin: true, role: 'admin', name }, $unset: { password: '' } }
        );
        console.log('Admin passwordHash set for:', email);
      } else {
        console.log('Admin user already exists with passwordHash');
      }
      return;
    }

    // Create admin if not exists (store passwordHash)
    const hash = await bcrypt.hash(password, 10);
    await col.insertOne({
      email,
      passwordHash: hash,
      role: 'admin',
      isAdmin: true,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Admin user created:', email);
  } catch (e) {
    if (e && e.code === 11000) {
      console.log('Admin already exists (duplicate key)');
    } else {
      console.error('ensureAdmin error:', e);
    }
  }
}
// Start server after DB connects
connectMongo()
  .then(async () => {
    if (process.env.SEED_ON_BOOT === 'true') {
      await ensureAdmin();
    }
    app.listen(PORT, () => {
      console.log(`Node API running: http://localhost:${PORT}`);
      console.log('Allowed CORS origins:', ORIGINS);
      console.log('MODEL_API_URL:', MODEL_API_URL || '(not set)');
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });