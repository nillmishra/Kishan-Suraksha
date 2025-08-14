import { Router } from 'express';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import { Product } from './models/Product.js';
import { requireAuth } from './auth.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
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

    let createdOrder = null;

    await session.withTransaction(async () => {
      // Decrement stock atomically for each item
      for (const it of items) {
        const productId = String(it.id ?? it.productId ?? '');
        const qty = Number(it.qty || 0);
        if (!productId || qty <= 0) throw new Error('Invalid item in cart');

        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: qty }, isActive: true },
          { $inc: { stock: -qty } },
          { new: true, session }
        );
        if (!updated) {
          throw new Error('Insufficient stock for one or more items');
        }
      }

      // Create order within the same transaction
      const [order] = await Order.create(
        [
          {
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
          },
        ],
        { session }
      );

      createdOrder = order;
    });

    session.endSession();

    return res.status(201).json({ orderId: createdOrder.orderId, id: createdOrder._id, order: createdOrder });
  } catch (e) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    const msg = e?.message || 'Failed to create order';
    if (/Insufficient stock/i.test(msg)) {
      return res.status(409).json({ error: msg });
    }
    console.error('POST /orders error:', e);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const q = { user: req.user.id };
    if (status) q.status = status; 

    const lim = Math.min(Number(limit) || 200, 200);
    const list = await Order.find(q).sort({ createdAt: -1 }).limit(lim);
    return res.json({ orders: list });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

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