// client/src/utils/pricing.js
export const PROMOS = {
  SAVE10: { code: 'SAVE10', type: 'percent', value: 10, cap: 150, minSubtotal: 299, freeShip: false },
  SAVE50: { code: 'SAVE50', type: 'flat', value: 50, minSubtotal: 499, freeShip: false },
  FREESHIP: { code: 'FREESHIP', type: 'freeship', value: 0, minSubtotal: 199, freeShip: true },
};

export function evaluatePromo(subtotal, promoDef) {
  if (!promoDef) return { discount: 0, freeShipOverride: false, note: '' };
  if (subtotal < (promoDef.minSubtotal || 0)) {
    const missing = (promoDef.minSubtotal || 0) - subtotal;
    return { discount: 0, freeShipOverride: false, note: `Add ₹${missing.toFixed(2)} more to use ${promoDef.code}` };
  }

  if (promoDef.type === 'percent') {
    const raw = (promoDef.value / 100) * subtotal;
    const discount = Math.min(raw, promoDef.cap ?? raw);
    const note = `${promoDef.value}% off${promoDef.cap ? ` (max ₹${promoDef.cap})` : ''}`;
    return { discount, freeShipOverride: false, note };
  } else if (promoDef.type === 'flat') {
    return { discount: promoDef.value, freeShipOverride: false, note: `₹${promoDef.value} off` };
  } else if (promoDef.type === 'freeship') {
    return { discount: 0, freeShipOverride: true, note: `Free shipping` };
  }
  return { discount: 0, freeShipOverride: false, note: '' };
}

// shippingMode: 'standard' | 'express'
export function computePricing({
  subtotal,
  promoDef,
  shippingMode = 'standard',
  freeShippingThreshold = 499,
  baseDelivery = 40,
  expressExtra = 99,
  taxRate = 0.03,
}) {
  const { discount, freeShipOverride, note } = evaluatePromo(subtotal, promoDef);
  const afterDiscount = Math.max(0, subtotal - discount);

  let delivery = afterDiscount < freeShippingThreshold ? baseDelivery : 0;
  if (shippingMode === 'express') delivery += expressExtra;
  if (freeShipOverride) delivery = shippingMode === 'express' ? expressExtra : 0;

  const taxes = +(afterDiscount * taxRate).toFixed(2);
  const total = afterDiscount + taxes + delivery;

  return {
    discount,
    afterDiscount,
    taxes,
    delivery,
    total,
    note,
  };
}