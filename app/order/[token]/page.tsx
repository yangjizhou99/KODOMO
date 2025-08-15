import SubmitOrder from "../../../components/order/SubmitOrder";
import ProductCard from "../../../components/ProductCard";
import { getCategories, getProductsByCategory } from "../../../lib/api/menu";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const revalidate = 0;

async function getTableInfo(tableId: string, token: string) {
  // 服務端校驗：token 是否匹配該桌台（避免 URL 被隨便猜）
  const { data, error } = await supabaseAdmin
    .from("dining_tables")
    .select("id, name, guest_token")
    .eq("id", tableId)
    .single();
  if (error || !data || data.guest_token !== token) return null;
  return data;
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { table?: string; cat?: string };
}) {
  const token = params.token;
  const tableId = searchParams.table || "";
  const table = await getTableInfo(tableId, token);
  if (!table) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">链接無效</h1>
        <p className="text-muted">請掃描有效的桌碼或向服務人員求助。</p>
      </main>
    );
  }

  // 菜單（與 /menu 相同邏輯）
  const cats = await getCategories("zh-TW");
  const active = searchParams?.cat ?? (cats[0]?.id ?? "");
  const list = await getProductsByCategory(active, "zh-TW");

  return (
    <main className="max-w-6xl mx-auto p-6 pb-24"> {/* 底部留白給固定提交按鈕 */}
      <h1 className="text-3xl font-bold mb-2">開始點餐</h1>
      <div className="text-muted mb-6">桌號：{table.name}</div>

      <div className="flex gap-6">
        <aside className="w-48 shrink-0 hidden md:block">
          <ul className="space-y-2">
            {cats.map((c) => {
              const isActive = c.id === active;
              return (
                <li key={c.id}>
                  <a
                    href={`/order/${token}?table=${tableId}&cat=${c.id}`}
                    className={`block px-3 py-2 rounded-lg border ${
                      isActive ? "border-brand text-text bg-brand/10" : "border-border text-muted"
                    }`}
                  >
                    {c.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="flex-1">
          {list.length === 0 ? (
            <div className="text-muted">這個分類暫時沒有商品。</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map((p) => (
                <ProductCard
                  key={p.id}
                  p={{
                    id: p.id,
                    categoryId: p.categoryId ?? "",
                    sku: "",
                    title: p.title,
                    description: p.description ?? undefined,
                    price: p.price,
                    image: null,
                    available: p.available,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 固定在底部的提交條 */}
      <SubmitOrder tableId={tableId} token={token} />
    </main>
  );
}
