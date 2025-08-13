import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';

export default function OrderPlaced() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Use lightweight order from Checkout; fetch full order for accurate details if needed
  const [order, setOrder] = useState(state?.order || null);
  const [err, setErr] = useState('');
  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;

  useEffect(() => {
    let alive = true;
    const needFetch =
      !!token && (!order || !order.pricing || !Array.isArray(order.items) || order.items.length === 0);

    const load = async () => {
      try {
        setErr('');
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login', { replace: true, state: { from: `/order/${orderId}` } });
            return;
          }
          throw new Error(data?.error || 'Failed to fetch order details');
        }
        if (!alive) return;
        setOrder((prev) => ({ ...(prev || {}), ...(data.order || {}) }));
      } catch (e) {
        if (alive) setErr(e?.message || 'Failed to fetch order details');
      }
    };

    if (needFetch) load();
    return () => { alive = false; };
  }, [API, orderId, token, order, navigate]);

  const { itemsCount, subtotal, discount, taxes, delivery, total } = useMemo(() => {
    const items = order?.items || [];
    const itemsCount = items.reduce((a, b) => a + Number(b.qty || 0), 0);
    const hasPricing = !!order?.pricing;

    const subtotal = hasPricing
      ? Number(order.pricing?.subtotal || 0)
      : items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);

    const discount = hasPricing ? Number(order.pricing?.discount || 0) : 0;
    const taxes = hasPricing ? Number(order.pricing?.taxes || 0) : +(subtotal * 0.03).toFixed(2);
    const delivery = hasPricing ? Number(order.pricing?.delivery || 0) : (subtotal >= 499 ? 0 : 40);
    const total = hasPricing ? Number(order.pricing?.total || 0) : subtotal - discount + taxes + delivery;

    return { itemsCount, subtotal, discount, taxes, delivery, total };
  }, [order]);

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        {/* Header */}
        <div>
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Orders
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-green-700">Order placed!</h1>
          <p className="mt-2 text-gray-700">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </div>

        {/* Card */}
        <div className="mt-8 bg-white border rounded-2xl p-6 md:p-8 text-left shadow">
          <div className="flex justify-between text-sm">
            <div>
              <div className="text-gray-500">Placed on</div>
              <div className="font-semibold">
                {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Amount</div>
              <div className="font-semibold">{currency(total)}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 border rounded-2xl p-4">
              <h3 className="font-semibold">Shipping to</h3>
              <p className="text-sm text-gray-700 mt-1">
                {order?.address?.fullName}<br/>
                {order?.address?.line1}{order?.address?.line2 ? `, ${order.address.line2}` : ''}<br/>
                {order?.address?.city}, {order?.address?.state} - {order?.address?.pincode}<br/>
                {order?.address?.country}<br/>
                Phone: {order?.address?.phone}
              </p>
            </div>
            <div className="bg-gray-50 border rounded-2xl p-4">
              <h3 className="font-semibold">Summary</h3>
              <p className="text-sm text-gray-700 mt-1">
                Items: {itemsCount}<br/>
                Subtotal: {currency(subtotal)}<br/>
                Discount: -{currency(discount)}<br/>
                Taxes: {currency(taxes)}<br/>
                Delivery: {currency(delivery)}<br/>
                Total: <span className="font-semibold">{currency(total)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center">
          <Link to="/products" className="px-6 py-2.5 rounded-full text-green-700 hover:bg-green-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}