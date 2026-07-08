import { getTeamMembers, getPendingInvitations, getClients } from "@/actions/app";
import { requireAuth } from "@/lib/session";
import { canManageTeam } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const user = await requireAuth();
  if (!canManageTeam(user)) redirect("/");

  const [members, invitations, clients] = await Promise.all([
    getTeamMembers(),
    getPendingInvitations(),
    getClients(),
  ]);

  return (
    <SettingsView
      members={members}
      invitations={invitations}
      clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
    />
  );
}
