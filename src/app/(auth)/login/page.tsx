"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Briefcase } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const invited = searchParams.get("invited");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to your agency workspace</p>
        </div>

        <GlassCard>
          {registered && (
            <p className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              Account created! Please sign in.
            </p>
          )}
          {invited && (
            <p className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              Invitation accepted! Please sign in.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput label="Email" name="email" type="email" required placeholder="you@agency.com" />
            <GlassInput label="Password" name="password" type="password" required placeholder="••••••••" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <GlassButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </GlassButton>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            First time?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">
              Create agency
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
