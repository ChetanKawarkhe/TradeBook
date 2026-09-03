import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/trade";

type MetricCardProps = {
  label: string;
  value: string;
  subtext?: string;
  positive?: boolean;
  negative?: boolean;
};

function MetricCard({
  label,
  value,
  subtext,
  positive,
  negative,
}: MetricCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View
      style={{
        flex: 1,
        minWidth: "46%",
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
      }}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: positive
            ? theme.positive
            : negative
              ? theme.negative
              : theme.text,
          fontSize: 20,
          fontWeight: "800",
          marginTop: 5,
        }}
      >
        {value}
      </Text>

      {subtext ? (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 10,
            marginTop: 3,
          }}
        >
          {subtext}
        </Text>
      ) : null}
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  onInfo,
}: {
  title: string;
  subtitle?: string;
  onInfo?: () => void;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 17,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              marginTop: 3,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onInfo ? (
        <Pressable
          onPress={onInfo}
          hitSlop={10}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.cardSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="information-outline"
            size={16}
            color={theme.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function MiniBar({
  label,
  value,
  max,
  positive,
}: {
  label: string;
  value: number;
  max: number;
  positive?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const width = max > 0 ? Math.max(4, (Math.abs(value) / max) * 100) : 4;

  return (
    <View style={{ marginBottom: 13 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: positive ? theme.positive : theme.negative,
            fontSize: 12,
            fontWeight: "700",
          }}
        >
          {formatCurrency(value)}
        </Text>
      </View>

      <View
        style={{
          height: 8,
          borderRadius: 99,
          backgroundColor: theme.cardSecondary,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min(width, 100)}%`,
            height: "100%",
            backgroundColor: positive ? theme.positive : theme.negative,
            borderRadius: 99,
          }}
        />
      </View>
    </View>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View
      style={{
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 12,
        borderColor:
          score >= 75
            ? theme.positive
            : score >= 50
              ? theme.primary
              : theme.negative,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 42,
          fontWeight: "900",
        }}
      >
        {score}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export default function AnalyticsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const { trades, loading } = useTrades();

  const [infoType, setInfoType] = useState<
    "profitFactor" | "expectancy" | "drawdown" | null
  >(null);

  const analytics = useMemo(() => {
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
    );

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    const wins = trades.filter((trade) => trade.pnl > 0);
    const losses = trades.filter((trade) => trade.pnl < 0);

    const grossProfit = wins.reduce((sum, trade) => sum + trade.pnl, 0);

    const grossLoss = Math.abs(
      losses.reduce((sum, trade) => sum + trade.pnl, 0),
    );

    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

    const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;

    const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const expectancy = trades.length > 0 ? totalPnl / trades.length : 0;

    const bestTrade =
      trades.length > 0 ? Math.max(...trades.map((trade) => trade.pnl)) : 0;

    const worstTrade =
      trades.length > 0 ? Math.min(...trades.map((trade) => trade.pnl)) : 0;

    const followedPlanCount = trades.filter(
      (trade) => trade.followedPlan,
    ).length;

    const planRate =
      trades.length > 0 ? (followedPlanCount / trades.length) * 100 : 0;

    // Equity + drawdown
    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;

    const equityData = sortedTrades.map((trade, index) => {
      equity += trade.pnl;
      peak = Math.max(peak, equity);

      currentDrawdown = equity - peak;

      maxDrawdown = Math.min(maxDrawdown, currentDrawdown);

      return {
        value: equity,
        label:
          index === 0 || index === sortedTrades.length - 1
            ? String(index + 1)
            : "",
        instrument: trade.instrument,
        pnl: trade.pnl,
      };
    });

    const maxDrawdownAbs = Math.abs(maxDrawdown);

    const recoveryTrades =
      maxDrawdownAbs > 0
        ? (() => {
            let running = 0;
            let peakValue = 0;
            let drawdownIndex = -1;

            sortedTrades.forEach((trade, index) => {
              running += trade.pnl;

              if (running > peakValue) {
                peakValue = running;
              }

              if (running - peakValue === maxDrawdown && drawdownIndex === -1) {
                drawdownIndex = index;
              }
            });

            if (drawdownIndex < 0) return 0;

            const drawdownPeak = equityData[drawdownIndex]?.value - maxDrawdown;

            for (
              let index = drawdownIndex + 1;
              index < equityData.length;
              index++
            ) {
              if (equityData[index].value >= drawdownPeak) {
                return index - drawdownIndex;
              }
            }

            return 0;
          })()
        : 0;

    // Monthly
    const monthlyMap: Record<string, { pnl: number; trades: number }> = {};

    trades.forEach((trade) => {
      const date = new Date(trade.exitTime);
      const key = getMonthKey(date);

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          pnl: 0,
          trades: 0,
        };
      }

      monthlyMap[key].pnl += trade.pnl;
      monthlyMap[key].trades += 1;
    });

    const monthlyPerformance = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => ({
        key,
        label: getMonthLabel(key),
        ...value,
      }));

    // Direction
    const longTrades = trades.filter((trade) => trade.direction === "LONG");

    const shortTrades = trades.filter((trade) => trade.direction === "SHORT");

    function directionStats(items: Trade[]) {
      const pnl = items.reduce((sum, trade) => sum + trade.pnl, 0);

      const wins = items.filter((trade) => trade.pnl > 0).length;

      return {
        trades: items.length,
        pnl,
        winRate: items.length > 0 ? (wins / items.length) * 100 : 0,
      };
    }

    // Emotions
    const emotionMap: Record<
      string,
      { trades: number; pnl: number; wins: number }
    > = {};

    trades.forEach((trade) => {
      const emotion = trade.emotionBefore || trade.emotion || "Neutral";

      if (!emotionMap[emotion]) {
        emotionMap[emotion] = {
          trades: 0,
          pnl: 0,
          wins: 0,
        };
      }

      emotionMap[emotion].trades += 1;
      emotionMap[emotion].pnl += trade.pnl;

      if (trade.pnl > 0) {
        emotionMap[emotion].wins += 1;
      }
    });

    const emotionPerformance = Object.entries(emotionMap)
      .map(([emotion, value]) => ({
        emotion,
        ...value,
        winRate: value.trades > 0 ? (value.wins / value.trades) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    // Behavioral stats
    const confidenceValues = trades
      .map((trade) => trade.confidence)
      .filter((value): value is number => typeof value === "number");

    const stressValues = trades
      .map((trade) => trade.stress)
      .filter((value): value is number => typeof value === "number");

    const fomoValues = trades
      .map((trade) => trade.fomo)
      .filter((value): value is number => typeof value === "number");

    const average = (values: number[]) =>
      values.length > 0
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;

    const badTrades = trades.filter(
      (trade) => trade.mistake || !trade.followedPlan,
    );

    const disciplineRate =
      trades.length > 0
        ? ((trades.length - badTrades.length) / trades.length) * 100
        : 0;

    // Trader Score
    //
    // 30% plan adherence
    // 25% win rate
    // 20% expectancy quality
    // 15% discipline
    // 10% emotional control
    const expectancyScore =
      expectancy > 0
        ? Math.min(100, 50 + (expectancy / Math.max(averageWin, 1)) * 50)
        : 0;

    const emotionalControl =
      stressValues.length > 0
        ? Math.max(
            0,
            Math.min(100, 100 - ((average(stressValues) - 1) / 4) * 100),
          )
        : 70;

    const traderScore = Math.round(
      planRate * 0.3 +
        winRate * 0.25 +
        expectancyScore * 0.2 +
        disciplineRate * 0.15 +
        emotionalControl * 0.1,
    );

    return {
      totalPnl,
      wins: wins.length,
      losses: losses.length,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      expectancy,
      bestTrade,
      worstTrade,
      planRate,
      grossProfit,
      grossLoss,

      equityData,
      maxDrawdownAbs,
      currentDrawdown,
      recoveryTrades,

      monthlyPerformance,

      longStats: directionStats(longTrades),
      shortStats: directionStats(shortTrades),

      emotionPerformance,

      averageConfidence: average(confidenceValues),
      averageStress: average(stressValues),
      averageFomo: average(fomoValues),

      disciplineRate,
      traderScore,
    };
  }, [trades]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: theme.textSecondary }}>Loading analytics...</Text>
      </View>
    );
  }

  if (trades.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.primaryLight,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <Ionicons name="analytics-outline" size={34} color={theme.primary} />
        </View>

        <Text
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Your analytics start here
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            textAlign: "center",
            lineHeight: 20,
            marginTop: 8,
            maxWidth: 300,
          }}
        >
          Log a few trades and TradeBook will turn your trading history into
          actionable insights.
        </Text>

        <Pressable
          onPress={() => router.push("/(tabs)/add")}
          style={{
            marginTop: 22,
            height: 50,
            paddingHorizontal: 24,
            borderRadius: 14,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "800",
            }}
          >
            Add Your First Trade
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
          backgroundColor: theme.background,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 22 }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 28,
              fontWeight: "900",
            }}
          >
            Analytics
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Understand your edge. Improve your execution.
          </Text>
        </View>

        {/* Top metrics */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MetricCard
            label="TOTAL P&L"
            value={formatCurrency(analytics.totalPnl)}
            positive={analytics.totalPnl >= 0}
            negative={analytics.totalPnl < 0}
            subtext={`${trades.length} trades`}
          />

          <MetricCard
            label="WIN RATE"
            value={`${analytics.winRate.toFixed(1)}%`}
            positive={analytics.winRate >= 50}
            negative={analytics.winRate < 40}
            subtext={`${analytics.wins}W / ${analytics.losses}L`}
          />

          <MetricCard
            label="AVG WIN"
            value={formatCurrency(analytics.averageWin)}
            positive
          />

          <MetricCard
            label="AVG LOSS"
            value={formatCurrency(-analytics.averageLoss)}
            negative
          />
        </View>

        {/* Quality */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader title="Performance Quality" />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <MetricCard
              label="PROFIT FACTOR"
              value={
                analytics.profitFactor > 0
                  ? analytics.profitFactor.toFixed(2)
                  : "—"
              }
              positive={analytics.profitFactor >= 1.5}
              negative={
                analytics.profitFactor > 0 && analytics.profitFactor < 1
              }
              subtext="Gross profit ÷ gross loss"
            />

            <MetricCard
              label="EXPECTANCY"
              value={formatCurrency(analytics.expectancy)}
              positive={analytics.expectancy > 0}
              negative={analytics.expectancy < 0}
              subtext="Average P&L per trade"
            />

            <MetricCard
              label="BEST TRADE"
              value={formatCurrency(analytics.bestTrade)}
              positive
            />

            <MetricCard
              label="WORST TRADE"
              value={formatCurrency(analytics.worstTrade)}
              negative
            />
          </View>
        </View>

        {/* Trader Score */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 18,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Trader Score"
            subtitle="A combined view of performance and discipline."
          />

          <ScoreRing
            score={analytics.traderScore}
            label={
              analytics.traderScore >= 75
                ? "Strong"
                : analytics.traderScore >= 50
                  ? "Developing"
                  : "Needs Work"
            }
          />

          <View
            style={{
              marginTop: 20,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                }}
              >
                Plan adherence
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {analytics.planRate.toFixed(0)}%
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                }}
              >
                Discipline
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {analytics.disciplineRate.toFixed(0)}%
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                }}
              >
                Emotional control
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {analytics.averageStress > 0
                  ? `${analytics.averageStress.toFixed(1)} / 5 stress`
                  : "No data"}
              </Text>
            </View>
          </View>
        </View>

        {/* Equity */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Equity Curve"
            subtitle="Cumulative P&L across your trades."
          />

          <View
            style={{
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            <LineChart
              data={analytics.equityData}
              height={220}
              width={300}
              spacing={
                analytics.equityData.length <= 1
                  ? 0
                  : Math.max(
                      38,
                      Math.min(
                        62,
                        280 / Math.max(analytics.equityData.length - 1, 1),
                      ),
                    )
              }
              initialSpacing={18}
              endSpacing={18}
              thickness={3}
              color={theme.primary}
              dataPointsColor={theme.primary}
              dataPointsRadius={4}
              curved
              curvature={0.2}
              hideRules={false}
              rulesColor={theme.border}
              rulesType="dashed"
              hideYAxisText={false}
              yAxisColor={theme.border}
              yAxisThickness={1}
              xAxisColor={theme.border}
              xAxisThickness={1}
              noOfSections={4}
              isAnimated={false}
              areaChart
              startFillColor={theme.primary}
              endFillColor={theme.primary}
              startOpacity={0.16}
              endOpacity={0.01}
              yAxisTextStyle={{
                color: theme.textSecondary,
                fontSize: 10,
              }}
              xAxisLabelTextStyle={{
                color: theme.textSecondary,
                fontSize: 10,
              }}
              focusEnabled
              showDataPointOnFocus
              showStripOnFocus
              stripColor={theme.primary}
              stripWidth={1}
              stripOpacity={0.4}
              focusedDataPointColor={theme.primary}
              focusedDataPointRadius={6}
              unFocusOnPressOut={false}
              delayBeforeUnFocus={60000}
              pointerConfig={{
                pointerStripHeight: 195,
                pointerStripColor: theme.primary,
                pointerStripWidth: 1,
                pointerColor: theme.primary,
                radius: 5,
                activatePointersInstantlyOnTouch: true,
                autoAdjustPointerLabelPosition: true,
                pointerLabelWidth: 145,
                pointerLabelHeight: 78,
                pointerLabelComponent: (
                  items: any[],
                  _secondaryDataItem: any,
                  pointerIndex: number,
                ) => {
                  const item = items?.[0];

                  if (!item) return null;

                  const originalTrade = analytics.equityData[pointerIndex];

                  return (
                    <View
                      style={{
                        width: 145,
                        backgroundColor: theme.card,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.border,
                        paddingHorizontal: 10,
                        paddingVertical: 9,
                        shadowColor: "#000",
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        shadowOffset: {
                          width: 0,
                          height: 3,
                        },
                        elevation: 5,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          color: theme.textSecondary,
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        Trade {pointerIndex + 1}
                        {originalTrade?.instrument
                          ? ` · ${originalTrade.instrument}`
                          : ""}
                      </Text>

                      <Text
                        style={{
                          color:
                            item.value >= 0 ? theme.positive : theme.negative,
                          fontSize: 16,
                          fontWeight: "800",
                          marginTop: 2,
                        }}
                      >
                        {formatCurrency(item.value)}
                      </Text>

                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 9,
                        }}
                      >
                        Cumulative P&L
                      </Text>

                      {originalTrade && (
                        <Text
                          style={{
                            color:
                              originalTrade.pnl >= 0
                                ? theme.positive
                                : theme.negative,
                            fontSize: 10,
                            fontWeight: "700",
                            marginTop: 3,
                          }}
                        >
                          Trade: {formatCurrency(originalTrade.pnl)}
                        </Text>
                      )}
                    </View>
                  );
                },
              }}
            />
          </View>
        </View>

        {/* Drawdown */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Drawdown"
            subtitle="How much equity you gave back from a peak."
            onInfo={() => setInfoType("drawdown")}
          />

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <MetricCard
              label="MAX DRAWDOWN"
              value={
                analytics.maxDrawdownAbs > 0
                  ? formatCurrency(-analytics.maxDrawdownAbs)
                  : "₹0"
              }
              negative={analytics.maxDrawdownAbs > 0}
            />

            <MetricCard
              label="CURRENT"
              value={
                analytics.currentDrawdown < 0
                  ? formatCurrency(analytics.currentDrawdown)
                  : "₹0"
              }
              negative={analytics.currentDrawdown < 0}
              positive={analytics.currentDrawdown >= 0}
            />
          </View>

          <View
            style={{
              marginTop: 10,
              backgroundColor: theme.cardSecondary,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
              }}
            >
              Recovery
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "700",
                marginTop: 3,
              }}
            >
              {analytics.maxDrawdownAbs === 0
                ? "No drawdown yet"
                : analytics.recoveryTrades > 0
                  ? `Recovered in ${analytics.recoveryTrades} trades`
                  : "Still recovering"}
            </Text>
          </View>
        </View>

        {/* Monthly */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Monthly Performance"
            subtitle="Your last six active months."
          />

          {analytics.monthlyPerformance.map((month) => {
            const max = Math.max(
              ...analytics.monthlyPerformance.map((item) => Math.abs(item.pnl)),
              1,
            );

            return (
              <View key={month.key}>
                <MiniBar
                  label={`${month.label} · ${month.trades} trades`}
                  value={month.pnl}
                  max={max}
                  positive={month.pnl >= 0}
                />
              </View>
            );
          })}
        </View>

        {/* Long vs Short */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Long vs Short"
            subtitle="See which direction is producing your edge."
          />

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="arrow-up" size={15} color={theme.positive} />

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  LONG
                </Text>
              </View>

              <Text
                style={{
                  color:
                    analytics.longStats.pnl >= 0
                      ? theme.positive
                      : theme.negative,
                  fontSize: 21,
                  fontWeight: "800",
                  marginTop: 12,
                }}
              >
                {formatCurrency(analytics.longStats.pnl)}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                {analytics.longStats.trades} trades ·{" "}
                {analytics.longStats.winRate.toFixed(0)}% win rate
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="arrow-down" size={15} color={theme.negative} />

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  SHORT
                </Text>
              </View>

              <Text
                style={{
                  color:
                    analytics.shortStats.pnl >= 0
                      ? theme.positive
                      : theme.negative,
                  fontSize: 21,
                  fontWeight: "800",
                  marginTop: 12,
                }}
              >
                {formatCurrency(analytics.shortStats.pnl)}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                {analytics.shortStats.trades} trades ·{" "}
                {analytics.shortStats.winRate.toFixed(0)}% win rate
              </Text>
            </View>
          </View>
        </View>

        {/* Emotions */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Emotion Analysis"
            subtitle="Which emotional states are helping or hurting?"
          />

          {analytics.emotionPerformance.length === 0 ? (
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
              }}
            >
              Add emotions to your trades to unlock this analysis.
            </Text>
          ) : (
            analytics.emotionPerformance.slice(0, 6).map((item) => (
              <View
                key={item.emotion}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {item.emotion}
                  </Text>

                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    {item.trades} trades · {item.winRate.toFixed(0)}% win rate
                  </Text>
                </View>

                <Text
                  style={{
                    color: item.pnl >= 0 ? theme.positive : theme.negative,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  {formatCurrency(item.pnl)}
                </Text>
              </View>
            ))
          )}

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 14,
            }}
          >
            <MetricCard
              label="CONFIDENCE"
              value={
                analytics.averageConfidence > 0
                  ? `${analytics.averageConfidence.toFixed(1)}/5`
                  : "—"
              }
            />

            <MetricCard
              label="FOMO"
              value={
                analytics.averageFomo > 0
                  ? `${analytics.averageFomo.toFixed(1)}/5`
                  : "—"
              }
              negative={analytics.averageFomo >= 3.5}
            />
          </View>
        </View>

        {/* Plan adherence */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <SectionHeader
            title="Execution"
            subtitle="Are you following the process?"
          />

          <View
            style={{
              height: 12,
              borderRadius: 99,
              backgroundColor: theme.cardSecondary,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: `${Math.min(analytics.planRate, 100)}%`,
                height: "100%",
                backgroundColor: theme.primary,
                borderRadius: 99,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
              }}
            >
              Plan adherence
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {analytics.planRate.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Bottom insight */}
        <View
          style={{
            backgroundColor: theme.primaryLight,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.primary,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="sparkles" size={18} color={theme.primary} />

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "800",
              }}
            >
              Quick Insight
            </Text>
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: 13,
              lineHeight: 19,
              marginTop: 8,
            }}
          >
            {analytics.planRate >= 80
              ? "Your plan adherence is strong. Focus on improving the quality of your setups rather than simply taking more trades."
              : analytics.planRate >= 60
                ? "Your execution has room to improve. Review the trades where you broke your plan and look for repeated patterns."
                : "Discipline is currently your biggest opportunity. Work on following your plan consistently before increasing trade frequency."}
          </Text>
        </View>
      </ScrollView>

      {/* Info modal */}
      <Modal
        visible={infoType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoType(null)}
      >
        <Pressable
          onPress={() => setInfoType(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 19,
                  fontWeight: "800",
                }}
              >
                {infoType === "profitFactor"
                  ? "Profit Factor"
                  : infoType === "expectancy"
                    ? "Expectancy"
                    : "Drawdown"}
              </Text>

              <Pressable onPress={() => setInfoType(null)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                lineHeight: 21,
                marginTop: 14,
              }}
            >
              {infoType === "profitFactor"
                ? "Profit Factor compares your gross winning P&L with your gross losing P&L. A value above 1 means your winners outweigh your losers. Higher is generally better."
                : infoType === "expectancy"
                  ? "Expectancy tells you how much you make or lose on average per trade. Positive expectancy means your historical trades have produced a positive average result."
                  : "Drawdown measures the decline from your highest accumulated equity to a later low. Maximum drawdown shows the deepest decline in your trading history."}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
