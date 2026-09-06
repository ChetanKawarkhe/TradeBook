import type { Trade } from "@/types/trade";

export type TradeQuality = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  label: string;
  reasons: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function calculateTradeQuality(
  trade: Trade
): TradeQuality {
  let score = 50;
  const reasons: string[] = [];

  // Plan adherence
  if (trade.followedPlan) {
    score += 20;
    reasons.push("Followed the trading plan");
  } else {
    score -= 20;
    reasons.push("Did not follow the trading plan");
  }

  // Outcome is intentionally given a small influence.
  // Quality should primarily measure execution, not whether
  // the trade happened to win or lose.
  if (trade.pnl > 0) {
    score += 5;
  } else if (trade.pnl < 0) {
    score -= 5;
  }

  // Documentation
  if (trade.strategy.trim().length > 0) {
    score += 8;
    reasons.push("Setup/strategy was documented");
  } else {
    score -= 5;
  }

  if (trade.emotion.trim().length > 0) {
    score += 5;
    reasons.push("Emotional state was documented");
  }

  if (trade.notes.trim().length > 0) {
    score += 5;
    reasons.push("Trade notes were recorded");
  }

  // Risk/reward proxy from actual outcome.
  // This does not pretend to know planned risk because the
  // current Trade model does not contain a stop-loss field.
  if (trade.pnl > 0) {
    score += 3;
  }

  score = Math.round(clamp(score));

  let grade: TradeQuality["grade"];
  let label: string;

  if (score >= 85) {
    grade = "A";
    label = "Excellent execution";
  } else if (score >= 70) {
    grade = "B";
    label = "Good execution";
  } else if (score >= 55) {
    grade = "C";
    label = "Average execution";
  } else {
    grade = "D";
    label = "Needs improvement";
  }

  return {
    score,
    grade,
    label,
    reasons: reasons.slice(0, 4),
  };
}