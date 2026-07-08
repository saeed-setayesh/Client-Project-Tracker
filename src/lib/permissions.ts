import type { UserRole } from "@/db/schema";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  clientId: string | null;
};

export function isAdmin(user: SessionUser) {
  return user.role === "admin";
}

export function isTeamMember(user: SessionUser) {
  return user.role === "team_member";
}

export function isClient(user: SessionUser) {
  return user.role === "client";
}

export function canManageTeam(user: SessionUser) {
  return user.role === "admin";
}

export function canEditData(user: SessionUser) {
  return user.role === "admin" || user.role === "team_member";
}

export function canViewInternalComments(user: SessionUser) {
  return user.role === "admin" || user.role === "team_member";
}

export function canLogTime(user: SessionUser) {
  return user.role === "admin" || user.role === "team_member";
}

export function canAccessClientsList(user: SessionUser) {
  return user.role === "admin" || user.role === "team_member";
}

export function canAccessProject(
  user: SessionUser,
  project: { orgId: string; clientId: string },
) {
  if (project.orgId !== user.orgId) return false;
  if (user.role === "client") {
    return user.clientId === project.clientId;
  }
  return true;
}
