import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import StarRating from "../components/StarRating";
import { toImg } from "../utils/toImg";

export default function ProductDetails() {
  const { id } = useParams(); // product id (_id)
  const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  // Reviews are client-side (localStorage) to avoid backend changes
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const reviewsKey = `reviews:${id}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(reviewsKey) || "[]");
      if (Array.isArray(saved)) setReviews(saved);
    } catch (e) {
      console.warn("Failed to load reviews from localStorage:", e);
    }
  }, [reviewsKey]);

  useEffect(() => {
    let alive = true;

    const normalize = (p) => ({
      id: p._id || p.id,
      name: p.name,
      price: Number(p.price || 0),
      rating: Number(p.rating || 0),
      image: p.imageUrl || p.image || "",
      description: p.description || "",
      category: p.category || "General",
      stock: Number(p.stock || 0),
      isActive: p.isActive !== false,
      createdAt: p.createdAt,
    });

    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        // Try direct endpoint first (if your server adds it later)
        const tryDirect = await fetch(`${API}/products/${id}`);
        if (tryDirect.ok) {
          const data = await tryDirect.json();
          const item = data?.product || data;
          if (alive && item) setProduct(normalize(item));
          setLoading(false);
          return;
        }

        // Fallback: fetch list and find by id
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load products");
        const found = (data.products || []).find(
          (p) => String(p._id || p.id) === String(id)
        );
        if (!found) throw new Error("Product not found");
        if (alive) setProduct(normalize(found));
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load product");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [API, id]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return product?.rating || 0;
    const s = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return +(s / reviews.length).toFixed(1);
  }, [reviews, product?.rating]);

  const addToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      alert("Out of stock");
      return;
    }
    const safeQty = Math.max(1, Math.min(qty, product.stock));
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      safeQty
    );
  };

  const submitReview = (e) => {
    e.preventDefault();
    const r = {
      rating: Math.max(1, Math.min(5, Number(reviewInput.rating || 5))),
      title: String(reviewInput.title || "").trim(),
      comment: String(reviewInput.comment || "").trim(),
      by: user?.name || "Guest",
      at: new Date().toISOString(),
    };
    if (!r.title || !r.comment) {
      alert("Please enter a title and comment");
      return;
    }
    const next = [r, ...reviews].slice(0, 50);
    setReviews(next);
    try {
      localStorage.setItem(reviewsKey, JSON.stringify(next));
    } catch (e2) {
      console.warn("Failed to save reviews:", e2);
    }
    setReviewInput({ rating: 5, title: "", comment: "" });
  };

  const img = toImg(product?.image);
  const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;

  if (loading) {
    return (
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <p className="text-gray-600">Loading product…</p>
      </section>
    );
  }

  if (err || !product) {
    return (
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <p className="text-red-600">{err || "Product not found"}</p>
        <div className="mt-4">
          <Link to="/products" className="text-green-700 hover:underline">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="px-4 py-16 max-w-7xl mx-auto ">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-600">
          <Link to="/" className="hover:text-green-700">
            Home
          </Link>{" "}
          <span>/</span>{" "}
          <Link to="/products" className="hover:text-green-700">
            Products
          </Link>{" "}
          <span>/</span> <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="card p-4">
            <div className="img-wrap w-full h-80 md:h-[28rem]">
              {img ? (
                <img
                  src={img}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-3"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-xl" />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={avgRating} />
              <span className="text-sm text-gray-600">{avgRating} / 5</span>
              {product.category && (
                <span className="text-sm text-gray-500">
                  • {product.category}
                </span>
              )}
            </div>

            <div className="mt-3 text-2xl font-bold text-green-700">
              {currency(product.price)}
            </div>

            <div className="mt-3">
              {product.stock > 0 ? (
                <span className="inline-block text-sm px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                  In stock — {product.stock} available
                </span>
              ) : (
                <span className="inline-block text-sm px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                  Out of stock
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-800 whitespace-pre-wrap">
              {product.description || "No description provided."}
            </p>

            {/* Quantity + Add to cart */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-xl ring-1 ring-gray-200 overflow-hidden bg-white">
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, product.stock)}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.max(
                        1,
                        Math.min(
                          Number(e.target.value || 1),
                          product.stock || 1
                        )
                      )
                    )
                  }
                  className="w-14 text-center outline-none"
                />
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  onClick={() =>
                    setQty((q) => Math.min(product.stock || 1, q + 1))
                  }
                >
                  +
                </button>
              </div>
              <Button onClick={addToCart} disabled={product.stock <= 0}>
                Add to Cart
              </Button>
            </div>

            {/* Highlights */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="card-muted p-3">
                <div className="font-semibold">Delivery</div>
                <div className="text-gray-600">
                  Standard 2-5 days. Express available.
                </div>
              </div>
              <div className="card-muted p-3">
                <div className="font-semibold">Returns</div>
                <div className="text-gray-600">
                  7-day replacement on damaged items.
                </div>
              </div>
              <div className="card-muted p-3">
                <div className="font-semibold">Payment</div>
                <div className="text-gray-600">COD or Online (Razorpay).</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-gray-600">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <ul className="mt-4 divide-y">
                {reviews.map((r, idx) => (
                  <li key={idx} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">
                        {r.title}
                      </div>
                      <StarRating rating={Number(r.rating || 0)} />
                    </div>
                    <div className="text-gray-700 mt-1">{r.comment}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      by {r.by} on {new Date(r.at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">Write a Review</h2>
            <form className="mt-4 space-y-3" onSubmit={submitReview}>
              <div>
                <label className="block text-sm text-gray-700">Rating</label>
                <select
                  value={reviewInput.rating}
                  onChange={(e) =>
                    setReviewInput((v) => ({
                      ...v,
                      rating: Number(e.target.value),
                    }))
                  }
                  className="mt-1 input-outline w-full"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Title</label>
                <input
                  value={reviewInput.title}
                  onChange={(e) =>
                    setReviewInput((v) => ({ ...v, title: e.target.value }))
                  }
                  className="mt-1 input-outline w-full"
                  placeholder="Great product!"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Comment</label>
                <textarea
                  rows="4"
                  value={reviewInput.comment}
                  onChange={(e) =>
                    setReviewInput((v) => ({ ...v, comment: e.target.value }))
                  }
                  className="mt-1 input-outline w-full"
                  placeholder="Share your experience…"
                />
              </div>
              <Button type="submit">Submit Review</Button>
            </form>
          </div>
        </div>

        <div className="mt-10">
          <Link to="/products" className="text-green-700 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    </section>
  );
}
