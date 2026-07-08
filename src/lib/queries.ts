"use server";

import { db } from "@/db";
import { projects, tasks, timeEntries, users } from "@/db/schema";
import { eq, and, sql, gte, lte, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { canAccessProject } from "@/lib/permissions";

export async function getProjectActualCost(projectId: string) {
  const user = await requireAuth();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project || !canAccessProject(user, project)) return 0;

  const result = await db
    .select({
      cost: sql<string>`COALESCE(SUM(${timeEntries.hours}::numeric * ${users.hourlyRate}::numeric), 0)`,
    })
    .from(timeEntries)
    .innerJoin(tasks, eq(timeEntries.taskId, tasks.id))
    .innerJoin(users, eq(timeEntries.userId, users.id))
    .where(and(eq(tasks.projectId, projectId), eq(timeEntries.billable, true)));

  return Number(result[0]?.cost ?? 0);
}

export async function getWeeklyHours(orgId: string, clientId?: string | null) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startStr = weekStart.toISOString().split("T")[0];
  const endStr = weekEnd.toISOString().split("T")[0];

  let projectIds: string[] = [];

  if (clientId) {
    const clientProjects = await db.query.projects.findMany({
      where: and(eq(projects.orgId, orgId), eq(projects.clientId, clientId)),
      columns: { id: true },
    });
    projectIds = clientProjects.map((p) => p.id);
    if (projectIds.length === 0) return 0;
  }

  const conditions = [
    gte(timeEntries.date, startStr),
    lte(timeEntries.date, endStr),
  ];

  if (clientId && projectIds.length > 0) {
    const projectTasks = await db.query.tasks.findMany({
      where: inArray(tasks.projectId, projectIds),
      columns: { id: true },
    });
    const taskIds = projectTasks.map((t) => t.id);
    if (taskIds.length === 0) return 0;

    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${timeEntries.hours}::numeric), 0)` })
      .from(timeEntries)
      .where(and(...conditions, inArray(timeEntries.taskId, taskIds)));

    return Number(result[0]?.total ?? 0);
  }

  const result = await db
    .select({ total: sql<string>`COALESCE(SUM(${timeEntries.hours}::numeric), 0)` })
    .from(timeEntries)
    .innerJoin(tasks, eq(timeEntries.taskId, tasks.id))
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(projects.orgId, orgId), ...conditions));

  return Number(result[0]?.total ?? 0);
}
