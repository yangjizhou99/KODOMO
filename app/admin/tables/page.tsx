import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

async function getTables() {
  const { data, error } = await supabaseAdmin
    .from("dining_tables")
    .select("id, name, location, guest_token, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function genQRDataURL(link: string) {
  return await QRCode.toDataURL(link, { margin: 1, width: 320 });
}

async function addTableAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "").trim() || null;
  if (!name) throw new Error("請填寫桌台名稱");

  const { error } = await supabaseAdmin
    .from("dining_tables")
    .insert({ name, location });
  if (error) throw error;
}

export default async function AdminTablesPage({ searchParams }: { searchParams: { key?: string } }) {
  // 简易口令保护（开发/内网用；上线后换成真正登录鉴权）
  if (process.env.ADMIN_ACCESS_KEY && searchParams.key !== process.env.ADMIN_ACCESS_KEY) {
    return <div style={{ padding: 24 }}>Forbidden: provide ?key=ADMIN_ACCESS_KEY</div>;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const rows = await getTables();

  // 生成每个桌台的 QR data URL
  const withQR = await Promise.all(
    rows.map(async (r) => {
      const link = `${site}/order/${r.guest_token}?table=${r.id}`;
      const dataUrl = await genQRDataURL(link);
      return { ...r, link, dataUrl };
    })
  );

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">桌台管理</h1>

      <form action={addTableAction} className="flex flex-wrap gap-3 items-end bg-card p-4 border border-border rounded-lg">
        <div>
          <label className="block text-sm text-muted mb-1">桌台名稱</label>
          <input name="name" placeholder="A1" className="px-3 py-2 border border-border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">位置</label>
          <input name="location" placeholder="1F" className="px-3 py-2 border border-border rounded-lg" />
        </div>
        <button className="button-primary px-4 py-2">新增桌台</button>
      </form>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {withQR.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-lg p-4">
            <div className="font-bold">{t.name} <span className="text-muted text-sm">({t.location || "-"})</span></div>
            <div className="text-xs text-muted mb-3">ID: {t.id}</div>
            <img src={t.dataUrl} alt={`QR ${t.name}`} className="w-full rounded-lg border border-border" />
            <div className="mt-3 break-all text-sm">{t.link}</div>
            <div className="mt-3 flex gap-2">
              <a href={t.dataUrl} download={`${t.name}.png`} className="px-3 py-2 border border-border rounded-lg">下載 PNG</a>
              <a href={t.link} target="_blank" className="button-primary px-3 py-2">打開連結</a>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
