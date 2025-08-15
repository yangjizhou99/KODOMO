"use client";
import { useState } from "react";

export default function AdminTopupPage({ searchParams }: { searchParams: { key?: string } }) {
  const ak = searchParams.key;
  if (process.env.NEXT_PUBLIC_SITE_URL && !ak) {
    // 简易口令保护
  }
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    try {
      const res = await fetch("/api/admin/topup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": ak || "",
        },
        body: JSON.stringify({ email, amount, method: "cash" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      setMsg("充值成功");
    } catch (e: any) {
      setMsg("充值失败：" + (e?.message || e));
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">後台 · 為用戶充值</h1>
      {!ak && <div className="text-danger">缺少口令：請在網址後加 ?key=ADMIN_ACCESS_KEY</div>}
      <input
        className="w-full px-3 py-2 border border-border rounded-lg"
        placeholder="用戶郵箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full px-3 py-2 border border-border rounded-lg"
        type="number"
        min={1}
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
      />
      <button disabled={!ak} className="button-primary px-4 py-2 disabled:opacity-50" onClick={submit}>
        充值
      </button>
      {msg && <div className="text-sm">{msg}</div>}
    </main>
  );
}
