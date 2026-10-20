import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products } from "./catalog";

export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const result = new Map<string, number>();
  for (const line of value) {
    if (!line || typeof line !== "object") continue;
    const p = products.find((p) => p.slug === line.slug && p.available);
    if (!p || typeof line.qty !== "number" || !Number.isSafeInteger(line.qty) || line.qty < 1)
      continue;
    result.set(p.slug, Math.min(9999, Math.max(p.moq, (result.get(p.slug) ?? 0) + line.qty)));
  }
  return Array.from(result, ([slug, qty]) => ({ slug, qty }));
}

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
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(normalizeCart(JSON.parse(raw)));
    } catch {
      // Ignore corrupt or inaccessible saved data and start with an empty cart.
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(lines));
      } catch {
        /* Cart remains usable when storage is unavailable. */
      }
    }
  }, [lines, ready]);

  const add = (slug: string, qty: number) =>
    setLines((ls) => {
      return normalizeCart([...ls, { slug, qty }]);
    });
  const setQty = (slug: string, qty: number) =>
    setLines((ls) => normalizeCart(ls.map((l) => (l.slug === slug ? { ...l, qty } : l))));
  const remove = (slug: string) => setLines((ls) => ls.filter((l) => l.slug !== slug));

  return (
    <CartContext.Provider
      value={{
        lines,
        count: lines.reduce((s, l) => s + l.qty, 0),
        add,
        setQty,
        remove,
        clear: () => setLines([]),
      }}
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
