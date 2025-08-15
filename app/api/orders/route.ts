import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

type Item = { id: string; price: number; qty: number };
export async function POST(req: Request) {
  try {
    const { tableId, token, items, notes } = (await req.json()) as {
      tableId?: string;
      token?: string;
      items?: Item[];
      notes?: string;
    };

    if (!tableId || !token || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    // 1) 核验桌台与token
    const { data: trow, error: terr } = await supabaseAdmin
      .from("dining_tables")
      .select("id, guest_token, name, is_active")
      .eq("id", tableId)
      .single();
    if (terr || !trow || trow.guest_token !== token || trow.is_active === false) {
      return NextResponse.json({ error: "invalid_table_token" }, { status: 403 });
    }

    // 2) 计算金额
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const total = subtotal;

    // 3) 创建订单
    const { data: order, error: oerr } = await supabaseAdmin
      .from("orders")
      .insert({
        table_id: tableId,
        guest_token: token,
        otype: "dine_in",
        status: "placed",
        subtotal,
        discount: 0,
        total,
        notes: notes ?? null,
      })
      .select("id")
      .single();
    if (oerr || !order) {
      return NextResponse.json({ error: "create_order_failed" }, { status: 500 });
    }

    // 4) 写入订单项
    const rows = items.map((it) => ({
      order_id: order.id,
      product_id: it.id,
      quantity: it.qty,
      unit_price: it.price,
    }));
    const { error: ierr } = await supabaseAdmin.from("order_items").insert(rows);
    if (ierr) {
      return NextResponse.json({ error: "create_items_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderId: order.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}
