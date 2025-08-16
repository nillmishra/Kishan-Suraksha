import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';

const router = Router();

// Use one shared secret for both sign and verify
const SECRET = process.env.JWT_SECRET || 'dev';

function createToken(user, secret) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, isAdmin: !!user.isAdmin },
    secret,
    { expiresIn: '8h' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const raw = header.startsWith('Bearer ') ? header.slice(7) : null;

  // Clean token: handle quotes and "null"/"undefined"
  const token = raw && raw !== 'null' && raw !== 'undefined' ? raw.replace(/^"(.+)"$/, '$1').trim() : '';

  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email: String(email).toLowerCase(), passwordHash: hash });
    return res.status(201).json({ message: 'Registered successfully.' });
  } catch (e) {
    console.error('Register error:', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash +password +isAdmin +name +email');
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const hash = user.passwordHash || user.password;
    if (!hash) return res.status(500).json({ error: 'Password not set for user.' });

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = createToken(user, SECRET);
    return res.json({
      access_token: token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
    });
  } catch (e) {
    console.error('Login error:', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('name email isAdmin');
  return res.json({
    user: user ? { id: user._id, name: user.name, email: user.email, isAdmin: !!user.isAdmin } : req.user,
  });
});

export { router as authRouter };