import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null); 

const STORAGE_KEY = (userId) => `cart:${userId || 'guest'}`;
const getUserFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

export function CartProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromStorage());
  const [items, setItems] = useState([]);
  const currentKeyRef = useRef(STORAGE_KEY(user?.id));

  const loadCart = (uid) => {
    const key = STORAGE_KEY(uid);
    currentKeyRef.current = key;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadCart(user?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(currentKeyRef.current, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const syncAuth = () => {
      const u = getUserFromStorage();

      const GUEST_KEY = STORAGE_KEY(undefined);
      if (u?.id) {
        const userKey = STORAGE_KEY(u.id);
        try {
          const guest = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]') || [];
          const existing = JSON.parse(localStorage.getItem(userKey) || '[]') || [];
          const map = new Map();
          [...existing, ...guest].forEach((it) => {
            const prev = map.get(it.id);
            map.set(it.id, prev ? { ...it, qty: prev.qty + it.qty } : it);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(userKey, JSON.stringify(merged));
          localStorage.removeItem(GUEST_KEY);
        } catch { /* noop */ }
      }

      setUser(u);
      loadCart(u?.id);
    };

    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth:changed', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth:changed', syncAuth);
    };
  }, []);

  // Cart ops
  const addItem = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
  };
  const increaseQty = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
  const decreaseQty = (id) =>
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clearCart = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    const count = items.reduce((acc, p) => acc + p.qty, 0);
    const subtotal = items.reduce((acc, p) => acc + p.price * p.qty, 0);
    return { count, subtotal };
  }, [items]);

  const value = {
    user,
    items,
    addItem,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    count,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}