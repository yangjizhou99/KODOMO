import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId") || "";
    const tableId = url.searchParams.get("table") || "";
    const token = url.searchParams.get("token") || "";
    const lang = (url.searchParams.get("lang") || "zh-TW") as "zh-TW" | "en";

    if (!orderId || !tableId || !token) {
      return NextResponse.json({ error: "invalid_query" }, { status: 400 });
    }

    // 1) 校验桌台 + token
    const { data: table, error: terr } = await supabaseAdmin
      .from("dining_tables")
      .select("id, name, guest_token, is_active")
      .eq("id", tableId)
      .single();
    if (terr || !table || table.guest_token !== token || table.is_active === false) {
      return NextResponse.json({ error: "invalid_table_token" }, { status: 403 });
    }

    // 2) 读取订单（确保属于该桌台+token）
    const { data: order, error: oerr } = await supabaseAdmin
      .from("orders")
      .select("id, table_id, guest_token, status, total, created_at")
      .eq("id", orderId)
      .eq("table_id", tableId)
      .eq("guest_token", token)
      .single();
    if (oerr || !order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

    // 3) 读取条目 + 商品名称（lang）
    const { data: items, error: ierr } = await supabaseAdmin
      .from("order_items")
      .select("product_id, quantity");
    if (ierr) throw ierr;

    const pids = Array.from(new Set((items ?? []).filter(i => i).map(i => i.product_id)));
    const { data: names, error: nerr } = await supabaseAdmin
      .from("product_translations")
      .select("product_id, title")
      .eq("lang_code", lang)
      .in("product_id", pids.length ? pids : ["00000000-0000-0000-0000-000000000000"]);
    if (nerr) throw nerr;

    const titleByPid = new Map(names?.map(n => [n.product_id, n.title]) ?? []);
    const orderItems = (items ?? [])
      .filter(i => i)
      .map(i => ({ title: titleByPid.get(i.product_id) ?? "未命名商品", qty: i.quantity }));

    return NextResponse.json({
      id: order.id,
      tableName: table.name,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      items: orderItems,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
