import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const { email, amount, method } = await req.json();
    const amt = Number(amount);
    if (!email || !amt || amt <= 0) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

    // 查用户
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;
    const user = users.find((u: { email?: string }) => u.email === email);
    const uid = user?.id;
    if (!uid) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    // 记流水
    const { error: txErr } = await supabaseAdmin.from("wallet_transactions").insert({
      user_id: uid,
      kind: "topup",
      amount: amt,
      method: method || "cash",
      status: "succeeded",
    });
    if (txErr) throw txErr;

    // 读当前余额
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", uid)
      .maybeSingle();

    // 更新余额
    const newBalance = (wallet?.balance ?? 0) + amt;
    const { error: walletError } = await supabaseAdmin
      .from("wallets")
      .upsert({ user_id: uid, balance: newBalance });
      
    if (walletError) throw walletError;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
