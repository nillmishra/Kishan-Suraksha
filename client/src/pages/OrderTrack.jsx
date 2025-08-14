import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toImg } from '../utils/toImg';
import Button from '../components/ui/Button';

// Ensure page can scroll (clears leftovers from modals/third-party overlays)
const unlockScroll = () => {
  try {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open', 'overflow-hidden', 'no-scroll', 'rzp-shown');
    const rp = document.querySelector('.razorpay-container');
    if (rp) rp.remove();
  } catch (e) {
    console.error('Failed to unlock scroll:', e);
  }
};

export default function OrderTrack(props) {
  const { orderId: orderIdParam } = useParams();
  const orderId = props?.orderId || orderIdParam;
  const embedded = !!props?.embedded;
  const initialData = props?.initialData || null;

  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token') || '';
  const [data, setData] = useState(() => initialData);
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Safety: unlock scroll when this page mounts and when it unmounts
  useEffect(() => {
    unlockScroll();
    return () => unlockScroll();
  }, []);

  useEffect(() => {
    let alive = true;
    if (!orderId) {
      setData(null);
      return;
    }

    const load = async () => {
      try {
        setErr('');
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API}/orders/${orderId}`, { headers });
        const payload = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
            return;
          }
          throw new Error(payload?.error || 'Failed to load order');
        }

        if (!alive) return;
        setData(payload.order || null);
      } catch (e) {
        if (alive) setErr(e?.message || 'Failed to load order');
      }
    };

    load();
    return () => { alive = false; };
  }, [API, orderId, token, navigate, location.pathname]);

  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;
  const totalAmount =
    data?.pricing?.total ??
    (data?.items || []).reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
      0
    );

  const Card = (
    <>
      {/* Error */}
      {err && <p className="text-center mt-6 text-sm text-red-600">{err}</p>}

      {/* Loading / Content */}
      {!data && !err ? (
        <p className="mt-10 text-center text-gray-600">Loading tracking info…</p>
      ) : data ? (
        <div className={`${embedded ? 'mt-6' : 'mt-10'} card p-6 md:p-8`}>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="card-muted p-4">
              <div className="text-gray-500">Status</div>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-semibold">
                {data.status}
              </div>
            </div>
            <div className="card-muted p-4">
              <div className="text-gray-500">Placed</div>
              <div className="mt-1 font-semibold">
                {data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}
              </div>
            </div>
            <div className="card-muted p-4">
              <div className="text-gray-500">ETA</div>
              <div className="mt-1 font-semibold">
                {data.eta ? new Date(data.eta).toDateString() : '-'}
              </div>
            </div>
            <div className="card-muted p-4">
              <div className="text-gray-500">Total</div>
              <div className="mt-1 font-semibold">{currency(totalAmount)}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8">
            <h3 className="font-semibold mb-3">Timeline</h3>
            <ul className="space-y-2 text-sm">
              {(data.timeline && data.timeline.length
                ? data.timeline
                : [{ label: 'Order placed', at: data.createdAt }]).map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                  <span className="text-gray-800">{t.label}</span>
                  <span className="text-gray-500">— {t.at ? new Date(t.at).toLocaleString() : ''}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Items */}
          {(data.items || []).length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(data.items || []).map((it, idx) => {
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
                        <div className="text-gray-600">Qty: {it.qty}</div>
                        <div className="text-gray-600">Price: {currency(it.price)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-8 flex gap-3 justify-center">
        <Link to="/products" className="px-6 py-2.5 rounded-full text-green-700 hover:bg-green-50">
          Continue Shopping
        </Link>
      </div>
    </>
  );

  if (embedded) {
    return <div>{Card}</div>;
  }

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Orders
          </span>
          <h1 className="text-4xl font-extrabold mt-3">Track Order</h1>
          <p className="text-gray-700 mt-2">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        </div>

        {Card}
      </div>
    </section>
  );
}