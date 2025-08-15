export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Hero */}
      <section className="rounded-2xl p-8 bg-brand/10 border border-border">
        <h1 className="text-4xl font-extrabold mb-3" style={{ color: "var(--brand)" }}>
          今天也要好好吃飯。
        </h1>
        <p className="text-muted max-w-2xl">
          把家常味道端上桌。主打招牌餐點與節慶活動，線上點餐更快捷。
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/menu" className="button-primary px-4 py-2">開始點餐</a>
          <a href="/news" className="px-4 py-2 border border-border rounded-lg">看看優惠</a>
        </div>
      </section>

      {/* 快速入口 */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "線上購物", href: "/menu", desc: "點選商品立即下單" },
          { title: "掃碼點餐", href: "/qr", desc: "到店掃碼就座點餐" },
          { title: "會員卡儲值", href: "/member", desc: "儲值享回饋" },
        ].map((x) => (
          <a
            key={x.title}
            href={x.href}
            className="block p-5 rounded-xl bg-card border border-border hover:border-brand transition"
          >
            <div className="font-bold">{x.title}</div>
            <div className="text-sm text-muted mt-1">{x.desc}</div>
          </a>
        ))}
      </section>
    </main>
  );
}
