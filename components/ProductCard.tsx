"use client";
import type { Product } from "../lib/products";
import { useCart } from "./cart/CartContext";
import { formatJPY } from "../lib/money";

export default function ProductCard({ p }: { p: Product }) {
  const cart = useCart();
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-[var(--border)]" />
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-semibold">{p.title}</div>
        {p.description && <div className="text-sm text-muted">{p.description}</div>}
        <div className="mt-2 font-bold">{formatJPY(p.price)}</div>
        <div className="mt-auto pt-3">
          {p.available ? (
            <button
              className="button-primary w-full py-2"
              onClick={() => {
                cart.add(p);
                cart.setOpen(true);
              }}
            >
              加入購物車
            </button>
          ) : (
            <div className="w-full py-2 text-center bg-[var(--danger)]/10 text-danger rounded">
              已售罄
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
