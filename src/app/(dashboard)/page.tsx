import { getDashboardData } from "@/actions/app";
import { getProjectActualCost } from "@/lib/queries";
import { requireAuth } from "@/lib/session";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BudgetBar } from "@/components/ui/budget-bar";
import { formatDate, formatHours } from "@/lib/utils";
import Link from "next/link";
import { FolderKanban, Clock, AlertCircle } from "lucide-react";
import { isClient } from "@/lib/permissions";

export default async function DashboardPage() {
  const user = await requireAuth();
  const { activeProjects, dueSoonTasks, weeklyHours } = await getDashboardData();

  const projectsWithBudget = await Promise.all(
    activeProjects.map(async (project) => ({
      ...project,
      actualCost: await getProjectActualCost(project.id),
      budgetNum: Number(project.budget),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isClient(user) ? "Your Projects" : "Dashboard"}
        </h1>
        <p className="mt-1 text-white/50">
          {isClient(user)
            ? "Track progress on your active projects"
            : `Welcome back, ${user.name}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
            <FolderKanban className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{activeProjects.length}</p>
            <p className="text-sm text-white/50">Active Projects</p>
          </div>
        </GlassCard>

        {!isClient(user) && (
          <>
            <GlassCard className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                <AlertCircle className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{dueSoonTasks.length}</p>
                <p className="text-sm text-white/50">Tasks Due Soon</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
                <Clock className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatHours(weeklyHours)}</p>
                <p className="text-sm text-white/50">Hours This Week</p>
              </div>
            </GlassCard>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-white">Active Projects</h2>
          {projectsWithBudget.length === 0 ? (
            <p className="text-sm text-white/50">No active projects.</p>
          ) : (
            <div className="space-y-4">
              {projectsWithBudget.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white">{project.name}</span>
                    <StatusBadge status={project.status} />
                  </div>
                  {!isClient(user) && (
                    <p className="mb-2 text-xs text-white/50">{project.client.companyName}</p>
                  )}
                  <BudgetBar budget={project.budgetNum} actualCost={project.actualCost} />
                </Link>
              ))}
            </div>
          )}
        </GlassCard>

        {!isClient(user) && (
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold text-white">Tasks Due This Week</h2>
            {dueSoonTasks.length === 0 ? (
              <p className="text-sm text-white/50">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-3">
                {dueSoonTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:border-white/10"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <p className="text-xs text-white/50">{task.project.name}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={task.status} type="task" />
                      <p className="mt-1 text-xs text-white/50">{formatDate(task.dueDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
