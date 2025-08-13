import { Router } from 'express';
import { Order } from './models/Order.js';
import { requireAdmin } from './auth.js';

const router = Router();

router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    const q = status ? { status } : {};
    const list = await Order.find(q)
      .populate('user', 'name email')   // <- add this
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ orders: list });
  } catch {
    return res.status(500).json({ error: 'Fetch failed' });
  }
});

router.put('/orders/:orderId/status', requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body || {};
    if (!status) return res.status(400).json({ error: 'Missing status' });

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.timeline.push({ label: note || `Status updated to ${status}`, at: new Date() });
    await order.save();

    return res.json({ order });
  } catch {
    return res.status(500).json({ error: 'Update failed' });
  }
});

export default router;