"use client";
import Link from "next/link";
import { useCart } from "./cart/CartContext";

export default function Header() {
  const cart = useCart();
  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl" style={{ color: "var(--brand)" }}>
          Kodomo<span className="text-text"> 2.0</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-text">
          <Link href="/menu">菜單</Link>
          <Link href="/news">最新消息</Link>
          <Link href="/contact">聯絡我們</Link>
        </nav>
        <button
          className="relative button-primary px-3 py-2"
          onClick={() => cart.setOpen(true)}
        >
          購物車
          {cart.count > 0 && (
            <span className="absolute -top-2 -right-2 bg-text text-white text-xs rounded-full px-1.5">
              {cart.count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
