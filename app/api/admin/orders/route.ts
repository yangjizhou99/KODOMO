import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

interface Order {
  id: string;
  table_id: string;
  created_at: string;
  status: string;
  total: number;
  dining_tables: { name: string }[];
}

export async function GET(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    // 1) 取订单（活跃状态）
    const { data: orders, error: oerr } = await supabaseAdmin
      .from("orders")
      .select("id, table_id, created_at, status, total, dining_tables(name)")
      .in("status", ["placed", "preparing", "ready"])
      .order("created_at", { ascending: true });

    if (oerr) throw oerr;
    const ids = (orders ?? []).map((o) => o.id);
    if (ids.length === 0) return NextResponse.json({ orders: [] });

    // 2) 取条目（只要名称与数量）
    const { data: items, error: ierr } = await supabaseAdmin
      .from("order_items")
      .select("order_id, product_id, quantity");
    if (ierr) throw ierr;

    // 3) 取商品翻译（zh-TW）
    const pids = Array.from(new Set((items ?? []).map((x) => x.product_id)));
    const { data: names, error: nerr } = await supabaseAdmin
      .from("product_translations")
      .select("product_id, title")
      .eq("lang_code", "zh-TW")
      .in("product_id", pids.length ? pids : ["00000000-0000-0000-0000-000000000000"]);
    if (nerr) throw nerr;

    const titleByPid = new Map(names?.map((n) => [n.product_id, n.title]) ?? []);
    const itemsByOrder = new Map<string, { title: string; qty: number }[]>();
    (items ?? []).forEach((it) => {
      const arr = itemsByOrder.get(it.order_id) ?? [];
      arr.push({ title: titleByPid.get(it.product_id) ?? "未命名商品", qty: it.quantity });
      itemsByOrder.set(it.order_id, arr);
    });

    const result = (orders as Order[] ?? []).map((o) => ({
      id: o.id,
      tableName: o.dining_tables[0]?.name ?? "-",
      createdAt: o.created_at,
      status: o.status as "placed" | "preparing" | "ready",
      total: o.total,
      items: itemsByOrder.get(o.id) ?? [],
    }));

    return NextResponse.json({ orders: result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
