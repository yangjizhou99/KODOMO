"use client";
import { useCart } from "./CartContext";
import { formatJPY } from "../../lib/money";

export default function CartDrawer() {
  const { open, setOpen, items, inc, dec, remove, total, clear } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      {/* 抽屉本体 */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl
        transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          <h3 className="text-xl font-bold">購物車</h3>
          <button className="text-danger" onClick={clear}>清空</button>
        </div>
        <div className="p-4 space-y-3 max-h-[calc(100%-160px)] overflow-auto">
          {items.length === 0 ? (
            <p className="text-muted">你的購物車是空的。</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-muted">{formatJPY(it.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border border-border rounded" onClick={() => dec(it.id)}>-</button>
                  <span className="w-6 text-center">{it.qty}</span>
                  <button className="px-2 py-1 border border-border rounded" onClick={() => inc(it.id)}>+</button>
                  <button className="ml-2 text-danger" onClick={() => remove(it.id)}>刪除</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted">合計</span>
            <span className="text-lg font-bold">{formatJPY(total)}</span>
          </div>
          <button
            disabled={items.length === 0}
            className="button-primary w-full py-3 disabled:opacity-50"
            onClick={() => alert("後面接結帳流程/掃碼點餐")}
          >
            前往結帳
          </button>
        </div>
      </aside>
    </div>
  );
}
