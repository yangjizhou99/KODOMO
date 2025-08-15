import KDSBoard from "../../../components/admin/KDSBoard";

export const dynamic = "force-dynamic";

export default function KDSPage({ searchParams }: { searchParams: { key?: string } }) {
  if (process.env.ADMIN_ACCESS_KEY && searchParams.key !== process.env.ADMIN_ACCESS_KEY) {
    return <main className="p-6">Forbidden: append ?key=ADMIN_ACCESS_KEY</main>;
  }
  return (
    <main className="max-w-7xl mx-auto p-6">
      <KDSBoard adminKey={searchParams.key!} />
    </main>
  );
}
