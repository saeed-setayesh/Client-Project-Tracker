import { getTask } from "@/actions/app";
import { requireAuth } from "@/lib/session";
import { notFound } from "next/navigation";
import { TaskDetailView } from "@/components/tasks/task-detail-view";
import {
  canEditData,
  canLogTime,
  canViewInternalComments,
} from "@/lib/permissions";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const task = await getTask(id);

  if (!task) notFound();

  return (
    <TaskDetailView
      task={task}
      canEdit={canEditData(user)}
      canLogTime={canLogTime(user)}
      canSeeInternal={canViewInternalComments(user)}
    />
  );
}
