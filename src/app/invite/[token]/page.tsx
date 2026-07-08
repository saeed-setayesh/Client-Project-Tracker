import { getInviteByToken, acceptInvite } from "@/actions/app";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Briefcase } from "lucide-react";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join the team</h1>
          <p className="mt-1 text-sm text-white/50">
            You&apos;ve been invited as <span className="text-cyan-400 capitalize">{invite.role.replace("_", " ")}</span>
          </p>
        </div>

        <GlassCard>
          <form action={acceptInvite} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <GlassInput label="Email" value={invite.email} disabled />
            <GlassInput label="Your Name" name="name" required placeholder="Your full name" />
            <GlassInput label="Password" name="password" type="password" required minLength={8} placeholder="••••••••" />
            <GlassButton type="submit" className="w-full">
              Accept Invitation
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
