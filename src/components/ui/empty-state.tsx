import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
        <span className="text-2xl">📋</span>
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-white/50">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
