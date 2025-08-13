// src/pages/Orders.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { toImg } from '../utils/toImg';

export default function Orders() {
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);

  const fetchOrder = async (e) => {
    e?.preventDefault?.();
    if (!orderId.trim()) {
      setErr('Please enter your Order ID.');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API}/orders/${encodeURIComponent(orderId.trim())}`, { headers });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to fetch order');
      setOrder(data.order || null);
    } catch (e) {
      setOrder(null);
      setErr(e.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Orders
          </span>
          <h1 className="text-4xl font-extrabold mt-3">Track My Order</h1>
          <p className="text-gray-700 mt-2">Enter your Order ID to view its items and status.</p>
        </div>

        {/* Search form card (ring + shadow) */}
        <div className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
          <form onSubmit={fetchOrder} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setErr(''); }}
              placeholder="e.g. A1B2C3D4E5"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none transition hover:border-green-600 focus:border-transparent focus:ring-2 focus:ring-green-600"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'View Order'}
            </Button>
          </form>

          {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        </div>

        {/* Order result card (ring + shadow) */}
        {order && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6 md:p-8">
              {/* Summary grid with muted rings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="bg-gray-50 rounded-xl ring-1 ring-inset ring-gray-200 p-4">
                  <div className="text-gray-500">Order ID</div>
                  <div className="mt-1 font-mono font-semibold">{order.orderId}</div>
                </div>
                <div className="bg-gray-50 rounded-xl ring-1 ring-inset ring-gray-200 p-4">
                  <div className="text-gray-500">Status</div>
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-semibold">
                    {order.status}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl ring-1 ring-inset ring-gray-200 p-4">
                  <div className="text-gray-500">Placed</div>
                  <div className="mt-1 font-semibold">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl ring-1 ring-inset ring-gray-200 p-4">
                  <div className="text-gray-500">Total</div>
                  <div className="mt-1 font-semibold">{currency(order.pricing?.total)}</div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5">
                <Button variant="outline" onClick={() => navigate(`/order/${order.orderId}/track`)}>
                  View Timeline
                </Button>
              </div>

              {/* Items with non-cropping thumbnails + light rings */}
              <h3 className="mt-6 font-semibold">Items</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(order.items || []).map((it, idx) => {
                  const src = toImg(it.image);
                  const key = `${it.productId || it.name || 'item'}-${idx}`;
                  return (
                    <div key={key} className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                      {/* Image wrapper */}
                      <div className="w-full h-40 md:h-48 bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center overflow-hidden">
                        {src ? (
                          <img
                            src={src}
                            alt={it.name}
                            className="max-w-full max-h-full object-contain p-2"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-3">
                        <div className="font-semibold line-clamp-2">{it.name}</div>
                        <div className="text-sm text-gray-600 mt-1">Qty: {it.qty}</div>
                        <div className="text-sm text-gray-600">Price: {currency(it.price)}</div>
                        <div className="mt-2 font-semibold">
                          Line total: {currency(Number(it.price) * Number(it.qty))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <Button variant="ghost" onClick={() => setOrder(null)}>Search another order</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}