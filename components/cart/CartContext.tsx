"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../../lib/products";

export type CartItem = { id: string; title: string; price: number; qty: number };
type CartState = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartState | null>(null);
const KEY = "kodomo:cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  // persist
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const api: CartState = useMemo(() => {
    const add = (p: Product) =>
      setItems((prev) => {
        const i = prev.findIndex((x) => x.id === p.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + 1 };
          return next;
        }
        return [...prev, { id: p.id, title: p.title, price: p.price, qty: 1 }];
      });
    const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));
    const inc = (id: string) =>
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
      );
    const dec = (id: string) =>
      setItems((prev) =>
        prev
          .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
          .filter((x) => x.qty > 0),
      );
    const clear = () => setItems([]);
    const total = items.reduce((s, x) => s + x.price * x.qty, 0);
    const count = items.reduce((s, x) => s + x.qty, 0);
    return { items, add, remove, inc, dec, clear, total, count, open, setOpen };
  }, [items, open]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
