import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating = 0, className = '' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: full }).map((_, i) => <FaStar key={`f-${i}`} className="text-yellow-400" />)}
      {half && <FaStarHalfAlt className="text-yellow-400" />}
      {Array.from({ length: empty }).map((_, i) => <FaRegStar key={`e-${i}`} className="text-yellow-400" />)}
    </div>
  );
}