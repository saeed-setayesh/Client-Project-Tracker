import { describe, it, expect } from "vitest";
import { calculateBudgetProgress, formatCurrency } from "@/lib/budget";

describe("calculateBudgetProgress", () => {
  it("returns green when under 80%", () => {
    const result = calculateBudgetProgress(10000, 5000);
    expect(result.percent).toBe(50);
    expect(result.color).toBe("green");
  });

  it("returns yellow when between 80% and 100%", () => {
    const result = calculateBudgetProgress(10000, 8500);
    expect(result.percent).toBe(85);
    expect(result.color).toBe("yellow");
  });

  it("returns red when over budget", () => {
    const result = calculateBudgetProgress(10000, 12000);
    expect(result.color).toBe("red");
  });

  it("handles zero budget", () => {
    const result = calculateBudgetProgress(0, 500);
    expect(result.percent).toBe(0);
    expect(result.color).toBe("green");
  });
});

describe("formatCurrency", () => {
  it("formats USD amounts", () => {
    expect(formatCurrency(10000)).toBe("$10,000");
  });
});
