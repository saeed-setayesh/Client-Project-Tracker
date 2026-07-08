import { getClients } from "@/actions/app";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Search } from "lucide-react";
import { CreateClientDialog } from "@/components/clients/create-client-dialog";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients(q);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          <p className="mt-1 text-white/50">Manage your client companies</p>
        </div>
        <CreateClientDialog />
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search clients..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-white placeholder:text-white/30 backdrop-blur-sm focus:border-cyan-400/50 focus:outline-none"
        />
      </form>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client company to start tracking projects."
          action={<CreateClientDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <GlassCard className="transition-all hover:border-white/20 hover:bg-white/10">
                <h3 className="text-lg font-semibold text-white">{client.companyName}</h3>
                <p className="mt-1 text-sm text-white/50">{client.contactName}</p>
                <p className="mt-1 text-xs text-white/40">{client.email}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    {client.projects.length} project{client.projects.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-cyan-400">View →</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
