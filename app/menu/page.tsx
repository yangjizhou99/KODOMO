import ProductCard from "../../components/ProductCard";
import { getCategories, getProductsByCategory } from "../../lib/api/menu";

export const revalidate = 0; // 开发期禁用缓存，方便调试

export default async function MenuPage({ searchParams }: { searchParams: { cat?: string } }) {
  // 1) 读分类
  const cats = await getCategories("zh-TW");
  const active = searchParams?.cat ?? (cats[0]?.id ?? "");
  // 2) 读商品（按分类）
  const list = await getProductsByCategory(active, "zh-TW");

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">線上菜單</h1>
      <div className="flex gap-6">
        {/* 左侧分类 */}
        <aside className="w-48 shrink-0 hidden md:block">
          <ul className="space-y-2">
            {cats.map((c) => {
              const isActive = c.id === active;
              return (
                <li key={c.id}>
                  <a
                    href={`/menu?cat=${c.id}`}
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

        {/* 右侧商品网格 */}
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
    </main>
  );
}
