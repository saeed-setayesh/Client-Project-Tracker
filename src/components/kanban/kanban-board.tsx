"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { updateTaskStatus } from "@/actions/app";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { TaskStatus } from "@/db/schema";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  position: number;
  dueDate: string | null;
  assignee: { name: string } | null;
};

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-xl border border-white/10 bg-white/5 p-3 active:cursor-grabbing"
    >
      <Link href={`/tasks/${task.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium text-white">{task.title}</p>
        {task.assignee && (
          <p className="mt-1 text-xs text-white/50">{task.assignee.name}</p>
        )}
        {task.dueDate && (
          <p className="mt-1 text-xs text-white/40">Due {formatDate(task.dueDate)}</p>
        )}
      </Link>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-sm font-medium text-white">{task.title}</p>
    </div>
  );
}

export function KanbanBoard({ tasks, readOnly = false }: { tasks: Task[]; readOnly?: boolean }) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    if (readOnly) return;

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    let newStatus = task.status;
    const overId = over.id as string;

    if (columns.some((c) => c.id === overId)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = localTasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus === task.status && overId === taskId) return;

    const columnTasks = localTasks.filter((t) => t.status === newStatus && t.id !== taskId);
    const overIndex = columnTasks.findIndex((t) => t.id === overId);
    const newPosition = overIndex >= 0 ? overIndex : columnTasks.length;

    const updated = localTasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t,
    );
    setLocalTasks(updated);

    await updateTaskStatus(taskId, newStatus, newPosition);
  }

  if (readOnly) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const colTasks = localTasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white/70">{col.title}</h3>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
                  >
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <StatusBadge status={task.status} type="task" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const colTasks = localTasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div
              key={col.id}
              id={col.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
                {col.title}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{colTasks.length}</span>
              </h3>
              <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="min-h-[200px] space-y-2">
                  {colTasks.map((task) => (
                    <SortableTask key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
