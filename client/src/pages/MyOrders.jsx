import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { toImg } from '../utils/toImg';

const STATUS_STYLE = {
  PLACED: 'bg-gray-100 text-gray-700 border-gray-300',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-700 border-purple-300',
  OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-700 border-amber-300',
  DELIVERED: 'bg-green-100 text-green-700 border-green-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-300',
};

export default function MyOrders() {
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setErr('');
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API}/orders`, { headers });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
            return;
          }
          throw new Error(data?.error || 'Failed to load orders');
        }

        if (!alive) return;
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (e) {
        if (alive) setErr(e?.message || 'Failed to load orders');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [API, navigate, location.pathname]);

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Orders
          </span>
          <h1 className="text-4xl font-extrabold mt-3">My Orders</h1>
          <p className="text-gray-700 mt-2">All your orders in one place.</p>
        </div>

        {/* States */}
        {loading && <p className="mt-8 text-center text-gray-600">Loading your orders…</p>}
        {err && <p className="mt-6 text-center text-sm text-red-600">{err}</p>}

        {!loading && !err && orders.length === 0 && (
          <div className="mt-10 card p-6 md:p-8 text-center">
            <p className="text-gray-700">You have no orders yet.</p>
            <div className="mt-3">
              <Link to="/products" className="text-green-700 hover:underline">Start shopping</Link>
            </div>
          </div>
        )}

        {/* Orders list */}
        <div className="mt-8 space-y-6">
          {orders.map((o) => {
            const statusClass = STATUS_STYLE[o.status] || 'bg-gray-100 text-gray-700 border-gray-300';
            return (
              <div key={o._id || o.orderId} className="card p-6 md:p-8">
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-semibold">Order ID:</span>{' '}
                      <span className="font-mono">{o.orderId}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-xs align-middle ${statusClass}`}>
                        {o.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Placed:</span>{' '}
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}
                    </div>
                    <div>
                      <span className="font-semibold">Total:</span>{' '}
                      {currency(o.pricing?.total)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(`/order/${o.orderId}/track`)}>
                      Track Order
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(o.items || []).map((it, idx) => {
                      const src = toImg(it.image);
                      const key = `${it.productId || it.name || 'item'}-${idx}`;
                      return (
                        <div key={key} className="flex items-center gap-3 card-muted p-2">
                          <div className="img-wrap w-16 h-16 md:w-20 md:h-20">
                            {src ? (
                              <img
                                src={src}
                                alt={it.name}
                                className="max-w-full max-h-full object-contain p-1"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                          <div className="text-sm">
                            <div className="font-semibold line-clamp-2">{it.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}