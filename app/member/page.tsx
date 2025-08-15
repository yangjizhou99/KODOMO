"use client";

import { useEffect, useState } from "react";
import { supaBrowser } from "../../lib/supabaseBrowser";

type Wallet = { balance: number };

export default function MemberPage() {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [me, setMe] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function refreshMe() {
    const { data } = await supaBrowser.auth.getUser();
    setMe(data.user ?? null);
  }

  async function loadWallet() {
    if (!me?.id) return setWallet(null);
    const { data, error } = await supaBrowser
      .from("wallets")
      .select("balance")
      .eq("user_id", me.id)
      .maybeSingle();
    if (error) console.error(error);
    setWallet({ balance: data?.balance ?? 0 });
  }

  useEffect(() => {
    (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (me?.id) loadWallet();
  }, [me?.id]);

  async function signUp() {
    setMsg(null);
    const { error } = await supaBrowser.auth.signUp({
      email: userEmail,
      password,
    });
    if (error) return setMsg("注册失败：" + error.message);
    setMsg("注册成功！已登录。");
    await refreshMe();
  }

  async function signIn() {
    setMsg(null);
    const { error } = await supaBrowser.auth.signInWithPassword({
      email: userEmail,
      password,
    });
    if (error) return setMsg("登录失败：" + error.message);
    setMsg("登录成功！");
    await refreshMe();
  }

  async function signOut() {
    await supaBrowser.auth.signOut();
    setMe(null);
    setWallet(null);
  }

  async function demoTopup(amount: number) {
    try {
      // 调用我们在 SQL 里创建的 RPC：topup_wallet(amount, method)
      const { error } = await supaBrowser.rpc("topup_wallet", { p_amount: amount, p_method: "cash" });
      if (error) throw error;
      await loadWallet();
      setMsg(`充值成功：+¥${amount.toFixed(0)}`);
    } catch (e: any) {
      setMsg("充值失败：" + (e?.message || e));
    }
  }

  if (loading) return <main className="p-6 text-muted">加载中…</main>;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">會員中心</h1>

      {!me && (
        <section className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm text-muted">开发期：邮箱 + 密码登录（Supabase 控制台关闭 Email Confirmations）</div>
          <input
            className="w-full px-3 py-2 border border-border rounded-lg"
            placeholder="邮箱"
            value={userEmail}
            onChange={e => setUserEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border border-border rounded-lg"
            placeholder="密码"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="button-primary px-4 py-2" onClick={signIn}>登录</button>
            <button className="px-4 py-2 border border-border rounded-lg" onClick={signUp}>注册</button>
          </div>
          {msg && <div className="text-sm">{msg}</div>}
        </section>
      )}

      {me && (
        <>
          <section className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">你好，{me.email}</div>
                <div className="text-sm text-muted">用戶ID：{me.id}</div>
              </div>
              <button className="px-3 py-2 border border-border rounded-lg" onClick={signOut}>退出登录</button>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="font-bold">钱包余额</div>
            <div className="text-3xl" style={{ color: "var(--brand)" }}>¥{(wallet?.balance ?? 0).toFixed(0)}</div>
            <div className="text-sm text-muted">演示充值（到店充值后端接入前，临时使用）</div>
            <div className="flex gap-2">
              {[500, 1000, 2000].map(a => (
                <button key={a} className="px-3 py-2 border border-border rounded-lg" onClick={() => demoTopup(a)}>+¥{a}</button>
              ))}
            </div>
            {msg && <div className="text-sm">{msg}</div>}
          </section>
        </>
      )}
    </main>
  );
}
