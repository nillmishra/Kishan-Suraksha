import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function Products({ gateAdd = false, limit = 4 }) {
  const API = import.meta.env.VITE_API_URL || '';
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr('');
        setLoading(true);
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load products');

        if (!alive) return;
        const normalized = (Array.isArray(data.products) ? data.products : []).map((p) => ({
          id: p.id ?? p._id,
          name: p.name,
          price: Number(p.price || 0),
          rating: Number(p.rating ?? 0),
          image: p.image ?? p.imageUrl ?? '',
          stock: Number(p.stock ?? 0),
        }));
        setItems(normalized);
      } catch (e) {
        if (alive) setErr(e.message || 'Failed to load products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [API]);

  const displayed = useMemo(() => items.slice(0, limit), [items, limit]);

  return (
    <section className="relative py-12 md:py-16" id="products">
      <div className="text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
          Popular
        </span>
        <h2 className="text-4xl font-extrabold mt-3">Products</h2>
        <div className="h-1 w-20 bg-green-600 rounded mx-auto mt-3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {err && <p className="text-red-600 text-center mb-4">{err}</p>}

        {loading && !items.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="card p-3">
                <div className="img-wrap w-full h-48 md:h-56">
                  <div className="w-full h-full bg-gray-100 animate-pulse" />
                </div>
                <div className="mt-3 h-4 bg-gray-100 animate-pulse rounded" />
                <div className="mt-2 h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                <div className="mt-3 h-8 bg-gray-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-600">No products found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayed.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  rating={p.rating}
                  image={p.image}
                  stock={p.stock}
                  gateAdd={gateAdd}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/products"
                className="inline-flex items-center text-green-700 font-semibold hover:text-green-800 hover:underline"
              >
                Show more →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}