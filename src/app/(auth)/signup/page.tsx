import { signupAction } from "@/actions/signup";
import { hasExistingOrganization } from "@/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Briefcase } from "lucide-react";

export default async function SignupPage() {
  const hasOrg = await hasExistingOrganization();
  if (hasOrg) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your agency</h1>
          <p className="mt-1 text-sm text-white/50">Set up your workspace and admin account</p>
        </div>

        <GlassCard>
          <form action={signupAction} className="space-y-4">
            <GlassInput label="Agency Name" name="orgName" required placeholder="Acme Digital" />
            <GlassInput label="Your Name" name="name" required placeholder="Jane Doe" />
            <GlassInput label="Email" name="email" type="email" required placeholder="admin@agency.com" />
            <GlassInput label="Password" name="password" type="password" required minLength={8} placeholder="••••••••" />
            <GlassButton type="submit" className="w-full">
              Create Agency
            </GlassButton>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
