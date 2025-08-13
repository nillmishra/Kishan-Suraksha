import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRouter from './contact.js';
import { authRouter } from './auth.js';
import { connectMongo } from './db.js';
import accountRouter from './account.js';     // if addresses/shipping present
import ordersRouter from './orders.js';
import adminProductsRouter from './admin.products.js';
import adminOrdersRouter from './admin.orders.js';
import paymentsRazorpayRouter from './payments.razorpay.js';
import { Product } from './models/Product.js';

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const FLASK_URL = process.env.FLASK_URL || '';

app.use(cors({ origin: [CLIENT_URL, 'http://127.0.0.1:5173'] }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/payments/razorpay', paymentsRazorpayRouter);
app.use('/contact', contactRouter);

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
if (accountRouter) app.use('/account', accountRouter);
app.use('/orders', ordersRouter);
app.use('/admin', adminProductsRouter);
app.use('/admin', adminOrdersRouter);

// Public products for UI (active only)
app.get('/products', async (req, res) => {
  try {
    const list = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(200);
    res.json({ products: list });
  } catch {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Predict proxy (optional)
const upload = multer({ storage: multer.memoryStorage() });
app.post('/predict', upload.single('file'), async (req, res) => {
  try {
    if (!FLASK_URL) return res.status(501).json({ error: 'ML service not configured. Set FLASK_URL in .env' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype || 'application/octet-stream',
      knownLength: req.file.size,
    });

    const r = await axios.post(`${FLASK_URL}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    res.status(r.status).json(r.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data || err.message || 'Proxy error';
    res.status(status).json({ error: msg });
  }
});

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Node API running: http://localhost:${PORT}`);
    console.log(`CORS origin: ${CLIENT_URL}`);
  });
});