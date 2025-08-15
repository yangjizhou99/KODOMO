"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Item = { title: string; qty: number };
type KOrder = {
  id: string;
  tableName: string;
  createdAt: string;
  status: "placed" | "preparing" | "ready";
  total: number;
  items: Item[];
};

async function fetchOrders(adminKey: string): Promise<KOrder[]> {
  const res = await fetch("/api/admin/orders", { headers: { "x-admin-key": adminKey } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.orders as KOrder[];
}

async function updateStatus(adminKey: string, orderId: string, to: string) {
  const res = await fetch("/api/admin/orders/status", {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify({ orderId, to }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.error || "update_failed");
  }
}

export default function KDSBoard({ adminKey }: { adminKey: string }) {
  const [orders, setOrders] = useState<KOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const prevPlaced = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初次和轮询
  useEffect(() => {
    let timer: any;
    const tick = async () => {
      try {
        const list = await fetchOrders(adminKey);
        setOrders(list);

        // 新单响铃：新出现的 placed
        const nowPlaced = new Set(list.filter(o => o.status === "placed").map(o => o.id));
        const newly = [...nowPlaced].filter(id => !prevPlaced.current.has(id));
        if (!muted && newly.length > 0) {
          audioRef.current?.play().catch(() => {});
        }
        prevPlaced.current = nowPlaced;
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        timer = setTimeout(tick, 3000);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [adminKey, muted]);

  const groups = useMemo(() => {
    const g = { placed: [] as KOrder[], preparing: [] as KOrder[], ready: [] as KOrder[] };
    orders.forEach(o => (g[o.status] as KOrder[]).push(o));
    return g;
  }, [orders]);

  const Col = ({ title, list }: { title: string; list: KOrder[] }) => (
    <div className="flex-1 min-w-[320px]">
      <div className="sticky top-0 bg-bg z-10 py-2 font-bold">{title}（{list.length}）</div>
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className={`border border-border rounded-lg p-3 bg-card`}>
            <div className="flex items-center justify-between">
              <div className="font-bold">
                桌 {o.tableName} <span className="text-muted text-xs ml-2">{new Date(o.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-muted">{Math.round(o.total)} 円</div>
            </div>
            <ul className="mt-2 text-sm list-disc pl-5">
              {o.items.map((it, i) => (
                <li key={i}><b className="mr-1">×{it.qty}</b>{it.title}</li>
              ))}
            </ul>

            <div className="mt-3 flex gap-2">
              {o.status === "placed" && (
                <>
                  <button className="px-3 py-1 rounded-lg border border-border" onClick={() => updateStatus(adminKey, o.id, "preparing")}>開始製作</button>
                  <button className="px-3 py-1 rounded-lg border border-border text-danger" onClick={() => updateStatus(adminKey, o.id, "cancelled")}>取消</button>
                </>
              )}
              {o.status === "preparing" && (
                <>
                  <button className="px-3 py-1 rounded-lg border border-border" onClick={() => updateStatus(adminKey, o.id, "ready")}>完成出餐</button>
                  <button className="px-3 py-1 rounded-lg border border-border text-danger" onClick={() => updateStatus(adminKey, o.id, "cancelled")}>取消</button>
                </>
              )}
              {o.status === "ready" && (
                <button className="px-3 py-1 rounded-lg border border-border" onClick={() => updateStatus(adminKey, o.id, "served")}>已送達</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYBHGZmZmY=" preload="auto" />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">後台 · KDS</h2>
        <button className="px-3 py-2 rounded-lg border border-border" onClick={() => setMuted(m => !m)}>
          {muted ? "🔇 靜音" : "🔔 鈴聲開"}
        </button>
      </div>
      {loading ? <div className="text-muted">載入中…</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Col title="新單（待製作）" list={groups.placed} />
          <Col title="製作中" list={groups.preparing} />
          <Col title="完成待取" list={groups.ready} />
        </div>
      )}
    </div>
  );
}
