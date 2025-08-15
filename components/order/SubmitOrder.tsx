"use client";
import { useState } from "react";
import { useCart } from "../cart/CartContext";

export default function SubmitOrder({ tableId, token }: { tableId: string; token: string }) {
  const cart = useCart();
  const [loading, setLoading] = useState(false);

  async function placeOrder() {
    if (cart.items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tableId,
          token,
          items: cart.items.map((it) => ({ id: it.id, price: it.price, qty: it.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "order_failed");

      cart.clear();
      alert("下單成功！訂單已送至後台。");
    } catch (e: any) {
      alert("下單失敗：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center">
      <button
        disabled={cart.items.length === 0 || loading}
        onClick={placeOrder}
        className="button-primary px-6 py-3 disabled:opacity-50"
      >
        {loading ? "送出中..." : `送出訂單（${cart.items.length} 件）`}
      </button>
    </div>
  );
}
