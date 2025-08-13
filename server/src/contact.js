import { Router } from 'express';
import { Contact } from './models/Contact.js';

const router = Router();

// Simple per-IP rate limit: 1 request / 30s
const hits = new Map();
function limited(ip, windowMs = 30000) {
  const now = Date.now();
  const last = hits.get(ip) || 0;
  if (now - last < windowMs) return true;
  hits.set(ip, now);
  return false;
}

const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));

router.post('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    if (limited(ip)) return res.status(429).json({ error: 'Please wait a moment and try again.' });

    const { name, email, message } = req.body || {};
    if (!String(name || '').trim()) return res.status(400).json({ error: 'Name is required' });
    if (!isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
    if (!String(message || '').trim() || String(message).trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    await Contact.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
      ip,
      ua: req.headers['user-agent'] || '',
    });

    return res.status(201).json({ ok: true, message: 'We received your message.' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;