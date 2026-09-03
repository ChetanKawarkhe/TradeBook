import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import { formatCurrency } from "@/utils/trade";

export default function AnalyticsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { trades, loading } = useTrades();

  const analytics = useMemo(() => {
    const totalTrades = trades.length;

    const wins = trades.filter((trade) => trade.pnl > 0);
    const losses = trades.filter((trade) => trade.pnl < 0);

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    const winningPnl = wins.reduce((sum, trade) => sum + trade.pnl, 0);

    const losingPnl = losses.reduce((sum, trade) => sum + trade.pnl, 0);

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;

    const averageWin = wins.length > 0 ? winningPnl / wins.length : 0;

    const averageLoss = losses.length > 0 ? losingPnl / losses.length : 0;

    const profitFactor =
      losingPnl !== 0
        ? winningPnl / Math.abs(losingPnl)
        : winningPnl > 0
          ? Infinity
          : 0;

    const expectancy = totalTrades > 0 ? totalPnl / totalTrades : 0;

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

    const followedPlan = trades.filter((trade) => trade.followedPlan).length;

    const planRate = totalTrades > 0 ? (followedPlan / totalTrades) * 100 : 0;

    return {
      totalTrades,
      wins,
      losses,
      totalPnl,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      expectancy,
      bestTrade,
      worstTrade,
      followedPlan,
      planRate,
    };
  }, [trades]);

  const strategyStats = useMemo(() => {
    const grouped: Record<string, { pnl: number; trades: number }> = {};

    trades.forEach((trade) => {
      const strategy = trade.strategy?.trim() || "No Strategy";

      if (!grouped[strategy]) {
        grouped[strategy] = {
          pnl: 0,
          trades: 0,
        };
      }

      grouped[strategy].pnl += trade.pnl;
      grouped[strategy].trades += 1;
    });

    return Object.entries(grouped)
      .map(([strategy, stats]) => ({
        strategy,
        ...stats,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const equityPoints = useMemo(() => {
    const sorted = [...trades].sort(
      (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
    );

    let runningPnl = 0;

    return sorted.map((trade) => {
      runningPnl += trade.pnl;

      return {
        id: trade.id,
        pnl: runningPnl,
      };
    });
  }, [trades]);

  const equityMin = equityPoints.length
    ? Math.min(...equityPoints.map((point) => point.pnl), 0)
    : 0;

  const equityMax = equityPoints.length
    ? Math.max(...equityPoints.map((point) => point.pnl), 0)
    : 0;

  const equityRange = Math.max(equityMax - equityMin, 1);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 15,
          }}
        >
          Loading analytics...
        </Text>
      </View>
    );
  }

  if (trades.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 18,
            paddingTop: 24,
            paddingBottom: 120,
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 24,
              padding: 30,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 40,
                marginBottom: 14,
              }}
            >
              📊
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 21,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Your analytics will appear here
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                lineHeight: 21,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Add a few trades and TradeBook will start calculating your
              performance automatically.
            </Text>

            <Pressable
              onPress={() => router.push("/add")}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 14,
                paddingHorizontal: 20,
                paddingVertical: 12,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "800",
                }}
              >
                Add Trade
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
          paddingTop: 20,
          paddingBottom: 120,
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
              marginTop: 3,
            }}
          >
            Understand your trading performance
          </Text>
        </View>

        {/* Performance Hero */}
        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 22,
            padding: 18,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1,
            }}
          >
            TOTAL P&L
          </Text>

          <Text
            style={{
              color: analytics.totalPnl >= 0 ? theme.positive : theme.negative,
              fontSize: 31,
              fontWeight: "800",
              marginTop: 3,
            }}
          >
            {formatCurrency(analytics.totalPnl)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginTop: 18,
              gap: 24,
            }}
          >
            <MiniStat
              label="Trades"
              value={String(analytics.totalTrades)}
              theme={theme}
            />

            <MiniStat
              label="Win Rate"
              value={`${analytics.winRate.toFixed(1)}%`}
              theme={theme}
            />

            <MiniStat
              label="Wins"
              value={String(analytics.wins.length)}
              valueColor={theme.positive}
              theme={theme}
            />

            <MiniStat
              label="Losses"
              value={String(analytics.losses.length)}
              valueColor={theme.negative}
              theme={theme}
            />
          </View>
        </View>

        {/* Core Metrics */}
        <SectionTitle title="Performance" theme={theme} />

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MetricCard
            label="Average Win"
            value={formatCurrency(analytics.averageWin)}
            valueColor={theme.positive}
            theme={theme}
          />

          <MetricCard
            label="Average Loss"
            value={formatCurrency(analytics.averageLoss)}
            valueColor={theme.negative}
            theme={theme}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MetricCard
            label="Profit Factor"
            value={
              Number.isFinite(analytics.profitFactor)
                ? analytics.profitFactor.toFixed(2)
                : "∞"
            }
            theme={theme}
          />

          <MetricCard
            label="Expectancy / Trade"
            value={formatCurrency(analytics.expectancy)}
            valueColor={
              analytics.expectancy >= 0 ? theme.positive : theme.negative
            }
            theme={theme}
          />
        </View>

        {/* Equity Curve */}
        <SectionTitle title="Equity Curve" theme={theme} />

        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 20,
            padding: 18,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 11,
                }}
              >
                Start
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                ₹0
              </Text>
            </View>

            <View
              style={{
                alignItems: "flex-end",
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 11,
                }}
              >
                Current
              </Text>

              <Text
                style={{
                  color:
                    analytics.totalPnl >= 0 ? theme.positive : theme.negative,
                  fontSize: 14,
                  fontWeight: "800",
                  marginTop: 2,
                }}
              >
                {formatCurrency(analytics.totalPnl)}
              </Text>
            </View>
          </View>

          <View
            style={{
              height: 150,
              position: "relative",
            }}
          >
            {/* Zero line */}
            {equityMin < 0 && equityMax > 0 && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: ((equityMax - 0) / equityRange) * 140,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              />
            )}

            {equityPoints.length === 1 ? (
              <EquityDot
                point={equityPoints[0]}
                min={equityMin}
                range={equityRange}
                theme={theme}
              />
            ) : (
              equityPoints.map((point, index) => (
                <EquityDot
                  key={point.id}
                  point={point}
                  index={index}
                  total={equityPoints.length}
                  min={equityMin}
                  range={equityRange}
                  theme={theme}
                />
              ))
            )}
          </View>
        </View>

        {/* Strategy Performance */}
        <SectionTitle title="Performance by Strategy" theme={theme} />

        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 20,
            padding: 18,
            marginBottom: 14,
          }}
        >
          {strategyStats.length === 0 ? (
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
              }}
            >
              No strategy data available.
            </Text>
          ) : (
            strategyStats.map((item, index) => {
              const maxAbsPnl = Math.max(
                ...strategyStats.map((strategy) => Math.abs(strategy.pnl)),
                1,
              );

              const width = (Math.abs(item.pnl) / maxAbsPnl) * 100;

              return (
                <View
                  key={item.strategy}
                  style={{
                    marginBottom: index === strategyStats.length - 1 ? 0 : 18,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 7,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                        numberOfLines={1}
                      >
                        {item.strategy}
                      </Text>

                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {item.trades} {item.trades === 1 ? "trade" : "trades"}
                      </Text>
                    </View>

                    <Text
                      style={{
                        color: item.pnl >= 0 ? theme.positive : theme.negative,
                        fontSize: 14,
                        fontWeight: "800",
                      }}
                    >
                      {formatCurrency(item.pnl)}
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: theme.cardSecondary,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.max(width, 2)}%`,
                        backgroundColor:
                          item.pnl >= 0 ? theme.positive : theme.negative,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Trading Behavior */}
        <SectionTitle title="Trading Behavior" theme={theme} />

        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 20,
            padding: 18,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                Plan followed
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {analytics.followedPlan} of {analytics.totalTrades} trades
              </Text>
            </View>

            <Text
              style={{
                color:
                  analytics.planRate >= 70
                    ? theme.positive
                    : analytics.planRate >= 50
                      ? theme.primary
                      : theme.negative,
                fontSize: 19,
                fontWeight: "800",
              }}
            >
              {analytics.planRate.toFixed(0)}%
            </Text>
          </View>

          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.cardSecondary,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${analytics.planRate}%`,
                backgroundColor: theme.primary,
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        {/* Best / Worst */}
        <SectionTitle title="Trade Highlights" theme={theme} />

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <HighlightCard
            label="Best Trade"
            trade={analytics.bestTrade}
            positive
            theme={theme}
            onPress={
              analytics.bestTrade
                ? () => {
                    router.push({
                      pathname: "/trade/[id]",
                      params: {
                        id: analytics.bestTrade!.id,
                      },
                    });
                  }
                : undefined
            }
          />

          <HighlightCard
            label="Worst Trade"
            trade={analytics.worstTrade}
            positive={false}
            theme={theme}
            onPress={
              analytics.worstTrade
                ? () => {
                    router.push({
                      pathname: "/trade/[id]",
                      params: {
                        id: analytics.worstTrade!.id,
                      },
                    });
                  }
                : undefined
            }
          />
        </View>

        {/* Footer note */}
        <View
          style={{
            paddingHorizontal: 4,
            paddingTop: 4,
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              lineHeight: 17,
              textAlign: "center",
            }}
          >
            Analytics are calculated from your saved trades. More behavioral
            insights will be added as your journal grows.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({
  title,
  theme,
}: {
  title: string;
  theme: typeof Colors.light;
}) {
  return (
    <Text
      style={{
        color: theme.text,
        fontSize: 17,
        fontWeight: "800",
        marginBottom: 10,
        marginLeft: 2,
      }}
    >
      {title}
    </Text>
  );
}

function MiniStat({
  label,
  value,
  valueColor,
  theme,
}: {
  label: string;
  value: string;
  valueColor?: string;
  theme: typeof Colors.light;
}) {
  return (
    <View>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: valueColor ?? theme.text,
          fontSize: 15,
          fontWeight: "800",
          marginTop: 3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  valueColor,
  theme,
}: {
  label: string;
  value: string;
  valueColor?: string;
  theme: typeof Colors.light;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 17,
        padding: 15,
      }}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: valueColor ?? theme.text,
          fontSize: 17,
          fontWeight: "800",
          marginTop: 6,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function EquityDot({
  point,
  index = 0,
  total = 1,
  min,
  range,
  theme,
}: {
  point: {
    id: string;
    pnl: number;
  };
  index?: number;
  total?: number;
  min: number;
  range: number;
  theme: typeof Colors.light;
}) {
  const left = total <= 1 ? 50 : (index / (total - 1)) * 96 + 2;

  const top = (Math.max(0, Math.min(range, point.pnl - min)) / range) * 140;

  return (
    <View
      style={{
        position: "absolute",
        left: `${left}%`,
        top: 140 - top,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: point.pnl >= 0 ? theme.positive : theme.negative,
      }}
    />
  );
}

function HighlightCard({
  label,
  trade,
  positive,
  theme,
  onPress,
}: {
  label: string;
  trade: {
    id: string;
    instrument: string;
    pnl: number;
  } | null;
  positive: boolean;
  theme: typeof Colors.light;
  onPress?: () => void;
}) {
  const content = (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 18,
        padding: 16,
      }}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>

      {trade ? (
        <>
          <Text
            style={{
              color: theme.text,
              fontSize: 15,
              fontWeight: "800",
              marginTop: 8,
            }}
            numberOfLines={1}
          >
            {trade.instrument}
          </Text>

          <Text
            style={{
              color: positive ? theme.positive : theme.negative,
              fontSize: 18,
              fontWeight: "800",
              marginTop: 4,
            }}
          >
            {formatCurrency(trade.pnl)}
          </Text>
        </>
      ) : (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            marginTop: 8,
          }}
        >
          No data
        </Text>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
      }}
    >
      {content}
    </Pressable>
  );
}
