export function calculateBudgetProgress(budget: number, actualCost: number) {
  if (budget <= 0) {
    return { percent: 0, color: "green" as const, actualCost, budget };
  }

  const percent = (actualCost / budget) * 100;
  let color: "green" | "yellow" | "red" = "green";

  if (percent >= 100) color = "red";
  else if (percent >= 80) color = "yellow";

  return { percent: Math.min(percent, 150), color, actualCost, budget };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
