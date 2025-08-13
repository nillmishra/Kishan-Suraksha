import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import logo from '../assets/newlogo.png';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'CropGuard AI', to: '/upload' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Per-tab auth sync only (no cross-tab storage listener)
  useEffect(() => {
    const sync = () => {
      try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); } catch { setUser(null); }
    };
    sync();
    window.addEventListener('auth:changed', sync);
    return () => window.removeEventListener('auth:changed', sync);
  }, []);

  // Hide Navbar on admin, login, and signup pages
  const pathname = location.pathname;
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:changed'));
    setUser(null);
    setOpen(false);
    navigate('/', { replace: true });
  };

  const firstName = user?.name?.split?.(' ')?.[0] || user?.name || '';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow">
      <div className="w-full px-4">
        <div className="h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Kishan Suraksha Logo" className="w-44 pt-3" />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative font-medium transition-colors ${isActive ? 'text-green-700' : 'text-gray-900 hover:text-green-700'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="relative inline-flex items-center text-gray-900 hover:text-green-700">
              <FaShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs bg-green-600 text-white">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <span className="font-medium text-gray-900">Hi, {firstName}</span>
                <Button onClick={handleLogout} size="sm" variant="outline">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-900 font-medium hover:text-green-700 transition">Log In</Link>
                <Button to="/signup" size="sm">Sign Up</Button>
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block py-1 font-medium ${isActive ? 'text-green-700' : 'text-gray-900 hover:text-green-700'}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="pt-2 flex items-center gap-3">
              <Link to="/cart" onClick={() => setOpen(false)} className="font-medium text-gray-900 hover:text-green-700">
                Cart {count > 0 ? `(${count})` : ''}
              </Link>

              {user ? (
                <>
                  <span className="font-medium text-gray-900">Hi, {firstName}</span>
                  <Button onClick={handleLogout} size="sm" variant="outline">Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="font-medium text-gray-900 hover:text-green-700">Log In</Link>
                  <Button to="/signup" size="sm">Sign Up</Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}