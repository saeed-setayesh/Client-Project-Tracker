import { getProject } from "@/actions/app";
import { getProjectActualCost } from "@/lib/queries";
import { requireAuth } from "@/lib/session";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BudgetBar } from "@/components/ui/budget-bar";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { formatDate } from "@/lib/utils";
import { isClient } from "@/lib/permissions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const actualCost = await getProjectActualCost(id);
  const budget = Number(project.budget);
  const readOnly = isClient(user);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={readOnly ? "/" : `/clients/${project.clientId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {readOnly ? "Back to dashboard" : project.client.companyName}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="mt-2 max-w-2xl text-white/60">{project.description}</p>
            )}
            {project.deadline && (
              <p className="mt-1 text-sm text-white/50">Deadline: {formatDate(project.deadline)}</p>
            )}
          </div>
          {!readOnly && <CreateTaskDialog projectId={project.id} />}
        </div>
      </div>

      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">Budget Tracking</h2>
        <BudgetBar budget={budget} actualCost={actualCost} />
      </GlassCard>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Task Board</h2>
        <KanbanBoard tasks={project.tasks} readOnly={readOnly} />
      </div>
    </div>
  );
}
