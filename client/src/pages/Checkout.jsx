import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { PROMOS, computePricing } from '../utils/pricing';

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Failed to load script'));
    document.body.appendChild(s);
  });

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [shippingMode, setShippingMode] = useState('standard'); 
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'

  const [promoCode, setPromoCode] = useState('');
  const [promoDef, setPromoDef] = useState(null);
  const [promoMsg, setPromoMsg] = useState('');

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if ((!items || items.length === 0) && !orderSuccess) {
      navigate('/cart', { replace: true });
    }
  }, [items, orderSuccess, navigate]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!token) return;
      try {
        setLoadingAddresses(true);
        const res = await fetch(`${API}/account/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
          const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
          if (def?._id) setSelectedAddressId(def._id);
        }
      } catch {
        // ignore
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, [API, token]);

  useEffect(() => {
    const fromState = location.state?.promo;
    if (fromState?.code && PROMOS[fromState.code]) {
      setPromoDef(PROMOS[fromState.code]);
      setPromoCode(fromState.code);
      setPromoMsg(`Promo ${fromState.code} applied.`);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem('promo') || 'null');
      if (stored?.code && PROMOS[stored.code]) {
        setPromoDef(PROMOS[stored.code]);
        setPromoCode(stored.code);
        setPromoMsg(`Promo ${stored.code} applied.`);
      }
    } catch {
      // ignore JSON parse errors
    }
  }, [location.state]);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const def = PROMOS[code];
    if (!def) {
      setPromoDef(null);
      setPromoMsg('Invalid promo code.');
      localStorage.removeItem('promo');
      return;
    }
    setPromoDef(def);
    setPromoMsg(`Promo ${code} applied.`);
    localStorage.setItem('promo', JSON.stringify(def));
  };

  const removePromo = () => {
    setPromoDef(null);
    setPromoCode('');
    setPromoMsg('');
    localStorage.removeItem('promo');
  };

  const { discount, taxes, delivery, total, note } = useMemo(
    () => computePricing({ subtotal, promoDef, shippingMode }),
    [subtotal, promoDef, shippingMode]
  );

  const currency = (n) => `₹${n.toFixed(2)}`;

  const placeOrder = async () => {
    const tokenCheck = localStorage.getItem('token');
    if (!tokenCheck) {
      navigate('/login', { replace: true, state: { from: '/checkout' } });
      return;
    }

    const addressToUse =
      addresses.find((a) => a._id === selectedAddressId) ||
      addresses.find((a) => a.isDefault) ||
      addresses[0];

    if (!addressToUse) {
      alert('Please add/select an address before placing the order.');
      return;
    }

    try {
      await fetch(`${API}/account/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCheck}` },
        body: JSON.stringify({ ...addressToUse, shippingMode }),
      });
    } catch (e) {
      console.warn('Failed to save last-used shipping address:', e);
    }

    if (paymentMethod === 'cod') {
      try {
        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCheck}` },
          body: JSON.stringify({
            items,
            pricing: { subtotal, discount, taxes, delivery, total, promoCode: promoDef?.code || '' },
            address: addressToUse,
            shippingMode,
            paymentMethod: 'COD',
          }),
        });
        const ct = res.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await res.json() : await res.text();

        if (!res.ok || !payload?.orderId) {
          const msg = typeof payload === 'string' ? payload : payload?.error || 'Order creation failed';
          throw new Error(msg);
        }

        setPlacedOrder({
          orderId: payload.orderId,
          total,
          address: addressToUse,
          createdAt: payload?.order?.createdAt,
        });
        setOrderSuccess(true);
        clearCart();
      } catch (e) {
        alert(e.message || 'Order creation failed');
      }
      return;
    }

    // Razorpay branch (ONLINE)
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      alert('Razorpay key missing. Set VITE_RAZORPAY_KEY_ID in client/.env');
      return;
    }
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const rpOrderRes = await fetch(`${API}/payments/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCheck}` },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            name: addressToUse.fullName,
            phone: addressToUse.phone,
            address: `${addressToUse.line1}${addressToUse.line2 ? ', ' + addressToUse.line2 : ''}, ${addressToUse.city}, ${addressToUse.state} - ${addressToUse.pincode}, ${addressToUse.country}`,
            shippingMode,
            promo: promoDef?.code || '',
          },
        }),
      });
      const rpOrder = await rpOrderRes.json();
      if (!rpOrderRes.ok) throw new Error(rpOrder?.error || 'Payment order creation failed');

      const rzp = new window.Razorpay({
        key: keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Kisan Suraksha',
        description: 'Order Payment',
        order_id: rpOrder.id,
        prefill: {
          name: addressToUse.fullName,
          contact: addressToUse.phone,
          email: JSON.parse(localStorage.getItem('user') || '{}')?.email || '',
        },
        notes: rpOrder.notes || {},
        theme: { color: '#4caf50' },
        handler: async (resp) => {
          try {
            const verifyRes = await fetch(`${API}/payments/razorpay/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCheck}` },
              body: JSON.stringify(resp),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData?.verified) {
              alert('Payment verification failed. Please contact support.');
              return;
            }

            const res = await fetch(`${API}/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCheck}` },
              body: JSON.stringify({
                items,
                pricing: { subtotal, discount, taxes, delivery, total, promoCode: promoDef?.code || '' },
                address: addressToUse,
                shippingMode,
                paymentMethod: 'ONLINE',
              }),
            });
            const ct = res.headers.get('content-type') || '';
            const payload = ct.includes('application/json') ? await res.json() : await res.text();

            if (!res.ok || !payload?.orderId) {
              const msg = typeof payload === 'string' ? payload : payload?.error || 'Order creation failed';
              throw new Error(msg);
            }

            setPlacedOrder({
              orderId: payload.orderId,
              total,
              address: addressToUse,
              createdAt: payload?.order?.createdAt,
            });
            setOrderSuccess(true);
            clearCart();
          } catch (err) {
            alert(err.message || 'Order creation failed after payment');
          }
        },
        modal: { ondismiss: function () {} },
      });

      rzp.open();
    } catch (e) {
      alert(e.message || 'Payment failed. Try again.');
    }
  };

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Checkout
          </span>
          <h1 className="text-4xl font-extrabold mt-3">Complete your order</h1>
          <p className="text-gray-700 mt-2">Choose address, delivery, and payment.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          <div className="lg:col-span-3 card p-6 flex flex-col">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>

            {!token && (
              <p className="mt-2 text-sm text-gray-600">
                Please{' '}
                <button
                  className="text-green-700 underline"
                  onClick={() => navigate('/login', { replace: true, state: { from: '/checkout' } })}
                >
                  log in
                </button>{' '}
                to use saved addresses.
              </p>
            )}

            {token && (
              <>
                {loadingAddresses ? (
                  <p className="mt-3 text-sm text-gray-500">Loading addresses…</p>
                ) : addresses.length === 0 ? (
                  <div className="mt-4">
                    <p className="text-gray-700">No saved addresses yet.</p>
                    <Button className="mt-3" onClick={() => navigate('/address/new')}>
                      Add New Address
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {addresses.map((a) => (
                      <label
                        key={a._id}
                        className="card-muted p-3 flex gap-3 items-start cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a._id}
                          onChange={() => setSelectedAddressId(a._id)}
                        />
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {a.label ? `${a.label} — ` : ''}
                            {a.fullName}
                            {a.isDefault ? (
                              <span className="ml-2 text-xs text-white bg-green-600 px-2 py-0.5 rounded">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <div className="text-gray-700">
                            {a.line1}
                            {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}, {a.country}
                          </div>
                          <div className="text-gray-600">Phone: {a.phone}</div>
                        </div>
                      </label>
                    ))}
                    <div className="mt-2">
                      <Button variant="outline" onClick={() => navigate('/address/new')}>
                        Add New Address
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Delivery options */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Delivery Options</h3>
              <div className="mt-3 flex flex-col gap-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMode === 'standard'}
                    onChange={() => setShippingMode('standard')}
                  />
                  <span>Standard (₹40 if order below ₹499; free otherwise)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMode === 'express'}
                    onChange={() => setShippingMode('express')}
                  />
                  <span>Express (₹99 extra)</span>
                </label>
              </div>
            </div>

            {/* Payment method */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <div className="mt-3 flex flex-col gap-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pay"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pay"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <span>Online Payment (Razorpay)</span>
                </label>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-2 card p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Promo code</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="SAVE10 / SAVE50 / FREESHIP"
                  className="flex-1 input-outline"
                />
                {promoDef ? (
                  <button
                    type="button"
                    onClick={removePromo}
                    className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoMsg && <p className="mt-2 text-sm text-gray-700">{promoMsg}</p>}
              {note && <p className="mt-1 text-xs text-gray-500">Note: {note}</p>}
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Discount {promoDef ? `(${promoDef.code})` : ''}</span>
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
                Free delivery on orders of ₹499 or more (after discounts). Taxes @ 3%.
              </p>
            </div>

            <Button className="mt-5 w-full" onClick={placeOrder}>
              Place Order
            </Button>
          </aside>
        </div>
      </div>

      {/* Success Modal */}
      {orderSuccess && placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() =>
            navigate(`/order/${placedOrder.orderId}`, { replace: true, state: { order: placedOrder } })
          }
          onTrack={() => navigate(`/order/${placedOrder.orderId}/track`, { replace: true })}
        />
      )}
    </section>
  );
}

function OrderSuccessModal({ order, onClose, onTrack }) {
  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md card p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-600">
            <path fill="currentColor" d="M9 16.2l-3.5-3.6L4 14.1l5 5 11-11-1.5-1.4z"/>
          </svg>
        </div>
        <h3 className="mt-4 text-2xl font-extrabold text-green-700">Order placed!</h3>
        <p className="mt-1 text-gray-700">Thank you for your purchase.</p>

        <div className="mt-4 text-sm text-left card-muted p-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID</span>
            <span className="font-semibold">{order.orderId}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-600">Amount</span>
            <span className="font-semibold">{currency(order.total)}</span>
          </div>
          <div className="mt-3 text-gray-700">
            <div className="font-semibold">Shipping to</div>
            <div className="text-sm">
              {order.address?.fullName}<br/>
              {order.address?.line1}{order.address?.line2 ? `, ${order.address.line2}` : ''}<br/>
              {order.address?.city}, {order.address?.state} - {order.address?.pincode}<br/>
              {order.address?.country}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={onTrack}>Track Order</Button>
          <Button variant="outline" onClick={onClose}>View Details</Button>
        </div>
      </div>
    </div>
  );
}