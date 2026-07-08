import { Sidebar } from "@/components/layout/sidebar";
import { requireAuth } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <main className="ml-64 min-h-screen p-8">{children}</main>
    </div>
  );
}
