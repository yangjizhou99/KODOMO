import { categories, byCategory } from "../../lib/products";
import ProductCard from "../../components/ProductCard";

export const dynamic = "force-static";

export default function MenuPage({ searchParams }: { searchParams: { cat?: string } }) {
  const active = searchParams?.cat || categories[0].id;
  const list = byCategory(active);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">線上菜單</h1>
      <div className="flex gap-6">
        {/* 左侧分类 */}
        <aside className="w-48 shrink-0 hidden md:block">
          <ul className="space-y-2">
            {categories.map((c) => {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
