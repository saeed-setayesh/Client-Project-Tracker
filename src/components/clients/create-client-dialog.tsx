"use client";

import { useState } from "react";
import { createClient } from "@/actions/app";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Plus, X } from "lucide-react";

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <GlassButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Client
      </GlassButton>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Client</h2>
          <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={createClient} className="space-y-4">
          <GlassInput label="Company Name" name="companyName" required />
          <GlassInput label="Contact Name" name="contactName" required />
          <GlassInput label="Email" name="email" type="email" required />
          <GlassInput label="Phone" name="phone" type="tel" />
          <div className="flex gap-3">
            <GlassButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" className="flex-1">
              Create Client
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
