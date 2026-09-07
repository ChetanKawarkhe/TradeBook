import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { Trade } from "@/types/trade";

const STORAGE_KEY = "@tradebook/trades";

type TradeContextType = {
  trades: Trade[];
  loading: boolean;
  addTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  replaceTrades: (trades: Trade[]) => Promise<void>;
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  async function loadTrades() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setTrades(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load trades:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addTrade(trade: Trade) {
    const updated = [trade, ...trades];

    setTrades(updated);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function deleteTrade(id: string) {
    const updated = trades.filter((trade) => trade.id !== id);

    setTrades(updated);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function replaceTrades(restoredTrades: Trade[]) {
    setTrades(restoredTrades);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(restoredTrades));
  }

  return (
    <TradeContext.Provider
      value={{
        trades,
        loading,
        addTrade,
        deleteTrade,
        replaceTrades,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);

  if (!context) {
    throw new Error("useTrades must be used inside TradeProvider");
  }

  return context;
}
