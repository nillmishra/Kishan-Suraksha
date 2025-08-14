import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function AddressNew() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login', { replace: true, state: { from: '/address/new' } });
  }, [token, navigate]);

  const [addr, setAddr] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: true,
  });
  const [status, setStatus] = useState('');
  const onChange = (e) => setAddr(a => ({ ...a, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!addr.fullName.trim()) return 'Please enter your full name.';
    if (!/^\d{10}$/.test(addr.phone.trim())) return 'Please enter a valid 10-digit phone number.';
    if (!addr.line1.trim()) return 'Please enter address line 1.';
    if (!addr.city.trim()) return 'Please enter city.';
    if (!addr.state.trim()) return 'Please enter state.';
    if (!/^\d{6}$/.test(addr.pincode.trim())) return 'Please enter a valid 6-digit pincode.';
    return '';
  };

const save = async (e) => {
  e.preventDefault();
  setStatus('');
  const err = validate();
  if (err) { setStatus(err); return; }

  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login', { replace: true, state: { from: '/address/new' } });
    return;
  }

  try {
    const res = await fetch(`${API}/account/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(addr),
    });

    const ct = res.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = typeof payload === 'string' ? payload : payload?.error || `Failed to save address (HTTP ${res.status})`;
      throw new Error(msg);
    }

    navigate('/checkout', { replace: true });
  } catch (e) {
    setStatus(e.message || 'Failed to save address');
  }
};

  return (
    <section className="px-4 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold">Add New Address</h1>
      <form className="mt-6 space-y-4" onSubmit={save}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input name="label" value={addr.label} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="fullName" value={addr.fullName} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input name="phone" value={addr.phone} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input name="line1" value={addr.line1} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address Line 2 (optional)</label>
            <input name="line2" value={addr.line2} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input name="city" value={addr.city} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input name="state" value={addr.state} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input name="pincode" value={addr.pincode} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input name="country" value={addr.country} onChange={onChange}
                   className="mt-1 w-full rounded-md border px-3 py-2 border-gray-300 hover:border-green-600 focus:border-green-700 outline-none" />
          </div>
        </div>
        {status && <p className="text-sm text-red-600">{status}</p>}
        <div className="flex gap-3">
          <Button type="submit">Save Address</Button>
          <Button variant="outline" onClick={() => navigate('/checkout')}>Cancel</Button>
        </div>
      </form>
    </section>
  );
}