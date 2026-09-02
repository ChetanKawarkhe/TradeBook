import type { TradeDirection } from "@/types/trade";

export function calculatePnl(
  direction: TradeDirection,
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fees = 0
): number {
  const grossPnl =
    direction === "LONG"
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;

  return grossPnl - fees;
}

export function formatCurrency(value: number): string {
  const sign = value >= 0 ? "+" : "-";

  return `${sign}₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}