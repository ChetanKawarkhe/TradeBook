import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

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
  icon,
  theme,
  accent = "primary",
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: typeof Colors.light;
  accent?: "primary" | "positive";
}) {
  const accentColor = accent === "positive" ? theme.positive : theme.primary;

  const accentBackground =
    accent === "positive" ? theme.positiveLight : theme.primaryLight;

  return (
    <View
      style={{
        ...styles.statCard,
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View style={styles.statHeader}>
        <View
          style={{
            ...styles.statIconBox,
            backgroundColor: accentBackground,
          }}
        >
          <Ionicons name={icon} size={17} color={accentColor} />
        </View>

        <Text
          numberOfLines={1}
          style={{
            ...styles.statLabel,
            color: theme.textSecondary,
          }}
        >
          {label}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          ...styles.statValue,
          color: theme.text,
        }}
      >
        {value}
      </Text>
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
      <Text
        style={{
          ...styles.sectionTitle,
          color: theme.text,
        }}
      >
        {title}
      </Text>

      {action && onPress ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={styles.sectionActionButton}
        >
          <Text
            style={{
              ...styles.sectionAction,
              color: theme.primary,
            }}
          >
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

        <View style={styles.tradeInfo}>
          <Text
            numberOfLines={1}
            style={{
              ...styles.instrument,
              color: theme.text,
            }}
          >
            {trade.instrument}
          </Text>

          <Text
            numberOfLines={1}
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
            color: positive ? theme.positive : theme.primaryDark,
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

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const stats = useMemo(() => {
    const todayTrades = trades.filter((trade) => isToday(getTradeDate(trade)));

    const todayPnl = todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    const todayWins = todayTrades.filter((trade) => trade.pnl > 0).length;

    const todayLosses = todayTrades.filter((trade) => trade.pnl < 0).length;

    const todayWinRate =
      todayTrades.length > 0 ? (todayWins / todayTrades.length) * 100 : 0;

    const winningTrades = trades.filter((trade) => trade.pnl > 0);

    const losingTrades = trades.filter((trade) => trade.pnl < 0);

    const winRate =
      trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

    return {
      todayPnl,
      todayTrades,
      todayWins,
      todayLosses,
      todayWinRate,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
    };
  }, [trades]);

  const recentTrades = trades.slice(0, 5);

  const currentMonth = useMemo(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const isCurrentMonth =
    selectedMonth.getFullYear() === currentMonth.getFullYear() &&
    selectedMonth.getMonth() === currentMonth.getMonth();

  const monthInfo = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

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

    const monthPnl = Object.values(pnlByDay).reduce((sum, pnl) => sum + pnl, 0);

    const tradingDays = Object.keys(pnlByDay).length;

    return {
      monthName: selectedMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      daysInMonth,
      startOffset,
      pnlByDay,
      monthPnl,
      tradingDays,
    };
  }, [selectedMonth, trades]);

  function goToPreviousMonth() {
    setSelectedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  function goToNextMonth() {
    if (isCurrentMonth) {
      return;
    }

    setSelectedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  if (loading) {
    return (
      <View
        style={{
          ...styles.loadingContainer,
          backgroundColor: theme.background,
        }}
      >
        <View
          style={{
            ...styles.loadingCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View
            style={{
              ...styles.loadingIcon,
              backgroundColor: theme.primaryLight,
            }}
          >
            <ActivityIndicator size="small" color={theme.primary} />
          </View>

          <Text
            style={{
              ...styles.loadingTitle,
              color: theme.text,
            }}
          >
            Loading TradeBook
          </Text>

          <Text
            style={{
              ...styles.loadingText,
              color: theme.textSecondary,
            }}
          >
            Preparing your trading journal...
          </Text>
        </View>
      </View>
    );
  }

  const todayStatus =
    stats.todayTrades.length === 0
      ? "No trades yet"
      : stats.todayPnl > 0
        ? "Positive day"
        : stats.todayPnl < 0
          ? "Protect the process"
          : "Break-even day";

  const todayStatusIcon =
    stats.todayTrades.length === 0
      ? "remove-circle-outline"
      : stats.todayPnl > 0
        ? "trending-up"
        : stats.todayPnl < 0
          ? "shield-checkmark-outline"
          : "remove-circle-outline";

  /*
   * Today's P&L card state
   *
   * We deliberately do NOT use a full green/red card.
   * TradeBook remains orange-first, while the tone changes subtly
   * depending on the day's result.
   *
   * Dark mode keeps its own deeper tones so the card does not become
   * excessively bright.
   */
  const pnlCardBackground =
    stats.todayPnl > 0
      ? colorScheme === "dark"
        ? "#B95E16"
        : "#E8751A"
      : stats.todayPnl < 0
        ? colorScheme === "dark"
          ? "#20211F"
          : "#292724"
        : theme.primary;

  const pnlAccentBackground =
    stats.todayPnl > 0
      ? colorScheme === "dark"
        ? "rgba(255,255,255,0.14)"
        : "rgba(255,255,255,0.20)"
      : stats.todayPnl < 0
        ? colorScheme === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.10)"
        : "rgba(255,255,255,0.14)";

  return (
    <ScrollView
      style={{
        backgroundColor: theme.background,
      }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text
            style={{
              ...styles.eyebrow,
              color: theme.textSecondary,
            }}
          >
            TRADEBOOK
          </Text>

          <Text
            style={{
              ...styles.greeting,
              color: theme.text,
            }}
          >
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"} 👋
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push("/settings")}
          style={{
            ...styles.profileCircle,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Ionicons name="options-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Today's P&L */}
      <View
        style={{
          ...styles.pnlCard,
          backgroundColor: pnlCardBackground,
        }}
      >
        <View style={styles.pnlMain}>
          <Text style={styles.pnlLabel}>TODAY'S P&L</Text>

          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.pnlValue}>
            {formatCurrency(stats.todayPnl)}
          </Text>

          <Text style={styles.pnlSubtext}>
            {stats.todayTrades.length}{" "}
            {stats.todayTrades.length === 1 ? "trade" : "trades"} today
          </Text>
        </View>

        <View style={styles.pnlDivider} />

        <View style={styles.pnlOverview}>
          <View style={styles.pnlStatusRow}>
            <View
              style={{
                ...styles.pnlStatusIcon,
                backgroundColor: pnlAccentBackground,
              }}
            >
              <Ionicons name={todayStatusIcon} size={15} color="#FFFFFF" />
            </View>

            <Text numberOfLines={1} style={styles.pnlStatusText}>
              {todayStatus}
            </Text>
          </View>

          <View style={styles.pnlMetricRow}>
            <View style={styles.pnlMetric}>
              <Text style={styles.pnlMetricLabel}>Win rate</Text>

              <Text style={styles.pnlMetricValue}>
                {stats.todayTrades.length > 0
                  ? `${stats.todayWinRate.toFixed(0)}%`
                  : "—"}
              </Text>
            </View>

            <View style={styles.pnlMetric}>
              <Text style={styles.pnlMetricLabel}>W / L</Text>

              <Text style={styles.pnlMetricValue}>
                {stats.todayWins} / {stats.todayLosses}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
          icon="pie-chart-outline"
          theme={theme}
          accent="positive"
        />

        <StatCard
          label="Total Trades"
          value={String(stats.totalTrades)}
          icon="swap-horizontal-outline"
          theme={theme}
        />

        <StatCard
          label="Winning Trades"
          value={String(stats.winningTrades)}
          icon="trending-up-outline"
          theme={theme}
          accent="positive"
        />

        <StatCard
          label="Losing Trades"
          value={String(stats.losingTrades)}
          icon="trending-down-outline"
          theme={theme}
        />
      </View>

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
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goToPreviousMonth}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            style={{
              ...styles.calendarNavButton,
              borderColor: theme.border,
              backgroundColor: theme.cardSecondary,
            }}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.calendarTitleArea}>
            <Text
              style={{
                ...styles.calendarMonth,
                color: theme.text,
              }}
            >
              {monthInfo.monthName}
            </Text>

            {monthInfo.tradingDays > 0 ? (
              <Text
                style={{
                  ...styles.calendarSummary,
                  color:
                    monthInfo.monthPnl >= 0
                      ? theme.positive
                      : theme.primaryDark,
                }}
              >
                {formatCompactPnl(monthInfo.monthPnl)} · {monthInfo.tradingDays}{" "}
                {monthInfo.tradingDays === 1 ? "day" : "days"}
              </Text>
            ) : (
              <Text
                style={{
                  ...styles.calendarSummary,
                  color: theme.textMuted,
                }}
              >
                No trades
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goToNextMonth}
            disabled={isCurrentMonth}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            style={{
              ...styles.calendarNavButton,
              borderColor: theme.border,
              backgroundColor: theme.cardSecondary,
              opacity: isCurrentMonth ? 0.35 : 1,
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

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
                        : `${theme.primaryDark}18`
                      : "transparent",
                  }}
                >
                  <Text
                    style={{
                      ...styles.dayNumber,
                      color: hasTrade
                        ? pnl >= 0
                          ? theme.positive
                          : theme.primaryDark
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
                        color: pnl >= 0 ? theme.positive : theme.primaryDark,
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
        <Text style={styles.insightEmoji}>💡</Text>

        <View style={styles.insightContent}>
          <Text
            style={{
              ...styles.insightTitle,
              color: theme.text,
            }}
          >
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
          <Text style={styles.emptyEmoji}>📈</Text>

          <Text
            style={{
              ...styles.emptyTitle,
              color: theme.text,
            }}
          >
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
    padding: 24,
  } satisfies ViewStyle,

  loadingCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  } satisfies ViewStyle,

  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  } satisfies ViewStyle,

  loadingTitle: {
    fontSize: 17,
    fontWeight: "800",
  } satisfies TextStyle,

  loadingText: {
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  } satisfies TextStyle,

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  } satisfies ViewStyle,

  headerContent: {
    flex: 1,
    minWidth: 0,
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

  pnlCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 154,
  } satisfies ViewStyle,

  pnlMain: {
    flex: 1.15,
    justifyContent: "center",
    minWidth: 0,
  } satisfies ViewStyle,

  pnlLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    opacity: 0.78,
  } satisfies TextStyle,

  pnlValue: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 7,
    letterSpacing: -1,
  } satisfies TextStyle,

  pnlSubtext: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 5,
    opacity: 0.78,
  } satisfies TextStyle,

  pnlDivider: {
    width: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.18,
    marginHorizontal: 18,
  } satisfies ViewStyle,

  pnlOverview: {
    flex: 0.85,
    justifyContent: "center",
    minWidth: 0,
  } satisfies ViewStyle,

  pnlStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginBottom: 18,
  } satisfies ViewStyle,

  pnlStatusIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  } satisfies ViewStyle,

  pnlStatusText: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  } satisfies TextStyle,

  pnlMetricRow: {
    flexDirection: "row",
    alignItems: "center",
  } satisfies ViewStyle,

  pnlMetric: {
    flex: 1,
    minWidth: 0,
  } satisfies ViewStyle,

  pnlMetricLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.68,
    marginBottom: 3,
  } satisfies TextStyle,

  pnlMetricValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  } satisfies TextStyle,

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  } satisfies ViewStyle,

  statCard: {
    width: "48.2%",
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    justifyContent: "space-between",
  } satisfies ViewStyle,

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  } satisfies ViewStyle,

  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  } satisfies ViewStyle,

  statLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: "700",
  } satisfies TextStyle,

  statValue: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 12,
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

  sectionActionButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 4,
  } satisfies ViewStyle,

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

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  } satisfies ViewStyle,

  calendarTitleArea: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    paddingHorizontal: 10,
  } satisfies ViewStyle,

  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  calendarMonth: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  } satisfies TextStyle,

  calendarSummary: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
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
    minWidth: 0,
  } satisfies ViewStyle,

  tradeInfo: {
    flex: 1,
    minWidth: 0,
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
    marginLeft: 10,
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
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  } satisfies TextStyle,
};
