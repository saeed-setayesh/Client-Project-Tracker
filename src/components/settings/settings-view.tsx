"use client";

import { useState } from "react";
import { inviteUser, updateHourlyRate } from "@/actions/app";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput, GlassSelect } from "@/components/ui/glass-input";
import { GlassCard } from "@/components/ui/glass-card";
import { UserPlus, Copy, Check } from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: string | null;
  client: { companyName: string } | null;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
};

type ClientOption = { id: string; companyName: string };

export function SettingsView({
  members,
  invitations,
  clients,
}: {
  members: Member[];
  invitations: Invitation[];
  clients: ClientOption[];
}) {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState("team_member");

  async function handleInvite(formData: FormData) {
    const result = await inviteUser(formData);
    if (result?.inviteLink) {
      setInviteLink(`${window.location.origin}${result.inviteLink}`);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-white/50">Manage your team and invitations</p>
      </div>

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Invite Team Member</h2>
        </div>

        <form action={handleInvite} className="space-y-4">
          <GlassInput label="Email" name="email" type="email" required placeholder="new@agency.com" />
          <GlassSelect
            label="Role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="team_member">Team Member</option>
            <option value="client">Client</option>
          </GlassSelect>
          {role === "client" && (
            <GlassSelect label="Client Company" name="clientId" required>
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </GlassSelect>
          )}
          <GlassButton type="submit">Send Invitation</GlassButton>
        </form>

        {inviteLink && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 bg-transparent text-sm text-white/80 outline-none"
            />
            <button onClick={copyLink} className="text-white/60 hover:text-white">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </GlassCard>

      {invitations.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-white">Pending Invitations</h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
              >
                <div>
                  <p className="text-sm text-white">{inv.email}</p>
                  <p className="text-xs capitalize text-white/50">{inv.role.replace("_", " ")}</p>
                </div>
                <p className="text-xs text-white/40">
                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">Team Members</h2>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
            >
              <div>
                <p className="font-medium text-white">{member.name}</p>
                <p className="text-sm text-white/50">{member.email}</p>
                <p className="text-xs capitalize text-white/40">
                  {member.role.replace("_", " ")}
                  {member.client && ` · ${member.client.companyName}`}
                </p>
              </div>
              {member.role !== "client" && (
                <form
                  action={async (formData) => {
                    await updateHourlyRate(member.id, formData.get("rate") as string);
                  }}
                  className="flex items-center gap-2"
                >
                  <GlassInput
                    name="rate"
                    type="number"
                    defaultValue={member.hourlyRate ?? "75"}
                    className="w-24"
                  />
                  <span className="text-sm text-white/50">$/hr</span>
                  <GlassButton type="submit" variant="ghost" className="text-xs">
                    Save
                  </GlassButton>
                </form>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
