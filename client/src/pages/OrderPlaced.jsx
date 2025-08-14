// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import OrderTrack from './OrderTrack'; // <-- add this

export default function Orders() {
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const navigate = useNavigate();
  const location = useLocation();

  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);

  const loadOrderById = async (id) => {
    if (!id?.trim()) {
      setErr('Please enter your Order ID.');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API}/orders/${encodeURIComponent(id.trim())}`, { headers });
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

  const fetchOrder = async (e) => {
    e?.preventDefault?.();
    await loadOrderById(orderId);
  };

  // Hydrate when we come back from standalone Track page (optional, safe to keep)
  useEffect(() => {
    const st = location.state;
    if (!st) return;

    const { order: orderFromTrack, orderId: idFromTrack } = st;

    if (orderFromTrack) {
      setOrder(orderFromTrack);
      setOrderId(orderFromTrack.orderId || idFromTrack || '');
    } else if (idFromTrack) {
      setOrderId(idFromTrack);
      loadOrderById(idFromTrack);
    }

    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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

        {/* Search form card */}
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

        {/* Embedded OrderTrack replaces the old result card */}
        {order && (
          <div className="mt-8 max-w-3xl mx-auto">
            <OrderTrack
              orderId={order.orderId}
              initialData={order}
              embedded
            />
          </div>
        )}
      </div>
    </section>
  );
}