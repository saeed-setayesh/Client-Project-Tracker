import { calculateBudgetProgress, formatCurrency } from "@/lib/budget";
import { cn } from "@/lib/utils";

export function BudgetBar({
  budget,
  actualCost,
  showLabels = true,
}: {
  budget: number;
  actualCost: number;
  showLabels?: boolean;
}) {
  const { percent, color } = calculateBudgetProgress(budget, actualCost);

  const barColor = {
    green: "bg-emerald-400",
    yellow: "bg-amber-400",
    red: "bg-red-500",
  }[color];

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span className="text-white/60">
            Spent: <span className="text-white">{formatCurrency(actualCost)}</span>
          </span>
          <span className="text-white/60">
            Budget: <span className="text-white">{formatCurrency(budget)}</span>
          </span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="text-xs text-white/50">
        {percent.toFixed(0)}% of budget used
        {color === "red" && " — over budget!"}
      </p>
    </div>
  );
}
