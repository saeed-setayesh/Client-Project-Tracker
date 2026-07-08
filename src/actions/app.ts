"use server";

import { db } from "@/db";
import {
  clients,
  comments,
  invitations,
  projects,
  tasks,
  timeEntries,
  users,
} from "@/db/schema";
import { eq, and, desc, ilike, or, gte, lte, sql, inArray, ne } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import {
  canEditData,
  canManageTeam,
  canAccessProject,
  canViewInternalComments,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// ─── Clients ───────────────────────────────────────────────

export async function getClients(search?: string) {
  const user = await requireAuth();

  const conditions = [eq(clients.orgId, user.orgId)];

  if (search) {
    conditions.push(
      or(
        ilike(clients.companyName, `%${search}%`),
        ilike(clients.contactName, `%${search}%`),
      )!,
    );
  }

  return db.query.clients.findMany({
    where: and(...conditions),
    orderBy: [desc(clients.createdAt)],
    with: { projects: true },
  });
}

export async function getClient(id: string) {
  const user = await requireAuth();

  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, id), eq(clients.orgId, user.orgId)),
    with: { projects: true },
  });

  return client ?? null;
}

export async function createClient(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (!canEditData(user)) throw new Error("Unauthorized");

  const [client] = await db
    .insert(clients)
    .values({
      orgId: user.orgId,
      companyName: formData.get("companyName") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
    })
    .returning();

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

// ─── Projects ──────────────────────────────────────────────

export async function getProjects() {
  const user = await requireAuth();

  const conditions = [eq(projects.orgId, user.orgId)];
  if (user.role === "client" && user.clientId) {
    conditions.push(eq(projects.clientId, user.clientId));
  }

  return db.query.projects.findMany({
    where: and(...conditions),
    orderBy: [desc(projects.createdAt)],
    with: { client: true, tasks: true },
  });
}

export async function getProject(id: string) {
  const user = await requireAuth();

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.orgId, user.orgId)),
    with: {
      client: true,
      tasks: {
        orderBy: [tasks.position],
        with: { assignee: true },
      },
    },
  });

  if (!project || !canAccessProject(user, project)) return null;
  return project;
}

export async function createProject(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (!canEditData(user)) throw new Error("Unauthorized");

  const [project] = await db
    .insert(projects)
    .values({
      orgId: user.orgId,
      clientId: formData.get("clientId") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as "planning") || "planning",
      budget: (formData.get("budget") as string) || "0",
      deadline: (formData.get("deadline") as string) || null,
    })
    .returning();

  revalidatePath(`/clients/${project.clientId}`);
  redirect(`/projects/${project.id}`);
}

// ─── Tasks ─────────────────────────────────────────────────

export async function getTask(id: string) {
  const user = await requireAuth();

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: {
      project: { with: { client: true } },
      assignee: true,
      timeEntries: { with: { user: true }, orderBy: [desc(timeEntries.date)] },
      comments: {
        with: { user: true },
        orderBy: [desc(comments.createdAt)],
      },
    },
  });

  if (!task || !canAccessProject(user, task.project)) return null;

  if (!canViewInternalComments(user)) {
    task.comments = task.comments.filter((c) => !c.isInternal);
  }

  if (user.role === "client") {
    task.timeEntries = [];
  }

  return task;
}

export async function createTask(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (!canEditData(user)) throw new Error("Unauthorized");

  const projectId = formData.get("projectId") as string;

  const existing = await db
    .select({ maxPos: sql<number>`COALESCE(MAX(${tasks.position}), -1)` })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const [task] = await db
    .insert(tasks)
    .values({
      projectId,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      assigneeId: (formData.get("assigneeId") as string) || null,
      dueDate: (formData.get("dueDate") as string) || null,
      position: (existing[0]?.maxPos ?? -1) + 1,
    })
    .returning();

  revalidatePath(`/projects/${projectId}`);
  redirect(`/tasks/${task.id}`);
}

export async function updateTaskStatus(
  taskId: string,
  status: "todo" | "in_progress" | "done",
  position: number,
) {
  const user = await requireAuth();
  if (!canEditData(user)) return { error: "Unauthorized" };

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: { project: true },
  });

  if (!task || !canAccessProject(user, task.project)) {
    return { error: "Not found" };
  }

  await db
    .update(tasks)
    .set({ status, position })
    .where(eq(tasks.id, taskId));

  revalidatePath(`/projects/${task.projectId}`);
  return { success: true };
}

export async function updateTaskStatusField(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (!canEditData(user)) throw new Error("Unauthorized");

  const taskId = formData.get("taskId") as string;
  const status = formData.get("status") as "todo" | "in_progress" | "done";

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: { project: true },
  });

  if (!task || !canAccessProject(user, task.project)) {
    throw new Error("Not found");
  }

  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/projects/${task.projectId}`);
}

// ─── Comments ──────────────────────────────────────────────

export async function addComment(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const taskId = formData.get("taskId") as string;
  const body = formData.get("body") as string;
  const isInternal = formData.get("isInternal") === "true";

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: { project: true },
  });

  if (!task || !canAccessProject(user, task.project)) {
    throw new Error("Not found");
  }

  if (isInternal && !canViewInternalComments(user)) {
    throw new Error("Unauthorized");
  }

  await db.insert(comments).values({
    taskId,
    userId: user.id,
    body,
    isInternal: canViewInternalComments(user) ? isInternal : false,
  });

  revalidatePath(`/tasks/${taskId}`);
}

// ─── Time Entries ────────────────────────────────────────────

export async function addTimeEntry(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (!canEditData(user)) throw new Error("Unauthorized");

  const taskId = formData.get("taskId") as string;

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: { project: true },
  });

  if (!task || !canAccessProject(user, task.project)) {
    throw new Error("Not found");
  }

  await db.insert(timeEntries).values({
    taskId,
    userId: user.id,
    hours: formData.get("hours") as string,
    date: formData.get("date") as string,
    billable: formData.get("billable") === "true",
    note: (formData.get("note") as string) || null,
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/projects/${task.projectId}`);
}

// ─── Dashboard ───────────────────────────────────────────────

export async function getDashboardData() {
  const user = await requireAuth();

  const projectConditions = [eq(projects.orgId, user.orgId)];
  if (user.role === "client" && user.clientId) {
    projectConditions.push(eq(projects.clientId, user.clientId));
  }

  const activeProjects = await db.query.projects.findMany({
    where: and(...projectConditions, eq(projects.status, "active")),
    with: { client: true },
    limit: 5,
  });

  const now = new Date();
  const weekLater = new Date(now);
  weekLater.setDate(now.getDate() + 7);
  const todayStr = now.toISOString().split("T")[0];
  const weekStr = weekLater.toISOString().split("T")[0];

  const allProjects = await db.query.projects.findMany({
    where: and(...projectConditions),
    columns: { id: true },
  });
  const projectIds = allProjects.map((p) => p.id);

  const dueSoonTasks =
    projectIds.length > 0
      ? await db.query.tasks.findMany({
          where: and(
            inArray(tasks.projectId, projectIds),
            gte(tasks.dueDate, todayStr),
            lte(tasks.dueDate, weekStr),
            ne(tasks.status, "done"),
          ),
          with: { project: true, assignee: true },
          limit: 10,
        })
      : [];

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekLater.toISOString().split("T")[0];

  let weeklyHours = 0;
  if (projectIds.length > 0) {
    const hoursResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${timeEntries.hours}::numeric), 0)` })
      .from(timeEntries)
      .innerJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(
        and(
          inArray(tasks.projectId, projectIds),
          gte(timeEntries.date, weekStartStr),
          lte(timeEntries.date, weekEndStr),
        ),
      );
    weeklyHours = Number(hoursResult[0]?.total ?? 0);
  }

  return { activeProjects, dueSoonTasks, weeklyHours };
}

// ─── Team & Invites ──────────────────────────────────────────

export async function getTeamMembers() {
  const user = await requireAuth();
  if (!canManageTeam(user)) return [];

  return db.query.users.findMany({
    where: eq(users.orgId, user.orgId),
    orderBy: [desc(users.createdAt)],
    with: { client: true },
  });
}

export async function getPendingInvitations() {
  const user = await requireAuth();
  if (!canManageTeam(user)) return [];

  return db.query.invitations.findMany({
    where: and(eq(invitations.orgId, user.orgId), sql`${invitations.acceptedAt} IS NULL`),
    orderBy: [desc(invitations.createdAt)],
  });
}

export async function inviteUser(formData: FormData) {
  const user = await requireAuth();
  if (!canManageTeam(user)) return { error: "Unauthorized" };

  const email = formData.get("email") as string;
  const role = formData.get("role") as "team_member" | "client";
  const clientId = (formData.get("clientId") as string) || null;

  if (role === "client" && !clientId) {
    return { error: "Client role requires selecting a client company." };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(invitations).values({
    orgId: user.orgId,
    email,
    role,
    clientId: role === "client" ? clientId : null,
    token,
    expiresAt,
  });

  revalidatePath("/settings");
  return { success: true, inviteLink: `/invite/${token}` };
}

export async function acceptInvite(formData: FormData): Promise<void> {
  const token = formData.get("token") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });

  if (!invite || invite.acceptedAt || new Date() > invite.expiresAt) {
    throw new Error("Invalid or expired invitation.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    orgId: invite.orgId,
    email: invite.email,
    passwordHash,
    name,
    role: invite.role,
    clientId: invite.clientId,
    hourlyRate: invite.role === "team_member" ? "75.00" : "0",
  });

  await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.id, invite.id));

  redirect("/login?invited=true");
}

export async function updateHourlyRate(userId: string, rate: string): Promise<void> {
  const user = await requireAuth();
  if (!canManageTeam(user)) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ hourlyRate: rate })
    .where(and(eq(users.id, userId), eq(users.orgId, user.orgId)));

  revalidatePath("/settings");
}

export async function getInviteByToken(token: string) {
  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });

  if (!invite || invite.acceptedAt || new Date() > invite.expiresAt) return null;
  return invite;
}

export async function getTeamMembersForAssign() {
  const user = await requireAuth();
  if (!canEditData(user)) return [];

  return db.query.users.findMany({
    where: and(eq(users.orgId, user.orgId), inArray(users.role, ["admin", "team_member"])),
  });
}
