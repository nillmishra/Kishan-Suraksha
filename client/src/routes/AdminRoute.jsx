import { Navigate, useLocation } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}

  const location = useLocation();
  const isAdmin = user?.isAdmin === true || user?.role?.toLowerCase?.() === 'admin';

  if (!token || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}