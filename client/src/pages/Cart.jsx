import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { toImg } from '../utils/toImg';

function currency(n) {
  return `₹${n.toFixed(2)}`;
}

const PROMOS = {
  SAVE10: { code: 'SAVE10', type: 'percent', value: 10, cap: 150, minSubtotal: 299, freeShip: false },
  SAVE50: { code: 'SAVE50', type: 'flat', value: 50, minSubtotal: 499, freeShip: false },
  FREESHIP: { code: 'FREESHIP', type: 'freeship', value: 0, minSubtotal: 199, freeShip: true },
};

const TAX_RATE = 0.03; // 3% minor tax

export default function Cart() {
  const { items, increaseQty, decreaseQty, removeItem, clearCart, subtotal, count } = useCart();
  const navigate = useNavigate();

  // Promo state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMsg, setPromoMsg] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('promo') || 'null');
      if (stored?.code && PROMOS[stored.code]) {
        setAppliedPromo(PROMOS[stored.code]);
        setPromoInput(stored.code);
        setPromoMsg(`Promo ${stored.code} applied.`);
      }
    } catch (e) {
      console.warn('Failed to load promo from localStorage:', e);
    }
  }, []);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const def = PROMOS[code];
    if (!def) {
      setAppliedPromo(null);
      setPromoMsg('Invalid promo code.');
      localStorage.removeItem('promo');
      return;
    }
    if (subtotal < def.minSubtotal) {
      setAppliedPromo(def); 
      setPromoMsg(`Add items worth ${currency(def.minSubtotal - subtotal)} more to use ${code}.`);
      localStorage.setItem('promo', JSON.stringify(def));
      return;
    }
    setAppliedPromo(def);
    setPromoMsg(`Promo ${code} applied.`);
    localStorage.setItem('promo', JSON.stringify(def));
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoMsg('');
    setPromoInput('');
    localStorage.removeItem('promo');
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true, state: { from: '/checkout' } });
    } else {
      if (appliedPromo?.code) {
        localStorage.setItem('promo', JSON.stringify(appliedPromo));
        navigate('/checkout', { state: { promo: appliedPromo } });
      } else {
        navigate('/checkout');
      }
    }
  };

  const { discount, delivery, taxes, total, effectivePromoNote } = useMemo(() => {
    let discount = 0;
    let freeShipOverride = false;
    let note = '';

    if (appliedPromo) {
      if (subtotal >= (appliedPromo.minSubtotal || 0)) {
        if (appliedPromo.type === 'percent') {
          const raw = (appliedPromo.value / 100) * subtotal;
          discount = Math.min(raw, appliedPromo.cap ?? raw);
          note = `${appliedPromo.value}% off${appliedPromo.cap ? ` (max ${currency(appliedPromo.cap)})` : ''}`;
        } else if (appliedPromo.type === 'flat') {
          discount = appliedPromo.value;
          note = `${currency(appliedPromo.value)} off`;
        } else if (appliedPromo.type === 'freeship') {
          freeShipOverride = true;
          note = `Free shipping`;
        }
      } else {
        const missing = Math.max(0, (appliedPromo.minSubtotal || 0) - subtotal);
        note = `Add ${currency(missing)} more to use ${appliedPromo.code}`;
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);

    let delivery = afterDiscount < 499 ? 40 : 0;
    if (freeShipOverride) delivery = 0;

    const taxes = +(afterDiscount * TAX_RATE).toFixed(2);
    const total = afterDiscount + taxes + delivery;

    return { discount, delivery, taxes, total, effectivePromoNote: note };
  }, [subtotal, appliedPromo]);

  if (items.length === 0) {
    return (
      <section className="bg-gradient-to-b from-green-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Cart
          </span>
          <h1 className="text-4xl font-extrabold mt-3">Your Cart</h1>
          <p className="mt-3 text-gray-600">Your cart is empty. Add products to get started.</p>
          <div className="mt-6">
            <Link to="/products" className="px-6 py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Cart
          </span>
          <h1 className="text-4xl font-extrabold mt-3">Your Cart</h1>
          <p className="text-gray-600 mt-1">{count} item{count > 1 ? 's' : ''} in your bag</p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const atMax = Number.isFinite(Number(item.stock)) && item.qty >= Number(item.stock);
              return (
                <div key={item.id} className="flex items-center gap-4 card p-4">
                  <div className="img-wrap w-24 h-24">
                    <img
                      src={toImg(item.image)}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain p-1"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{currency(item.price)}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decreaseQty(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => increaseQty(item.id)}
                        disabled={atMax}
                        title={atMax ? `Max ${item.stock} in stock` : 'Increase quantity'}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-50 ${atMax ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Increase quantity"
                        aria-disabled={atMax}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-4 text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{currency(item.price * item.qty)}</p>
                  </div>
                </div>
              );
            })}

            <div className="text-right">
              <button type="button" onClick={clearCart} className="text-red-600 hover:underline">
                Clear cart
              </button>
            </div>
          </div>

          <aside className="card p-6 h-fit">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {/* Promo code */}
            <div className="mt-4">
              <label htmlFor="promo" className="block text-sm font-medium text-gray-700">Promo code</label>
              <div className="mt-1 flex gap-2">
                <input
                  id="promo"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="SAVE10 / SAVE50 / FREESHIP"
                  className="flex-1 input-outline"
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoMsg && <p className="mt-2 text-sm text-gray-700">{promoMsg}</p>}
              {appliedPromo && effectivePromoNote && (
                <p className="mt-1 text-xs text-gray-500">Note: {effectivePromoNote}</p>
              )}
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{currency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-green-700">
                <span>Discount {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                <span>-{currency(discount)}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Tax (3%)</span>
                <span>{currency(taxes)}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Delivery {delivery === 0 ? '(Free)' : ''}</span>
                <span>{currency(delivery)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>

              <p className="text-xs text-gray-500">
                Free delivery on orders of ₹499 or more (after discounts). Taxes calculated at 3%.
              </p>
            </div>

            <Button className="mt-5 w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
            <Link to="/#products" className="mt-3 inline-block w-full text-center text-green-700 hover:underline">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}