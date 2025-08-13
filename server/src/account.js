import { Router } from 'express';
import { User } from './models/User.js';
import { requireAuth } from './auth.js';

const router = Router();

/* -------------------- Addresses CRUD -------------------- */

// Get all addresses
router.get('/addresses', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    return res.json({ addresses: user?.addresses || [] });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Add new address
router.post('/addresses', requireAuth, async (req, res) => {
  try {
    const a = req.body || {};
    const required = ['fullName','phone','line1','city','state','pincode'];
    for (const k of required) if (!String(a[k] || '').trim()) return res.status(400).json({ error: `Missing ${k}` });

    const user = await User.findById(req.user.id).select('addresses');
    const isFirst = (user.addresses || []).length === 0;

    const newAddress = {
      label: String(a.label || '').trim(),
      fullName: String(a.fullName).trim(),
      phone: String(a.phone).trim(),
      line1: String(a.line1).trim(),
      line2: String(a.line2 || '').trim(),
      city: String(a.city).trim(),
      state: String(a.state).trim(),
      pincode: String(a.pincode).trim(),
      country: String(a.country || 'India').trim(),
      isDefault: a.isDefault === true || isFirst, // first address becomes default
    };

    // If set default true, unset others
    if (newAddress.isDefault) {
      user.addresses.forEach(ad => ad.isDefault = false);
    }
    user.addresses.push(newAddress);
    await user.save();
    return res.status(201).json({ addresses: user.addresses });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update address
router.put('/addresses/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const a = req.body || {};
    const user = await User.findById(req.user.id).select('addresses');
    const addr = user.addresses.id(id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    // Update fields
    ['label','fullName','phone','line1','line2','city','state','pincode','country'].forEach(k => {
      if (a[k] !== undefined) addr[k] = String(a[k]).trim();
    });

    if (a.isDefault === true) {
      user.addresses.forEach(ad => ad.isDefault = false);
      addr.isDefault = true;
    }
    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete address
router.delete('/addresses/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(req.user.id).select('addresses');
    const addr = user.addresses.id(id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    const wasDefault = addr.isDefault;
    addr.remove();

    // If deleted default, set first address as default if exists
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;

    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Set default address
router.patch('/addresses/:id/default', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(req.user.id).select('addresses');
    const addr = user.addresses.id(id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    user.addresses.forEach(ad => ad.isDefault = false);
    addr.isDefault = true;
    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* --------- Keep last-used shipping (compatibility) --------- */
router.get('/shipping', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('shipping');
    return res.json({ shipping: user?.shipping || {} });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/shipping', requireAuth, async (req, res) => {
  try {
    const s = req.body || {};
    const required = ['fullName','phone','line1','city','state','pincode'];
    for (const k of required) if (!String(s[k] || '').trim()) return res.status(400).json({ error: `Missing ${k}` });

    const update = {
      fullName: String(s.fullName).trim(),
      phone: String(s.phone).trim(),
      line1: String(s.line1).trim(),
      line2: String(s.line2 || '').trim(),
      city: String(s.city).trim(),
      state: String(s.state).trim(),
      pincode: String(s.pincode).trim(),
      country: String(s.country || 'India').trim(),
      shippingMode: s.shippingMode === 'express' ? 'express' : 'standard',
      updatedAt: new Date(),
    };
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { shipping: update } }, { new: true, select: 'shipping' });
    return res.json({ shipping: user.shipping, message: 'Shipping saved' });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;