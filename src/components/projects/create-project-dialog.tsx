"use client";

import { useState } from "react";
import { createProject } from "@/actions/app";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput, GlassSelect, GlassTextarea } from "@/components/ui/glass-input";
import { Plus, X } from "lucide-react";

export function CreateProjectDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <GlassButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Project
      </GlassButton>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={createProject} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <GlassInput label="Project Name" name="name" required />
          <GlassTextarea label="Description" name="description" rows={3} />
          <GlassSelect label="Status" name="status" defaultValue="planning">
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </GlassSelect>
          <GlassInput label="Budget ($)" name="budget" type="number" min="0" step="100" defaultValue="10000" />
          <GlassInput label="Deadline" name="deadline" type="date" />
          <div className="flex gap-3">
            <GlassButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" className="flex-1">
              Create Project
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
