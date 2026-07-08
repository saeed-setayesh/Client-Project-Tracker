import { getClient } from "@/actions/app";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Mail, Phone, User } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{client.companyName}</h1>
          <p className="mt-1 text-white/50">Client details and projects</p>
        </div>
        <CreateProjectDialog clientId={client.id} />
      </div>

      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">Contact Info</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-white/40" />
            <span className="text-white/80">{client.contactName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-white/40" />
            <span className="text-white/80">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-white/40" />
              <span className="text-white/80">{client.phone}</span>
            </div>
          )}
        </div>
      </GlassCard>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Projects</h2>
        {client.projects.length === 0 ? (
          <GlassCard>
            <p className="text-center text-sm text-white/50">No projects yet for this client.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {client.projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <GlassCard className="transition-all hover:border-white/20 hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.deadline && (
                    <p className="mt-2 text-xs text-white/50">Due {formatDate(project.deadline)}</p>
                  )}
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
