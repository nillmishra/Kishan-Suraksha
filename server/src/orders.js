// server/src/orders.js
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { Order } from './models/Order.js';
import { requireAuth } from './auth.js';

const router = Router();

// Create order (unchanged)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, pricing, address, shippingMode = 'standard', paymentMethod = 'COD', promoCode } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });
    if (!address || !address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({ error: 'Incomplete address' });
    }
    if (!pricing || typeof pricing.total !== 'number') return res.status(400).json({ error: 'Invalid pricing' });

    const orderId = nanoid(10);
    const now = new Date();
    const eta = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    const order = await Order.create({
      orderId,
      user: req.user.id,
      items: items.map((it) => ({
        productId: String(it.id ?? it.productId ?? ''),
        name: it.name,
        price: it.price,
        qty: it.qty,
        image: it.image || '',
      })),
      address: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India',
      },
      shippingMode,
      pricing: { ...pricing, promoCode: pricing.promoCode || promoCode || '' },
      paymentMethod: 'COD',
      status: 'PLACED',
      timeline: [{ label: 'Order placed', at: now }],
      eta,
    });

    return res.status(201).json({ orderId: order.orderId, id: order._id, order });
  } catch (e) {
    console.error('POST /orders error:', e);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// NEW: List all orders for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const q = { user: req.user.id };
    if (status) q.status = status; // optional filter

    const lim = Math.min(Number(limit) || 200, 200);
    const list = await Order.find(q).sort({ createdAt: -1 }).limit(lim);
    return res.json({ orders: list });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

// Get a specific order by orderId for the current user (unchanged)
router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;