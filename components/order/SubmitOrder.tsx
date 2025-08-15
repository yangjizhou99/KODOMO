"use client";
import { useState } from "react";
import { useCart } from "../cart/CartContext";
import { supabase } from "../../lib/supabaseClient";

export default function SubmitOrder({ tableId, token }: { tableId: string; token: string }) {
  const cart = useCart();
  const [loading, setLoading] = useState(false);

  async function placeOrder() {
    if (cart.items.length === 0) return;
    setLoading(true);
    try {
      // 1) 建立訂單（匿名：帶上 table_id + guest_token，RLS 校驗）
      const subtotal = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
      const { data: order, error: err1 } = await supabase
        .from("orders")
        .insert({
          table_id: tableId,
          guest_token: token,
          otype: "dine_in",
          status: "placed",
          subtotal,
          total: subtotal,
        })
        .select("*")
        .single();
      if (err1) throw err1;

      // 2) 批量插入 order_items
      const rows = cart.items.map((it) => ({
        order_id: order.id,
        product_id: it.id,
        quantity: it.qty,
        unit_price: it.price,
      }));
      const { error: err2 } = await supabase.from("order_items").insert(rows);
      if (err2) throw err2;

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
