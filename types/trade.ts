export type TradeDirection = "LONG" | "SHORT";

export type Trade = {
  id: string;

  instrument: string;
  direction: TradeDirection;

  quantity: number;
  entryPrice: number;
  exitPrice: number;

  fees: number;
  pnl: number;

  strategy: string;
  emotion: string;

  followedPlan: boolean;

  notes: string;

  entryTime: string;
  exitTime: string;
};