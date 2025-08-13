import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/', { replace: true });
  };

  return (
    // Keep -mt-24 to cancel the public pt-24 when Navbar is hidden
    <div className="min-h-screen flex -mt-24 bg-gradient-to-b from-green-50 via-white to-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur border-r p-4">
        <h2 className="text-xl font-extrabold text-gray-900">Admin Panel</h2>
        <nav className="mt-4 flex flex-col gap-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg font-medium transition ${
                isActive ? 'bg-green-100 text-green-700' : 'text-gray-800 hover:bg-gray-50'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg font-medium transition ${
                isActive ? 'bg-green-100 text-green-700' : 'text-gray-800 hover:bg-gray-50'
              }`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg font-medium transition ${
                isActive ? 'bg-green-100 text-green-700' : 'text-gray-800 hover:bg-gray-50'
              }`
            }
          >
            Orders
          </NavLink>
        </nav>
        <button
          className="mt-6 text-sm text-red-600 hover:underline"
          onClick={logout}
        >
          Log out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}