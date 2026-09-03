import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import { formatCurrency } from "@/utils/trade";

export default function AnalyticsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { trades, loading } = useTrades();

  const [infoType, setInfoType] = useState<
    "profitFactor" | "expectancy" | null
  >(null);

  const analytics = useMemo(() => {
    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    const wins = trades.filter((trade) => trade.pnl > 0);
    const losses = trades.filter((trade) => trade.pnl < 0);

    const winningPnl = wins.reduce((sum, trade) => sum + trade.pnl, 0);
    const losingPnl = losses.reduce((sum, trade) => sum + trade.pnl, 0);

    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

    const averageWin = wins.length > 0 ? winningPnl / wins.length : 0;

    const averageLoss = losses.length > 0 ? losingPnl / losses.length : 0;

    const profitFactor =
      losingPnl !== 0
        ? winningPnl / Math.abs(losingPnl)
        : winningPnl > 0
          ? Infinity
          : 0;

    const expectancy = trades.length > 0 ? totalPnl / trades.length : 0;

    const followedPlan =
      trades.length > 0
        ? (trades.filter((trade) => trade.followedPlan).length /
            trades.length) *
          100
        : 0;

    const sortedTrades = [...trades].sort(
      (a, b) =>
        new Date(a.exitTime || a.entryTime).getTime() -
        new Date(b.exitTime || b.entryTime).getTime(),
    );

    let cumulativePnl = 0;

    const equityData = sortedTrades.map((trade, index) => {
      cumulativePnl += trade.pnl;

      return {
        value: cumulativePnl,
        label:
          index === 0 || index === sortedTrades.length - 1
            ? `T${index + 1}`
            : "",
        tradeNumber: index + 1,
        pnl: trade.pnl,
        instrument: trade.instrument,
        date: new Date(trade.exitTime || trade.entryTime).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          },
        ),
      };
    });

    const strategyMap: Record<
      string,
      { pnl: number; trades: number; wins: number }
    > = {};

    trades.forEach((trade) => {
      const strategy = trade.strategy || "No Strategy";

      if (!strategyMap[strategy]) {
        strategyMap[strategy] = {
          pnl: 0,
          trades: 0,
          wins: 0,
        };
      }

      strategyMap[strategy].pnl += trade.pnl;
      strategyMap[strategy].trades += 1;

      if (trade.pnl > 0) {
        strategyMap[strategy].wins += 1;
      }
    });

    const strategies = Object.entries(strategyMap)
      .map(([name, data]) => ({
        name,
        ...data,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    const bestTrade =
      trades.length > 0
        ? trades.reduce((best, trade) => (trade.pnl > best.pnl ? trade : best))
        : null;

    const worstTrade =
      trades.length > 0
        ? trades.reduce((worst, trade) =>
            trade.pnl < worst.pnl ? trade : worst,
          )
        : null;

    return {
      totalPnl,
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      expectancy,
      followedPlan,
      equityData,
      strategies,
      bestTrade,
      worstTrade,
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
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View
          style={{
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 30,
              fontWeight: "800",
              letterSpacing: -0.8,
            }}
          >
            Analytics
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Understand your trading performance.
          </Text>
        </View>

        {trades.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 28,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              No analytics yet
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Add a few trades and your performance analytics will appear here.
            </Text>
          </View>
        ) : (
          <>
            {/* Main P&L */}
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: theme.border,
                padding: 20,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                TOTAL P&L
              </Text>

              <Text
                style={{
                  color:
                    analytics.totalPnl >= 0 ? theme.positive : theme.negative,
                  fontSize: 34,
                  fontWeight: "800",
                  marginTop: 6,
                  letterSpacing: -1,
                }}
              >
                {formatCurrency(analytics.totalPnl)}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 18,
                  gap: 20,
                }}
              >
                <Metric
                  label="Trades"
                  value={`${analytics.totalTrades}`}
                  theme={theme}
                />

                <Metric
                  label="Win Rate"
                  value={`${analytics.winRate.toFixed(1)}%`}
                  theme={theme}
                />

                <Metric
                  label="Wins"
                  value={`${analytics.wins}`}
                  theme={theme}
                />

                <Metric
                  label="Losses"
                  value={`${analytics.losses}`}
                  theme={theme}
                />
              </View>
            </View>

            {/* Equity Curve */}
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: theme.border,
                paddingTop: 20,
                paddingBottom: 18,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 20,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Equity Curve
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 13,
                    marginTop: 3,
                  }}
                >
                  Cumulative P&L across your trades
                </Text>
              </View>

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

                      if (!item) {
                        return null;
                      }

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
                                item.value >= 0
                                  ? theme.positive
                                  : theme.negative,
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

              <View
                style={{
                  paddingHorizontal: 20,
                  marginTop: 2,
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
                  Tap / drag the chart
                </Text>

                <Text
                  style={{
                    color:
                      analytics.totalPnl >= 0 ? theme.positive : theme.negative,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(analytics.totalPnl)}
                </Text>
              </View>
            </View>

            {/* Average Win / Loss */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <StatCard
                title="Average Win"
                value={formatCurrency(analytics.averageWin)}
                positive
                theme={theme}
              />

              <StatCard
                title="Average Loss"
                value={formatCurrency(analytics.averageLoss)}
                positive={false}
                theme={theme}
              />
            </View>

            {/* Profit Factor + Expectancy */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <InfoStatCard
                title="Profit Factor"
                value={
                  Number.isFinite(analytics.profitFactor)
                    ? analytics.profitFactor.toFixed(2)
                    : "∞"
                }
                onInfo={() => setInfoType("profitFactor")}
                theme={theme}
              />

              <InfoStatCard
                title="Expectancy / Trade"
                value={formatCurrency(analytics.expectancy)}
                onInfo={() => setInfoType("expectancy")}
                theme={theme}
              />
            </View>

            {/* Plan Followed */}
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.border,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Plan Discipline
                  </Text>

                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    Trades where you followed your plan
                  </Text>
                </View>

                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 20,
                    fontWeight: "800",
                  }}
                >
                  {analytics.followedPlan.toFixed(0)}%
                </Text>
              </View>

              <View
                style={{
                  height: 8,
                  borderRadius: 8,
                  backgroundColor: theme.cardSecondary,
                  overflow: "hidden",
                  marginTop: 14,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, analytics.followedPlan)}%`,
                    backgroundColor: theme.primary,
                    borderRadius: 8,
                  }}
                />
              </View>
            </View>

            {/* Strategies */}
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.border,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Strategy Performance
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  marginTop: 3,
                  marginBottom: 16,
                }}
              >
                Which setups are actually making money?
              </Text>

              {analytics.strategies.map((strategy) => (
                <View
                  key={strategy.name}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        {strategy.name}
                      </Text>

                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {strategy.trades} trades · {strategy.winRate.toFixed(0)}
                        % win rate
                      </Text>
                    </View>

                    <Text
                      style={{
                        color:
                          strategy.pnl >= 0 ? theme.positive : theme.negative,
                        fontSize: 15,
                        fontWeight: "800",
                      }}
                    >
                      {formatCurrency(strategy.pnl)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Best / Worst */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
              }}
            >
              <TradeHighlight
                title="Best Trade"
                trade={analytics.bestTrade}
                positive
                theme={theme}
                onPress={() => {
                  if (!analytics.bestTrade) return;

                  router.push({
                    pathname: "/trade/[id]",
                    params: { id: analytics.bestTrade.id },
                  });
                }}
              />

              <TradeHighlight
                title="Worst Trade"
                trade={analytics.worstTrade}
                positive={false}
                theme={theme}
                onPress={() => {
                  if (!analytics.worstTrade) return;

                  router.push({
                    pathname: "/trade/[id]",
                    params: { id: analytics.worstTrade.id },
                  });
                }}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Info Modal */}
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
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {infoType === "profitFactor" ? (
              <>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 20,
                    fontWeight: "800",
                  }}
                >
                  Profit Factor
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    lineHeight: 21,
                    marginTop: 12,
                  }}
                >
                  Profit Factor compares the money you made on winning trades
                  with the money you lost on losing trades.
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    fontWeight: "700",
                    marginTop: 16,
                  }}
                >
                  Formula
                </Text>

                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 15,
                    marginTop: 5,
                  }}
                >
                  Total Winning P&L ÷ Absolute Total Losing P&L
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    lineHeight: 21,
                    marginTop: 14,
                  }}
                >
                  Above 1 = profitable{"\n"}1 = break-even{"\n"}
                  Below 1 = losing
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 20,
                    fontWeight: "800",
                  }}
                >
                  Expectancy / Trade
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    lineHeight: 21,
                    marginTop: 12,
                  }}
                >
                  Expectancy tells you the average amount you historically made
                  or lost per trade.
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    fontWeight: "700",
                    marginTop: 16,
                  }}
                >
                  Formula
                </Text>

                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 15,
                    marginTop: 5,
                  }}
                >
                  Total P&L ÷ Number of Trades
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    lineHeight: 21,
                    marginTop: 14,
                  }}
                >
                  Positive = positive average edge{"\n"}
                  Zero = break-even average{"\n"}
                  Negative = negative average edge
                </Text>
              </>
            )}

            <Pressable
              onPress={() => setInfoType(null)}
              style={{
                marginTop: 22,
                backgroundColor: theme.primary,
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Got it
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Metric({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: typeof Colors.light;
}) {
  return (
    <View>
      <Text
        style={{
          color: theme.text,
          fontSize: 16,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function StatCard({
  title,
  value,
  positive,
  theme,
}: {
  title: string;
  value: string;
  positive: boolean;
  theme: typeof Colors.light;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 18,
      }}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: positive ? theme.positive : theme.negative,
          fontSize: 20,
          fontWeight: "800",
          marginTop: 6,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoStatCard({
  title,
  value,
  onInfo,
  theme,
}: {
  title: string;
  value: string;
  onInfo: () => void;
  theme: typeof Colors.light;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 18,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
        }}
      >
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>

        <Pressable
          onPress={onInfo}
          hitSlop={8}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: theme.textSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            i
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          color: theme.text,
          fontSize: 22,
          fontWeight: "800",
          marginTop: 6,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function TradeHighlight({
  title,
  trade,
  positive,
  theme,
  onPress,
}: {
  title: string;
  trade: {
    id: string;
    instrument: string;
    pnl: number;
  } | null;
  positive: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!trade}
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 18,
      }}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>

      {trade ? (
        <>
          <Text
            style={{
              color: theme.text,
              fontSize: 15,
              fontWeight: "700",
              marginTop: 8,
            }}
          >
            {trade.instrument}
          </Text>

          <Text
            style={{
              color: positive ? theme.positive : theme.negative,
              fontSize: 19,
              fontWeight: "800",
              marginTop: 3,
            }}
          >
            {formatCurrency(trade.pnl)}
          </Text>
        </>
      ) : (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 14,
            marginTop: 8,
          }}
        >
          —
        </Text>
      )}
    </Pressable>
  );
}
