export function toImg(url) {
  const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (!url) return '';
  if (typeof url !== 'string') return url;
  if (/^https?:\/\//i.test(url)) return url;
  // Only prefix server upload paths
  if (url.startsWith('/uploads/')) {
    return API ? `${API}${url}` : url;
  }
  // Leave Vite/public assets (/assets/...) or other relative paths as-is
  return url;
}