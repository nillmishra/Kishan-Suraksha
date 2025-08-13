import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';

export default function ProductsPage() {
  const API = import.meta.env.VITE_API_URL || '';
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // UI state
  const [category, setCategory] = useState('All');
  const [sortKey, setSortKey] = useState('featured'); // featured | newest | price_asc | price_desc | rating

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
        setRemoteProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (alive) setErr(e?.message || 'Failed to load products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [API]);

  // Normalize
  const products = useMemo(() => {
    const normalize = (p) => ({
      id: p.id ?? p._id,
      name: p.name,
      price: Number(p.price || 0),
      rating: Number(p.rating ?? 0),
      image: p.image ?? p.imageUrl ?? '',
      category: p.category || 'General',
      stock: Number(p.stock ?? 0),
      isActive: p.isActive !== false,
      createdAt: p.createdAt ? new Date(p.createdAt) : null,
    });
    return (remoteProducts || []).map(normalize);
  }, [remoteProducts]);

  // Build categories list with counts
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const cat = p.category || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([label, count]) => ({ label, count }));
    arr.sort((a, b) => a.label.localeCompare(b.label));
    return [{ label: 'All', count: products.length }, ...arr];
  }, [products]);

  // Filter + sort
  const filtered = useMemo(() => {
    const arr = category === 'All'
      ? products
      : products.filter((p) => (p.category || 'General') === category);

    const sorted = [...arr];
    switch (sortKey) {
      case 'newest':
        sorted.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // featured: keep API order
        break;
    }
    return sorted;
  }, [products, category, sortKey]);

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Shop
          </span>
          <h1 className="text-4xl font-extrabold mt-3">All Products</h1>
          <p className="text-gray-700 mt-2">Browse our catalog and filter by category.</p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4">
          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setCategory(c.label)}
                className={`px-3 py-1.5 rounded-full text-sm border transition whitespace-nowrap
                  ${category === c.label
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-green-600'
                  }`}
                title={`${c.label} (${c.count})`}
              >
                {c.label} <span className={`ml-1 ${category === c.label ? 'text-white/90' : 'text-gray-500'}`}>({c.count})</span>
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''}
              {category !== 'All' ? <> in <span className="font-semibold">{category}</span></> : null}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Sort by</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1 hover:border-green-600 focus:border-green-700 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {err && <p className="text-red-600 text-center mt-4">{err}</p>}

        {/* Grid */}
        <div className="mt-8">
          {loading && !products.length ? (
            // Skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border border-green-100 bg-white rounded-2xl p-3 shadow">
                  <div className="w-full h-48 md:h-56 bg-gray-100 animate-pulse rounded-xl" />
                  <div className="mt-3 h-4 bg-gray-100 animate-pulse rounded" />
                  <div className="mt-2 h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                  <div className="mt-3 h-8 bg-gray-100 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center bg-white border rounded-2xl p-8">
              <p className="text-gray-700">No products found for this category.</p>
              <Button className="mt-4" onClick={() => setCategory('All')}>
                Clear filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  rating={p.rating}
                  image={p.image}
                  stock={p.stock}
                  gateAdd={false}
                />
              ))}
            </div>
          )}
        </div>

        {loading && products.length > 0 && (
          <p className="text-center text-gray-500 mt-6">Loading…</p>
        )}
      </div>
    </section>
  );
}