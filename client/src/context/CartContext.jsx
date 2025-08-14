// client/src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null); // not exported

const STORAGE_KEY = (userId) => `cart:${userId || 'guest'}`;
const getUserFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

export function CartProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromStorage());
  const [items, setItems] = useState([]);
  const currentKeyRef = useRef(STORAGE_KEY(user?.id));

  // NEW: clamp items to stock, drop non-positive qty
  const sanitizeItems = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((it) => {
        const s = Number(it.stock);
        const hasStock = Number.isFinite(s);
        let qty = Number(it.qty || 0);
        if (hasStock) qty = Math.min(qty, Math.max(0, s));
        return { ...it, qty };
      })
      .filter((it) => it.qty > 0);
  };

  const loadCart = (uid) => {
    const key = STORAGE_KEY(uid);
    currentKeyRef.current = key;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      setItems(sanitizeItems(data)); // UPDATED: sanitize
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

      // Merge guest cart into user's cart on login
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

          // UPDATED: clamp merged quantities to stock if known
          const merged = Array.from(map.values())
            .map((it) => {
              const s = Number(it.stock);
              if (Number.isFinite(s)) return { ...it, qty: Math.min(it.qty, Math.max(0, s)) };
              return it;
            })
            .filter((it) => it.qty > 0);

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

  // UPDATED: stock-aware ops
  const addItem = (item, qty = 1) => {
    const inc = Number(qty || 1);
    const incomingStock = Number(item?.stock);
    const hasStock = Number.isFinite(incomingStock) && incomingStock >= 0;

    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);

      if (idx >= 0) {
        const cur = prev[idx];
        const curStock = Number(cur?.stock);
        const knownStock = Number.isFinite(incomingStock)
          ? incomingStock
          : (Number.isFinite(curStock) ? curStock : undefined);

        if (Number.isFinite(knownStock) && knownStock <= 0) {
          return prev; // can't add if 0 known stock
        }

        let nextQty = cur.qty + inc;
        if (Number.isFinite(knownStock)) nextQty = Math.min(nextQty, knownStock);

        if (nextQty === cur.qty) {
          // keep stock info if we learned it now
          if (Number.isFinite(incomingStock) && cur.stock !== incomingStock) {
            const next = [...prev];
            next[idx] = { ...cur, stock: incomingStock };
            return next;
          }
          return prev;
        }

        const next = [...prev];
        next[idx] = {
          ...cur,
          qty: nextQty,
          ...(Number.isFinite(incomingStock) ? { stock: incomingStock } : {}),
        };
        return next;
      }

      // Not in cart
      if (hasStock && incomingStock <= 0) return prev;
      const startQty = hasStock ? Math.min(inc, incomingStock) : inc;

      return [
        ...prev,
        {
          ...item,
          qty: Math.max(1, startQty),
          ...(hasStock ? { stock: incomingStock } : {}),
        },
      ];
    });
  };

  const increaseQty = (id) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const s = Number(p.stock);
        const hasStock = Number.isFinite(s);
        const nextQty = hasStock ? Math.min(p.qty + 1, s) : p.qty + 1;
        return nextQty === p.qty ? p : { ...p, qty: nextQty };
      })
    );

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