import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const STATUSES = ['PLACED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

export default function AdminDashboard() {
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const token = localStorage.getItem('token');

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const load = async () => {
    try {
      setStatus('');
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [ordRes, prodRes] = await Promise.all([
        fetch(`${API}/admin/orders`, { headers }),
        fetch(`${API}/admin/products`, { headers }),
      ]);

      const [ordData, prodData] = await Promise.all([ordRes.json(), prodRes.json()]);

      if (!ordRes.ok) throw new Error(ordData?.error || 'Failed to load orders');
      if (!prodRes.ok) throw new Error(prodData?.error || 'Failed to load products');

      setOrders(Array.isArray(ordData.orders) ? ordData.orders : []);
      setProducts(Array.isArray(prodData.products) ? prodData.products : []);
    } catch (e) {
      setStatus(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatMoney = (n) => `₹${Number(n || 0).toFixed(2)}`;
  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-');

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.pricing?.total || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter((o) => (o.createdAt ? new Date(o.createdAt).toDateString() === todayStr : false)).length;

    const inProgress = orders.filter((o) => !['DELIVERED','CANCELLED'].includes(o.status)).length;

    const lowStockList = products
      .filter((p) => Number(p.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 5);
    const lowStockCount = products.filter((p) => Number(p.stock || 0) <= 5).length;

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Top products by quantity sold
    const tally = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = String(it.productId || it.name || '');
        if (!key) return;
        if (!tally.has(key)) tally.set(key, { name: it.name, qty: 0, revenue: 0 });
        const entry = tally.get(key);
        entry.qty += Number(it.qty || 0);
        entry.revenue += Number(it.qty || 0) * Number(it.price || 0);
      });
    });
    const topProducts = Array.from(tally.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      todayOrders,
      inProgress,
      lowStockList,
      lowStockCount,
      statusCounts,
      topProducts,
      recentOrders,
    };
  }, [orders, products]);

  const customerLabel = (o) => {
    if (o?.user && typeof o.user === 'object') {
      return o.user.name || o.address?.fullName || o.user.email || o.user._id || '-';
    }
    return o.address?.fullName || o?.user || '-';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
          Admin
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-2">Dashboard</h1>
        <p className="mt-1 text-gray-700">Overview of your store activity.</p>
        {status && <p className="mt-3 text-sm text-red-600">{status}</p>}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/admin/products')}>Add Product</Button>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>Manage Orders</Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Today’s Orders" value={stats.todayOrders} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Revenue" value={formatMoney(stats.totalRevenue)} />
        <StatCard label="Avg Order Value" value={formatMoney(stats.avgOrderValue)} />
        <StatCard label="Low Stock" value={stats.lowStockCount} />
      </div>

      {/* Status breakdown + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow">
          <h3 className="font-semibold mb-3">Orders by Status</h3>
          <ul className="space-y-2 text-sm">
            {STATUSES.map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span className="text-gray-700">{s.replaceAll('_',' ')}</span>
                <span className="font-semibold">{stats.statusCounts[s] || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow">
          <h3 className="font-semibold mb-3">Low Stock (≤ 5)</h3>
          {stats.lowStockList.length === 0 ? (
            <p className="text-sm text-gray-600">No low stock items.</p>
          ) : (
            <ul className="divide-y">
              {stats.lowStockList.map((p) => (
                <li key={p._id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-800">{p.name}</span>
                  <span className="text-gray-600">Stock: <span className="font-semibold">{p.stock}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top products + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow">
          <h3 className="font-semibold mb-3">Top Products (by qty)</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-600">Not enough data yet.</p>
          ) : (
            <ul className="divide-y">
              {stats.topProducts.map((t, i) => (
                <li key={i} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-800">{t.name}</span>
                  <span className="text-gray-600">Qty: <span className="font-semibold">{t.qty}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow overflow-x-auto">
          <h3 className="font-semibold mb-3">Recent Orders</h3>
          {loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-600">No orders yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Placed</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id || o.orderId} className="border-b">
                    <td className="p-2 font-mono">{o.orderId}</td>
                    <td className="p-2">{customerLabel(o)}</td>
                    <td className="p-2">{formatMoney(o.pricing?.total)}</td>
                    <td className="p-2">{o.status}</td>
                    <td className="p-2">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}