import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

const NEXT: Record<string, string[]> = {
  placed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
};

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const { orderId, to } = (await req.json()) as { orderId?: string; to?: string };
    if (!orderId || !to) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

    const { data: curr, error: gerr } = await supabaseAdmin
      .from("orders").select("id, status").eq("id", orderId).single();
    if (gerr || !curr) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

    const allowed = NEXT[curr.status] || [];
    if (!allowed.includes(to)) {
      return NextResponse.json({ error: "invalid_transition" }, { status: 400 });
    }

    const { error: uerr } = await supabaseAdmin
      .from("orders")
      .update({ status: to })
      .eq("id", orderId);
    if (uerr) throw uerr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
