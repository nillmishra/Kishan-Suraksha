import { useEffect, useState } from 'react';

const STATUSES = ['PLACED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

export default function AdminOrders() {
  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  const load = async () => {
    try {
      const res = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
      else setStatus(data?.error || 'Failed to load orders');
    } catch (e) {
      setStatus(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, next) => {
    try {
      const res = await fetch(`${API}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next, note: `Status changed to ${next}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;
  const placedAt = (d) => (d ? new Date(d).toLocaleString() : '-');

  const customerLabel = (o) => {
    if (o?.user && typeof o.user === 'object') {
      return o.user.name || o.address?.fullName || o.user.email || o.user._id || '-';
    }
    return o.address?.fullName || o?.user || '-';
  };

  const customerTitle = (o) => {
    if (o?.user && typeof o.user === 'object') {
      return o.user.email || o.user._id || '';
    }
    return '';
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
          Admin
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-2">Orders</h1>
        {status && <p className="mt-3 text-sm text-red-600">{status}</p>}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl p-4 md:p-6 shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Order ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Placed</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id || o.orderId} className="border-b">
                <td className="p-2 font-mono">{o.orderId}</td>
                <td className="p-2">
                  <span title={customerTitle(o)}>{customerLabel(o)}</span>
                </td>
                <td className="p-2">{currency(o.pricing?.total)}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">{placedAt(o.createdAt)}</td>
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={o.status}
                    onChange={(e) => updateStatus(o.orderId, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && !status && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}