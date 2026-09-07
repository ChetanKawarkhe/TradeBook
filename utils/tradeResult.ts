import type { Trade } from "@/types/trade";

export type TradeResultType =
  | "Good Win"
  | "Bad Win"
  | "Good Loss"
  | "Bad Loss"
  | "Breakeven";

export function getTradeResultType(trade: Trade): TradeResultType {
  if (trade.pnl === 0) {
    return "Breakeven";
  }

  if (trade.pnl > 0) {
    return trade.followedPlan ? "Good Win" : "Bad Win";
  }

  return trade.followedPlan ? "Good Loss" : "Bad Loss";
}