import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Login | KisanSuraksha';
    return () => { document.title = prev; };
  }, []);

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: '' }));
    setStatus('');
  };

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Please enter a valid email.';
    if (!values.password || values.password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validate()) return;

    const API = import.meta.env.VITE_API_URL || '';
    try {
      setSubmitting(true);
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : await res.text();

      if (!res.ok) {
        const msg = typeof payload === 'string' ? payload : payload?.error || 'Login failed';
        throw new Error(msg);
      }

      const data = payload;
      const rawUser = data.user || {};
      const normalizedUser = {
        ...rawUser,
        isAdmin: rawUser?.isAdmin === true || rawUser?.role?.toLowerCase?.() === 'admin',
      };

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      window.dispatchEvent(new Event('auth:changed'));

      const from = location.state?.from;
      let to = '/';
      if (from) {
        to = from.startsWith('/admin')
          ? (normalizedUser.isAdmin ? '/admin' : '/')
          : from;
      } else {
        to = normalizedUser.isAdmin ? '/admin' : '/';
      }

      navigate(to, { replace: true });
    } catch (err) {
      setStatus(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-dvh grid place-items-center bg-gradient-to-b from-green-50 via-white to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Welcome back
          </span>
        </div>

        <div className="mt-4 card p-8">
          <h1 className="text-3xl font-extrabold text-center">Log in to KisanSuraksha</h1>
          <p className="text-gray-700 mt-1 text-center">Access CropGuard AI and your orders.</p>

          <form onSubmit={onSubmit} className="mt-6" noValidate>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email" name="email" type="email" value={values.email} onChange={onChange}
              className={`mt-1 w-full input-outline ${errors.email ? 'border-red-500 focus:ring-red-600' : ''}`}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}

            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mt-4">Password</label>
            <input
              id="password" name="password" type="password" value={values.password} onChange={onChange}
              className={`mt-1 w-full input-outline ${errors.password ? 'border-red-500 focus:ring-red-600' : ''}`}
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

            {status && <div className="mt-4 text-sm text-red-600">{status}</div>}

            <Button type="submit" className="mt-6 w-full" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log In'}
            </Button>

            <p className="text-center mt-4 text-sm text-gray-700">
              Don’t have an account? <Link to="/signup" className="text-green-700 hover:underline">Sign up here</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}