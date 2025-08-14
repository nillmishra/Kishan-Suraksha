import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { requireAuth } from './auth.js';

const router = Router();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn('RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET missing in .env');
}

const razor = new Razorpay({ key_id, key_secret });

router.post('/order', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};
    // Amount must be in paise (integer)
    const amt = Math.max(1, Math.floor(Number(amount || 0)));
    if (!amt) return res.status(400).json({ error: 'Invalid amount' });

    const order = await razor.orders.create({
      amount: amt,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return res.json(order);
  } catch (e) {
    console.error('Razorpay order error:', e);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

router.post('/verify', requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Missing payment fields' });
    }

    const hmac = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const verified = hmac === razorpay_signature;
    if (!verified) return res.status(400).json({ verified: false, error: 'Invalid signature' });

    return res.json({ verified: true });
  } catch (e) {
    console.error('Razorpay verify error:', e);
    return res.status(500).json({ verified: false, error: 'Verification failed' });
  }
});

export default router;