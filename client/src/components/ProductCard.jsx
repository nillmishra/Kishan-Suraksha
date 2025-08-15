import { FaCartPlus } from 'react-icons/fa';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toImg } from '../utils/toImg';

export default function ProductCard({
  id,
  name,
  price,
  image,
  rating = 0,
  stock,
  gateAdd = false,
}) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const inStock = stock === undefined ? true : Number(stock) > 0;

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    const token = localStorage.getItem('token');
    if (gateAdd && !token) {
      navigate('/login', { replace: true, state: { from: '/upload' } });
      return;
    }
    // Pass stock so the cart clamps quantity correctly
    addItem({ id, name, price, image, stock }, 1);
  };

  const onOpen = () => navigate(`/product/${id}`);
  const src = toImg(image);
  const displayPrice = `₹${Number(price || 0).toFixed(2)}`;

  return (
    <div
      className="relative w-full p-3 card cursor-pointer hover:shadow-lg transition"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      {!inStock && (
        <span className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 border border-red-200">
          Out of Stock
        </span>
      )}

      <div className={`img-wrap w-full h-48 md:h-56 ${!inStock ? 'opacity-70' : ''}`}>
        {src ? (
          <img
            src={src}
            alt={name}
            className="max-h-full max-w-full object-contain p-2"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>

      <div className="mt-3 text-left">
        <h5 className="text-base font-semibold text-green-700 line-clamp-2">{name}</h5>
        <StarRating rating={Number(rating || 0)} className="mt-1 gap-1" />
        <p className="mt-2 text-lg font-bold text-green-700">{displayPrice}</p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add to cart"
        aria-disabled={!inStock}
        disabled={!inStock}
        className={`absolute bottom-3 right-3 w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center transition
          ${inStock
            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
          }`}
      >
        <FaCartPlus />
      </button>
    </div>
  );
}