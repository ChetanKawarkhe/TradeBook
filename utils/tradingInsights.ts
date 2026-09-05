import type { Trade } from "@/types/trade";

export type TradingInsight = {
  title: string;
  message: string;
  type: "positive" | "warning" | "neutral";
};

export function generateTradingInsights(
  trades: Trade[]
): TradingInsight[] {
  if (trades.length === 0) {
    return [
      {
        title: "Start building your journal",
        message:
          "Add your first trade to start discovering patterns in your trading.",
        type: "neutral",
      },
    ];
  }

  const insights: TradingInsight[] = [];

  const wins = trades.filter((trade) => trade.pnl > 0);
  const losses = trades.filter((trade) => trade.pnl < 0);

  const totalWins = wins.reduce(
    (sum, trade) => sum + trade.pnl,
    0
  );

  const totalLosses = Math.abs(
    losses.reduce((sum, trade) => sum + trade.pnl, 0)
  );

  const winRate =
    (wins.length / trades.length) * 100;

  const planAdherence =
    (trades.filter((trade) => trade.followedPlan).length /
      trades.length) *
    100;

  const documentedTrades = trades.filter(
    (trade) =>
      trade.notes.trim().length > 0 ||
      trade.emotion.trim().length > 0 ||
      trade.strategy.trim().length > 0
  ).length;

  const documentationRate =
    (documentedTrades / trades.length) * 100;

  const averageWin =
    wins.length > 0
      ? totalWins / wins.length
      : 0;

  const averageLoss =
    losses.length > 0
      ? totalLosses / losses.length
      : 0;

  // Plan adherence
  if (planAdherence >= 80) {
    insights.push({
      title: "Strong discipline",
      message: `You followed your trading plan on ${Math.round(
        planAdherence
      )}% of trades. Protect this habit.`,
      type: "positive",
    });
  } else if (planAdherence < 60) {
    insights.push({
      title: "Plan adherence needs work",
      message: `Only ${Math.round(
        planAdherence
      )}% of trades followed your plan. Focus on execution before increasing activity.`,
      type: "warning",
    });
  }

  // Win/loss relationship
  if (
    averageWin > averageLoss &&
    wins.length > 0 &&
    losses.length > 0
  ) {
    insights.push({
      title: "Healthy risk-reward",
      message:
        "Your average winning trade is larger than your average losing trade.",
      type: "positive",
    });
  } else if (
    averageLoss > averageWin &&
    wins.length > 0 &&
    losses.length > 0
  ) {
    insights.push({
      title: "Losses are getting expensive",
      message:
        "Your average losing trade is larger than your average winning trade. Review your exits and risk control.",
      type: "warning",
    });
  }

  // Win rate
  if (winRate >= 60) {
    insights.push({
      title: "Strong win rate",
      message: `Your current win rate is ${Math.round(
        winRate
      )}%. Make sure the quality of your wins remains consistent.`,
      type: "positive",
    });
  } else if (
    winRate < 40 &&
    trades.length >= 5
  ) {
    insights.push({
      title: "Win rate is low",
      message:
        "Review your setups and identify which conditions are producing your best trades.",
      type: "warning",
    });
  }

  // Documentation
  if (documentationRate < 50) {
    insights.push({
      title: "Document more trades",
      message:
        "Adding emotions, strategies and notes will help uncover behavioral patterns.",
      type: "warning",
    });
  } else if (documentationRate >= 80) {
    insights.push({
      title: "Great journaling habit",
      message:
        "Most of your trades contain useful context. This makes your analytics much more valuable.",
      type: "positive",
    });
  }

  // Fallback
  if (insights.length === 0) {
    insights.push({
      title: "Keep building your sample",
      message:
        "Your trading data is still developing. Keep logging consistently to reveal stronger patterns.",
      type: "neutral",
    });
  }

  return insights.slice(0, 3);
}