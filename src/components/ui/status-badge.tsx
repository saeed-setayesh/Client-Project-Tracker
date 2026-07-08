import { cn } from "@/lib/utils";
import type { ProjectStatus, TaskStatus } from "@/db/schema";

const projectColors: Record<ProjectStatus, string> = {
  planning: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  active: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  on_hold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const taskColors: Record<TaskStatus, string> = {
  todo: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  in_progress: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const labels: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export function StatusBadge({
  status,
  type = "project",
}: {
  status: ProjectStatus | TaskStatus;
  type?: "project" | "task";
}) {
  const colors = type === "project" ? projectColors : taskColors;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        colors[status as keyof typeof colors],
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
