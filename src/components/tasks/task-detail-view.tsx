"use client";

import { useRef } from "react";
import { addComment, addTimeEntry, updateTaskStatusField } from "@/actions/app";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput, GlassSelect, GlassTextarea } from "@/components/ui/glass-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatHours } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Clock } from "lucide-react";
import type { TaskStatus } from "@/db/schema";

type TaskData = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  project: { id: string; name: string };
  assignee: { name: string } | null;
  comments: {
    id: string;
    body: string;
    isInternal: boolean;
    createdAt: Date;
    user: { name: string; role: string };
  }[];
  timeEntries: {
    id: string;
    hours: string;
    date: string;
    billable: boolean;
    note: string | null;
    user: { name: string };
  }[];
};

export function TaskDetailView({
  task,
  canEdit,
  canLogTime,
  canSeeInternal,
}: {
  task: TaskData;
  canEdit: boolean;
  canLogTime: boolean;
  canSeeInternal: boolean;
}) {
  const commentRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/projects/${task.project.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {task.project.name}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{task.title}</h1>
            {task.description && (
              <p className="mt-2 max-w-2xl text-white/60">{task.description}</p>
            )}
          </div>
          <StatusBadge status={task.status} type="task" />
        </div>

        <div className="mt-4 flex gap-6 text-sm text-white/50">
          {task.assignee && <span>Assignee: {task.assignee.name}</span>}
          {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
        </div>

        {canEdit && (
          <form action={updateTaskStatusField} className="mt-4">
            <input type="hidden" name="taskId" value={task.id} />
            <GlassSelect label="Update Status" name="status" defaultValue={task.status}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </GlassSelect>
            <GlassButton type="submit" variant="secondary" className="mt-2">
              Update Status
            </GlassButton>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Comments</h2>
          </div>

          <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
            {task.comments.length === 0 ? (
              <p className="text-sm text-white/50">No comments yet.</p>
            ) : (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-white/5 bg-white/5 p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{comment.user.name}</span>
                    {comment.isInternal && canSeeInternal && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                        Internal
                      </span>
                    )}
                    <span className="text-xs text-white/40">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{comment.body}</p>
                </div>
              ))
            )}
          </div>

          <form
            ref={commentRef}
            action={async (formData) => {
              await addComment(formData);
              commentRef.current?.reset();
            }}
            className="space-y-3"
          >
            <input type="hidden" name="taskId" value={task.id} />
            <GlassTextarea name="body" placeholder="Write a comment..." rows={2} required />
            {canSeeInternal && (
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input type="checkbox" name="isInternal" value="true" className="rounded" />
                Internal note (hidden from clients)
              </label>
            )}
            <GlassButton type="submit" variant="secondary">
              Post Comment
            </GlassButton>
          </form>
        </div>

        {canLogTime ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Time Entries</h2>
            </div>

            <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
              {task.timeEntries.length === 0 ? (
                <p className="text-sm text-white/50">No time logged yet.</p>
              ) : (
                task.timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
                  >
                    <div>
                      <p className="text-sm text-white">{entry.user.name}</p>
                      <p className="text-xs text-white/50">{formatDate(entry.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatHours(entry.hours)}</p>
                      {entry.billable && (
                        <span className="text-xs text-emerald-400">Billable</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form action={addTimeEntry} className="space-y-3">
              <input type="hidden" name="taskId" value={task.id} />
              <div className="grid grid-cols-2 gap-3">
                <GlassInput label="Hours" name="hours" type="number" step="0.25" min="0.25" required />
                <GlassInput
                  label="Date"
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <GlassInput label="Note" name="note" placeholder="What did you work on?" />
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input type="checkbox" name="billable" value="true" defaultChecked className="rounded" />
                Billable
              </label>
              <GlassButton type="submit" variant="secondary">
                Log Time
              </GlassButton>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">Status</h2>
            <p className="mt-2 text-sm text-white/60">
              This task is currently <StatusBadge status={task.status} type="task" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
