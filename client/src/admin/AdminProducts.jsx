import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import { toImg } from '../utils/toImg';

export default function AdminProducts() {
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const token = localStorage.getItem('token');
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    name: '', price: '', rating: '', imageUrl: '', description: '', category: '', stock: '',
  });
  const [imageFile, setImageFile] = useState(null);

  // Edit modal state
  const [edit, setEdit] = useState(null); // product object when editing
  const [editFile, setEditFile] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setList(data.products || []);
      else setStatus(data?.error || 'Failed to load products');
    } catch (e) { setStatus(e.message); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const uploadImageFile = async (file) => {
    if (!file) return '';
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API}/admin/products/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Image upload failed');
    return data.imageUrl; // e.g., /uploads/products/xxx.jpg
  };

  const create = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      let imageUrl = (form.imageUrl || '').trim();
      if (!imageUrl && imageFile) {
        imageUrl = await uploadImageFile(imageFile);
      }
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        rating: Number(form.rating || 0),
        imageUrl,
        description: form.description.trim(),
        category: form.category.trim() || 'General',
        stock: Number(form.stock || 0),
      };
      const res = await fetch(`${API}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Create failed');
      setForm({ name: '', price: '', rating: '', imageUrl: '', description: '', category: '', stock: '' });
      setImageFile(null);
      await load();
    } catch (e) { setStatus(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Delete product?')) return;
    const res = await fetch(`${API}/admin/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || 'Delete failed'); return; }
    load();
  };

  // Edit handlers
  const openEdit = (p) => {
    setEdit({
      _id: p._id,
      name: p.name || '',
      price: String(p.price ?? ''),
      rating: String(p.rating ?? ''),
      imageUrl: p.imageUrl || '',
      description: p.description || '',
      category: p.category || 'General',
      stock: String(p.stock ?? ''),
      isActive: !!p.isActive,
    });
    setEditFile(null);
    setEditStatus('');
  };

  const onEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEdit((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!edit?._id) return;
    setEditStatus('');
    setSaving(true);
    try {
      let imageUrl = (edit.imageUrl || '').trim();
      if (editFile) {
        imageUrl = await uploadImageFile(editFile);
      }
      const payload = {
        name: String(edit.name || '').trim(),
        price: Number(edit.price || 0),
        rating: Number(edit.rating || 0),
        imageUrl,
        description: String(edit.description || '').trim(),
        category: String(edit.category || 'General').trim(),
        stock: Number(edit.stock || 0),
        isActive: !!edit.isActive,
      };
      const res = await fetch(`${API}/admin/products/${edit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      setEdit(null);
      setEditFile(null);
      await load();
    } catch (e2) {
      setEditStatus(e2.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
          Admin
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-2">Products</h1>
      </div>

      {/* Create form card */}
      <form onSubmit={create} className="bg-white p-6 rounded-2xl shadow border grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="border rounded px-3 py-2" required />
        <input name="price" value={form.price} onChange={onChange} placeholder="Price" type="number" className="border rounded px-3 py-2" required />
        <input name="rating" value={form.rating} onChange={onChange} placeholder="Rating (0-5)" type="number" className="border rounded px-3 py-2" />
        <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="Image URL (or upload)" className="border rounded px-3 py-2" />
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="border rounded px-3 py-2" />
        <input name="category" value={form.category} onChange={onChange} placeholder="Category" className="border rounded px-3 py-2" />
        <input name="stock" value={form.stock} onChange={onChange} placeholder="Stock" type="number" className="border rounded px-3 py-2" />
        <textarea name="description" value={form.description} onChange={onChange} placeholder="Description" className="border rounded px-3 py-2 sm:col-span-2" />
        <div className="sm:col-span-2">
          <Button type="submit">Add Product</Button>
        </div>
      </form>
      {status && <p className="text-sm text-red-600">{status}</p>}

      {/* List card */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Active</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Image</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">₹{p.price}</td>
                <td className="p-2">{p.isActive ? 'Yes' : 'No'}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">
                  {p.imageUrl ? (
                    <img
                      src={toImg(p.imageUrl)}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : '-'}
                </td>
                <td className="p-2 space-x-2">
                  <Button variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  <Button variant="outline" onClick={() => remove(p._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-3 text-gray-600" colSpan={6}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => { setEdit(null); setEditFile(null); setEditStatus(''); }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveEdit} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="name" value={edit.name} onChange={onEditChange} placeholder="Name" className="border rounded px-3 py-2" required />
              <input name="price" value={edit.price} onChange={onEditChange} placeholder="Price" type="number" className="border rounded px-3 py-2" required />
              <input name="rating" value={edit.rating} onChange={onEditChange} placeholder="Rating (0-5)" type="number" className="border rounded px-3 py-2" />
              <input name="category" value={edit.category} onChange={onEditChange} placeholder="Category" className="border rounded px-3 py-2" />
              <input name="stock" value={edit.stock} onChange={onEditChange} placeholder="Stock" type="number" className="border rounded px-3 py-2" />
              <label className="flex items-center gap-2 text-sm mt-1">
                <input type="checkbox" name="isActive" checked={!!edit.isActive} onChange={onEditChange} />
                Active
              </label>
              <textarea name="description" value={edit.description} onChange={onEditChange} placeholder="Description" className="border rounded px-3 py-2 sm:col-span-2" />

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    name="imageUrl"
                    value={edit.imageUrl}
                    onChange={onEditChange}
                    placeholder="Image URL"
                    className="mt-1 border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload New Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                    className="mt-1 border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="sm:col-span-2">
                <div className="text-sm text-gray-700 mb-1">Preview</div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                    {editFile ? (
                      <img src={URL.createObjectURL(editFile)} alt="New" className="w-full h-full object-cover" />
                    ) : edit.imageUrl ? (
                      <img src={toImg(edit.imageUrl)} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    If you choose a file, it will replace the current image after Save.
                  </div>
                </div>
              </div>

              {editStatus && <p className="sm:col-span-2 text-sm text-red-600">{editStatus}</p>}

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setEdit(null); setEditFile(null); setEditStatus(''); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}