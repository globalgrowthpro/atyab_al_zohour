import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartLine = { slug: string; qty: number };
type Ctx = {
  lines: CartLine[];
  count: number;
  add: (slug: string, qty: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "atyab-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines]);

  const add = (slug: string, qty: number) =>
    setLines((ls) => {
      const f = ls.find((l) => l.slug === slug);
      return f ? ls.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l)) : [...ls, { slug, qty }];
    });
  const setQty = (slug: string, qty: number) =>
    setLines((ls) => ls.map((l) => (l.slug === slug ? { ...l, qty: Math.max(1, qty) } : l)));
  const remove = (slug: string) => setLines((ls) => ls.filter((l) => l.slug !== slug));

  return (
    <CartContext.Provider
      value={{ lines, count: lines.reduce((s, l) => s + l.qty, 0), add, setQty, remove, clear: () => setLines([]) }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
