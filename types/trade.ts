export type TradeDirection = "LONG" | "SHORT";

export type Trade = {
  id: string;

  // Core trade
  instrument: string;
  direction: TradeDirection;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  fees: number;
  pnl: number;

  // Trade context
  strategy: string;
  setup?: string;
  entryReason?: string;
  exitReason?: string;

  // Psychology
  emotion: string;
  emotionBefore?: string;
  emotionDuring?: string;
  emotionAfter?: string;
  confidence?: number;
  stress?: number;
  fomo?: number;

  // Discipline
  followedPlan: boolean;
  ruleViolation?: string;
  mistake?: string;

  // Risk / reward
  riskReward?: number;

  // Notes
  notes: string;

  // Timing
  entryTime: string;
  exitTime: string;
};