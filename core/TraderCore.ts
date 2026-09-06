import type { Trade } from "@/types/trade";

export type TradeQualityGrade = "A" | "B" | "C" | "D";

export type TradeEvaluation = {
  score: number;
  grade: TradeQualityGrade;
  label: string;

  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  outcomeType: "GOOD WIN" | "BAD WIN" | "GOOD LOSS" | "BAD LOSS" | "BREAKEVEN";

  followedPlan: boolean;

  strengths: string[];
  warnings: string[];
  reasons: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getGrade(score: number): TradeQualityGrade {
  if (score >= 90) {
    return "A";
  }

  if (score >= 75) {
    return "B";
  }

  if (score >= 60) {
    return "C";
  }

  return "D";
}

function getLabel(grade: TradeQualityGrade) {
  switch (grade) {
    case "A":
      return "Excellent execution";

    case "B":
      return "Good execution";

    case "C":
      return "Average execution";

    case "D":
      return "Needs improvement";
  }
}

function getOutcome(trade: Trade): TradeEvaluation["outcome"] {
  if (trade.pnl > 0) {
    return "WIN";
  }

  if (trade.pnl < 0) {
    return "LOSS";
  }

  return "BREAKEVEN";
}

function getOutcomeType(
  trade: Trade,
): TradeEvaluation["outcomeType"] {
  if (trade.pnl === 0) {
    return "BREAKEVEN";
  }

  if (trade.pnl > 0) {
    return trade.followedPlan ? "GOOD WIN" : "BAD WIN";
  }

  return trade.followedPlan ? "GOOD LOSS" : "BAD LOSS";
}

export function evaluateTrade(trade: Trade): TradeEvaluation {
  let score = 50;

  const strengths: string[] = [];
  const warnings: string[] = [];
  const reasons: string[] = [];

  /*
   * DISCIPLINE
   *
   * Following the plan is the most important factor
   * in the first version of TraderCore.
   */
  if (trade.followedPlan) {
    score += 25;

    strengths.push("Followed your trading plan");
    reasons.push("Plan was followed");
  } else {
    score -= 20;

    warnings.push("Trade deviated from your plan");

    if (trade.ruleViolation) {
      reasons.push(`Rule violation: ${trade.ruleViolation}`);
    } else {
      reasons.push("Plan was not followed");
    }
  }

  /*
   * STRATEGY
   */
  if (trade.strategy.trim().length > 0) {
    score += 5;

    strengths.push("Strategy was identified");
    reasons.push("Strategy was recorded");
  } else {
    warnings.push("No strategy was recorded");
  }

  /*
   * SETUP
   */
  if (trade.setup && trade.setup.trim().length > 0) {
    score += 5;

    strengths.push("Setup was identified");
  }

  /*
   * ENTRY REASON
   */
  if (trade.entryReason && trade.entryReason.trim().length > 0) {
    score += 5;

    strengths.push("Entry reasoning was documented");
  }

  /*
   * EXIT REASON
   */
  if (trade.exitReason && trade.exitReason.trim().length > 0) {
    score += 5;

    strengths.push("Exit reasoning was documented");
  }

  /*
   * NOTES
   */
  if (trade.notes.trim().length > 0) {
    score += 5;

    strengths.push("Trade notes were recorded");
  }

  /*
   * RISK / REWARD
   */
  if (
    typeof trade.riskReward === "number" &&
    Number.isFinite(trade.riskReward)
  ) {
    if (trade.riskReward >= 2) {
      score += 5;

      strengths.push("Risk/reward was favorable");
    } else if (trade.riskReward < 1) {
      score -= 5;

      warnings.push("Risk/reward was below 1:1");
    }
  }

  /*
   * PSYCHOLOGY
   *
   * High FOMO or stress can indicate lower-quality
   * decision making.
   */
  if (
    typeof trade.fomo === "number" &&
    Number.isFinite(trade.fomo)
  ) {
    if (trade.fomo >= 8) {
      score -= 10;

      warnings.push("High FOMO was present");
    } else if (trade.fomo <= 3) {
      score += 3;

      strengths.push("Low FOMO");
    }
  }

  if (
    typeof trade.stress === "number" &&
    Number.isFinite(trade.stress)
  ) {
    if (trade.stress >= 8) {
      score -= 8;

      warnings.push("High stress was present");
    } else if (trade.stress <= 3) {
      score += 2;

      strengths.push("Stress was controlled");
    }
  }

  /*
   * CONFIDENCE
   *
   * Extremely low confidence may indicate hesitation.
   * Extremely high confidence can indicate overconfidence.
   */
  if (
    typeof trade.confidence === "number" &&
    Number.isFinite(trade.confidence)
  ) {
    if (trade.confidence >= 4 && trade.confidence <= 8) {
      score += 3;

      strengths.push("Confidence was balanced");
    }

    if (trade.confidence >= 9) {
      score -= 3;

      warnings.push("Very high confidence may indicate overconfidence");
    }

    if (trade.confidence <= 2) {
      score -= 3;

      warnings.push("Very low confidence was recorded");
    }
  }

  /*
   * MISTAKE
   */
  if (trade.mistake && trade.mistake.trim().length > 0) {
    warnings.push(`Mistake recorded: ${trade.mistake}`);
  }

  /*
   * FINAL SCORE
   */
  score = Math.round(clamp(score, 0, 100));

  const grade = getGrade(score);
  const label = getLabel(grade);

  return {
    score,
    grade,
    label,
    outcome: getOutcome(trade),
    outcomeType: getOutcomeType(trade),
    followedPlan: trade.followedPlan,
    strengths,
    warnings,
    reasons,
  };
}