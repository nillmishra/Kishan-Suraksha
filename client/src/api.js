// client/src/api.js
const API = import.meta.env.VITE_API_URL; // e.g., https://ks-server-9ke7.onrender.com

export async function predict(file) {
  const form = new FormData();
  form.append('file', file); // IMPORTANT: field name must be 'file'
  const res = await fetch(`${API}/api/ml/predict`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Prediction failed');
  return res.json();
}