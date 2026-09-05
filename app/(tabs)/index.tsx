import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/trade";

function getTradeDate(trade: Trade) {
  return new Date(trade.exitTime || trade.entryTime);
}

function formatCompactPnl(value: number) {
  const sign = value >= 0 ? "+" : "-";
  const absolute = Math.abs(value);

  if (absolute >= 1000000) {
    return `${sign}₹${(absolute / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (absolute >= 1000) {
    return `${sign}₹${(absolute / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return `${sign}₹${absolute.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function isToday(date: Date) {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function StatCard({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: typeof Colors.light;
}) {
  return (
    <View style={{ ...styles.statCard, backgroundColor: theme.card }}>
      <Text style={{ ...styles.statLabel, color: theme.textSecondary }}>
        {label}
      </Text>

      <Text style={{ ...styles.statValue, color: theme.text }}>{value}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
  theme,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
  theme: typeof Colors.light;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={{ ...styles.sectionTitle, color: theme.text }}>{title}</Text>

      {action && onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={{ ...styles.sectionAction, color: theme.primary }}>
            {action}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function TradeRow({
  trade,
  theme,
  onPress,
}: {
  trade: Trade;
  theme: typeof Colors.light;
  onPress: () => void;
}) {
  const positive = trade.pnl >= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{
        ...styles.tradeRow,
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View style={styles.tradeLeft}>
        <View
          style={{
            ...styles.directionBadge,
            backgroundColor: positive
              ? theme.primaryLight
              : theme.cardSecondary,
          }}
        >
          <Text
            style={{
              ...styles.directionText,
              color: positive ? theme.primary : theme.textSecondary,
            }}
          >
            {trade.direction}
          </Text>
        </View>

        <View>
          <Text style={{ ...styles.instrument, color: theme.text }}>
            {trade.instrument}
          </Text>

          <Text
            style={{
              ...styles.tradeMeta,
              color: theme.textSecondary,
            }}
          >
            {trade.strategy || "No strategy"}
          </Text>
        </View>
      </View>

      <View style={styles.tradeRight}>
        <Text
          style={{
            ...styles.tradePnl,
            color: positive ? theme.positive : theme.negative,
          }}
        >
          {formatCurrency(trade.pnl)}
        </Text>

        <Text
          style={{
            ...styles.tradeMeta,
            color: theme.textSecondary,
          }}
        >
          {getTradeDate(trade).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { trades, loading } = useTrades();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const stats = useMemo(() => {
    const todayTrades = trades.filter((trade) => isToday(getTradeDate(trade)));

    const todayPnl = todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    const winningTrades = trades.filter((trade) => trade.pnl > 0);
    const losingTrades = trades.filter((trade) => trade.pnl < 0);

    const winRate =
      trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

    return {
      todayPnl,
      todayTrades,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
    };
  }, [trades]);

  const recentTrades = trades.slice(0, 5);

  const monthInfo = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startOffset = firstDay.getDay();

    const pnlByDay: Record<number, number> = {};

    trades.forEach((trade) => {
      const date = getTradeDate(trade);

      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();

        pnlByDay[day] = (pnlByDay[day] || 0) + trade.pnl;
      }
    });

    return {
      monthName: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      daysInMonth,
      startOffset,
      pnlByDay,
    };
  }, [trades]);

  if (loading) {
    return (
      <View
        style={{
          ...styles.loadingContainer,
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ ...styles.loadingText, color: theme.textSecondary }}>
          Loading your journal...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            style={{
              ...styles.eyebrow,
              color: theme.textSecondary,
            }}
          >
            TRADEBOOK
          </Text>

          <Text style={{ ...styles.greeting, color: theme.text }}>
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"} 👋
          </Text>
        </View>

        <View
          style={{
            ...styles.profileCircle,
            backgroundColor: theme.primaryLight,
          }}
        >
          <Text
            style={{
              ...styles.profileText,
              color: theme.primary,
            }}
          >
            T
          </Text>
        </View>
      </View>

      {/* Today's P&L */}
      <View
        style={{
          ...styles.pnlCard,
          backgroundColor: theme.primary,
        }}
      >
        <Text style={styles.pnlLabel}>TODAY'S P&L</Text>

        <Text style={styles.pnlValue}>{formatCurrency(stats.todayPnl)}</Text>

        <Text style={styles.pnlSubtext}>
          {stats.todayTrades.length}{" "}
          {stats.todayTrades.length === 1 ? "trade" : "trades"} today
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
          theme={theme}
        />

        <StatCard
          label="Trades"
          value={String(stats.totalTrades)}
          theme={theme}
        />

        <StatCard
          label="Wins"
          value={String(stats.winningTrades)}
          theme={theme}
        />

        <StatCard
          label="Losses"
          value={String(stats.losingTrades)}
          theme={theme}
        />
      </View>

      {/* Calendar */}
      {/* Calendar */}
      <SectionHeader
        title="P&L Calendar"
        action="View all"
        onPress={() => router.push("/(tabs)/trades")}
        theme={theme}
      />

      <View
        style={{
          ...styles.calendarCard,
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <Text
          style={{
            ...styles.calendarMonth,
            color: theme.text,
          }}
        >
          {monthInfo.monthName}
        </Text>

        <View style={styles.weekRow}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <Text
              key={`${day}-${index}`}
              style={{
                ...styles.weekDay,
                color: theme.textSecondary,
              }}
            >
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {Array.from({
            length: monthInfo.startOffset,
          }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.calendarDay} />
          ))}

          {Array.from({
            length: monthInfo.daysInMonth,
          }).map((_, index) => {
            const day = index + 1;
            const pnl = monthInfo.pnlByDay[day] || 0;
            const hasTrade = monthInfo.pnlByDay[day] !== undefined;

            return (
              <View key={day} style={styles.calendarDay}>
                <View
                  style={{
                    ...styles.dayCell,
                    backgroundColor: hasTrade
                      ? pnl >= 0
                        ? theme.primaryLight
                        : `${theme.negative}18`
                      : "transparent",
                  }}
                >
                  <Text
                    style={{
                      ...styles.dayNumber,
                      color: hasTrade
                        ? pnl >= 0
                          ? theme.positive
                          : theme.negative
                        : theme.textSecondary,
                    }}
                  >
                    {day}
                  </Text>

                  {hasTrade ? (
                    <Text
                      numberOfLines={1}
                      style={{
                        ...styles.dayPnl,
                        color: pnl >= 0 ? theme.positive : theme.negative,
                      }}
                    >
                      {formatCompactPnl(pnl)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Insight */}
      <SectionHeader title="Today's Insight" theme={theme} />

      <View
        style={{
          ...styles.insightCard,
          backgroundColor: theme.cardSecondary,
        }}
      >
        <Text style={{ ...styles.insightEmoji }}>💡</Text>

        <View style={styles.insightContent}>
          <Text style={{ ...styles.insightTitle, color: theme.text }}>
            {trades.length === 0
              ? "Start your trading journal"
              : stats.todayTrades.length === 0
                ? "No trades today"
                : stats.todayPnl >= 0
                  ? "You're starting the day in profit"
                  : "Keep your process tight"}
          </Text>

          <Text
            style={{
              ...styles.insightText,
              color: theme.textSecondary,
            }}
          >
            {trades.length === 0
              ? "Log your first trade and TradeBook will start learning your trading behavior."
              : stats.todayTrades.length === 0
                ? "Use the Add Trade button whenever you take a position."
                : "Focus on following your plan rather than chasing the P&L."}
          </Text>
        </View>
      </View>

      {/* Recent Trades */}
      <SectionHeader
        title="Recent Trades"
        action={recentTrades.length > 0 ? "View all" : undefined}
        onPress={
          recentTrades.length > 0
            ? () => router.push("/(tabs)/trades")
            : undefined
        }
        theme={theme}
      />

      {recentTrades.length === 0 ? (
        <View
          style={{
            ...styles.emptyCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <Text style={{ ...styles.emptyEmoji }}>📈</Text>

          <Text style={{ ...styles.emptyTitle, color: theme.text }}>
            No trades yet
          </Text>

          <Text
            style={{
              ...styles.emptyText,
              color: theme.textSecondary,
            }}
          >
            Your recent trades will appear here.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/add")}
            style={{
              ...styles.emptyButton,
              backgroundColor: theme.primary,
            }}
          >
            <Text style={styles.emptyButtonText}>Add your first trade</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentTrades.map((trade) => (
          <TradeRow
            key={trade.id}
            trade={trade}
            theme={theme}
            onPress={() =>
              router.push({
                pathname: "/trade/[id]",
                params: { id: trade.id },
              })
            }
          />
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = {
  container: {
    padding: 20,
    paddingTop: 58,
  } satisfies ViewStyle,

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  loadingText: {
    fontSize: 14,
  } satisfies TextStyle,

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  } satisfies ViewStyle,

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 4,
  } satisfies TextStyle,

  greeting: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  } satisfies TextStyle,

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  profileText: {
    fontSize: 17,
    fontWeight: "800",
  } satisfies TextStyle,

  pnlCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  } satisfies ViewStyle,

  pnlLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  } satisfies TextStyle,

  pnlValue: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 7,
    letterSpacing: -1,
  } satisfies TextStyle,

  pnlSubtext: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    marginTop: 5,
  } satisfies TextStyle,

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  } satisfies ViewStyle,

  statCard: {
    width: "48%",
    minHeight: 82,
    borderRadius: 18,
    padding: 16,
    justifyContent: "space-between",
  } satisfies ViewStyle,

  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  } satisfies TextStyle,

  statValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  } satisfies TextStyle,

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  } satisfies ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  } satisfies TextStyle,

  sectionAction: {
    fontSize: 13,
    fontWeight: "700",
  } satisfies TextStyle,

  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 26,
  } satisfies ViewStyle,

  calendarMonth: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 16,
  } satisfies TextStyle,

  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  } satisfies ViewStyle,

  weekDay: {
    width: "14.2857%",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  } satisfies TextStyle,

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  } satisfies ViewStyle,

  calendarDay: {
    width: "14.2857%",
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  dayCell: {
    width: 46,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  } satisfies ViewStyle,

  dayNumber: {
    fontSize: 13,
    fontWeight: "800",
  } satisfies TextStyle,

  dayPnl: {
    fontSize: 8,
    fontWeight: "800",
    marginTop: 3,
  } satisfies TextStyle,

  insightCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
  } satisfies ViewStyle,

  insightEmoji: {
    fontSize: 24,
    marginRight: 14,
  } satisfies TextStyle,

  insightContent: {
    flex: 1,
  } satisfies ViewStyle,

  insightTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  } satisfies TextStyle,

  insightText: {
    fontSize: 13,
    lineHeight: 19,
  } satisfies TextStyle,

  tradeRow: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  } satisfies ViewStyle,

  tradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } satisfies ViewStyle,

  directionBadge: {
    width: 54,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  } satisfies ViewStyle,

  directionText: {
    fontSize: 10,
    fontWeight: "800",
  } satisfies TextStyle,

  instrument: {
    fontSize: 15,
    fontWeight: "800",
  } satisfies TextStyle,

  tradeMeta: {
    fontSize: 11,
    marginTop: 3,
  } satisfies TextStyle,

  tradeRight: {
    alignItems: "flex-end",
  } satisfies ViewStyle,

  tradePnl: {
    fontSize: 15,
    fontWeight: "800",
  } satisfies TextStyle,

  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  } satisfies ViewStyle,

  emptyEmoji: {
    fontSize: 30,
    marginBottom: 10,
  } satisfies TextStyle,

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
  } satisfies TextStyle,

  emptyText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 18,
  } satisfies TextStyle,

  emptyButton: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  } satisfies ViewStyle,

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  } satisfies TextStyle,
};
