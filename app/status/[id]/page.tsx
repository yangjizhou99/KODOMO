"use client";
import { useEffect, useMemo, useState } from "react";

type OStatus = "placed" | "preparing" | "ready" | "served" | "cancelled";
type OItem = { title: string; qty: number };
type OData = { id: string; tableName: string; status: OStatus; total: number; createdAt: string; items: OItem[] };

export default function OrderStatusPage({ params, searchParams }: { params: { id: string }, searchParams: { table?: string, token?: string } }) {
  const orderId = params.id;
  const table = searchParams.table || "";
  const token = searchParams.token || "";
  const [data, setData] = useState<OData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/order-status?orderId=${orderId}&table=${table}&token=${token}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "load_failed");
      setData(j);
      setError(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  useEffect(() => {
    let t: any;
    load();
    const tick = async () => { await load(); t = setTimeout(tick, 3000); };
    t = setTimeout(tick, 3000);
    return () => clearTimeout(t);
  }, [orderId, table, token]);

  const steps = useMemo(() => ([
    { key: "placed", label: "已下單" },
    { key: "preparing", label: "製作中" },
    { key: "ready", label: "可取餐" },
    { key: "served", label: "已送達" },
  ] as { key: OStatus, label: string }[]), []);

  const stepIndex = steps.findIndex(s => s.key === (data?.status ?? "placed"));

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">訂單狀態</h1>
      {!data && !error && <div className="text-muted">載入中…</div>}
      {error && <div className="text-danger">錯誤：{error}</div>}
      {data && (
        <>
          <section className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">桌號：{data.tableName}</div>
                <div className="text-sm text-muted">訂單：{data.id.slice(0, 8)}…</div>
              </div>
              <div className="text-xl font-extrabold" style={{ color: "var(--brand)" }}>{Math.round(data.total)} 円</div>
            </div>

            {/* 步驟條 */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {steps.map((s, i) => {
                console.log(`Step ${i}: ${s.key}, Current status: ${data?.status}, Match: ${i === stepIndex}`);
                return (
                  <div key={s.key} className={`text-center py-2 rounded-lg border ${
                    i === stepIndex ? "bg-brand/10 border-brand text-text" : 
                    i < stepIndex ? "bg-success/10 border-success text-text" : 
                    "border-border text-muted"
                  }`}>
                    {s.label}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-4">
            <div className="font-bold mb-2">品項</div>
            <ul className="list-disc pl-5 text-sm">
              {data.items.map((it, idx) => (
                <li key={idx}><b className="mr-1">×{it.qty}</b>{it.title}</li>
              ))}
            </ul>
            <div className="text-xs text-muted mt-3">
              狀態會自動刷新。請保持此頁開啟；顯示「可取餐/已送達」後前往取餐或等待服務人員。
            </div>
          </section>
        </>
      )}
    </main>
  );
}
