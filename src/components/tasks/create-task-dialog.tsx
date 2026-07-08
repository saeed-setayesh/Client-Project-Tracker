"use client";

import { useState, useEffect } from "react";
import { createTask, getTeamMembersForAssign } from "@/actions/app";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput, GlassSelect, GlassTextarea } from "@/components/ui/glass-input";
import { Plus, X } from "lucide-react";

type Member = { id: string; name: string };

export function CreateTaskDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (open) {
      getTeamMembersForAssign().then(setMembers);
    }
  }, [open]);

  if (!open) {
    return (
      <GlassButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Task
      </GlassButton>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Task</h2>
          <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={createTask} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <GlassInput label="Title" name="title" required />
          <GlassTextarea label="Description" name="description" rows={3} />
          <GlassSelect label="Assignee" name="assigneeId" defaultValue="">
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </GlassSelect>
          <GlassInput label="Due Date" name="dueDate" type="date" />
          <div className="flex gap-3">
            <GlassButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" className="flex-1">
              Create Task
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
