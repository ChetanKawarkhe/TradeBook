import type { Trade } from "@/types/trade";

export type TraderScore = {
  overall: number;
  planAdherence: number;
  performance: number;
  consistency: number;
  journaling: number;
  tradesCount: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function calculateTraderScore(
  trades: Trade[]
): TraderScore {
  if (trades.length === 0) {
    return {
      overall: 0,
      planAdherence: 0,
      performance: 0,
      consistency: 0,
      journaling: 0,
      tradesCount: 0,
    };
  }

  // --------------------------------
  // 1. Plan Adherence — 40%
  // --------------------------------
  const followedPlanCount = trades.filter(
    (trade) => trade.followedPlan
  ).length;

  const planAdherence = clamp(
    (followedPlanCount / trades.length) * 100
  );

  // --------------------------------
  // 2. Performance — 25%
  // --------------------------------
  const winningTrades = trades.filter(
    (trade) => trade.pnl > 0
  );

  const losingTrades = trades.filter(
    (trade) => trade.pnl < 0
  );

  const totalWins = winningTrades.reduce(
    (sum, trade) => sum + trade.pnl,
    0
  );

  const totalLosses = Math.abs(
    losingTrades.reduce(
      (sum, trade) => sum + trade.pnl,
      0
    )
  );

  let performance = 50;

  if (totalLosses === 0 && totalWins > 0) {
    performance = 100;
  } else if (totalLosses > 0) {
    const profitFactor = totalWins / totalLosses;

    performance = clamp(
      50 + (profitFactor - 1) * 30
    );
  }

  // --------------------------------
  // 3. Consistency — 20%
  // --------------------------------
  const winRate =
    trades.length > 0
      ? (winningTrades.length / trades.length) * 100
      : 0;

  const consistency = clamp(
    winRate * 0.7 +
      planAdherence * 0.3
  );

  // --------------------------------
  // 4. Journaling — 15%
  // --------------------------------
  const documentedTrades = trades.filter(
    (trade) =>
      trade.notes.trim().length > 0 ||
      trade.emotion.trim().length > 0 ||
      trade.strategy.trim().length > 0
  ).length;

  const journaling = clamp(
    (documentedTrades / trades.length) * 100
  );

  // --------------------------------
  // Overall Score
  // --------------------------------
  const overall = Math.round(
    planAdherence * 0.4 +
      performance * 0.25 +
      consistency * 0.2 +
      journaling * 0.15
  );

  return {
    overall: clamp(Math.round(overall)),
    planAdherence: Math.round(planAdherence),
    performance: Math.round(performance),
    consistency: Math.round(consistency),
    journaling: Math.round(journaling),
    tradesCount: trades.length,
  };
}