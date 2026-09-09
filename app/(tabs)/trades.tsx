import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import type { Trade } from "@/types/trade";
import { exportTradesToExcel, exportTradesToPdf } from "@/utils/exportTrades";
import { formatCurrency } from "@/utils/trade";
import { getTradeResultType } from "@/utils/tradeResult";

type ResultFilter = "ALL" | "WINS" | "LOSSES";
type DirectionFilter = "ALL" | "LONG" | "SHORT";
type SortOption = "NEWEST" | "OLDEST" | "BEST" | "WORST";

export default function TradesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { trades, loading } = useTrades();

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("ALL");

  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("ALL");

  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");

  const [filterOpen, setFilterOpen] = useState(false);

  const [draftDirection, setDraftDirection] = useState<DirectionFilter>("ALL");

  const [draftSort, setDraftSort] = useState<SortOption>("NEWEST");

  const hasSearchOrFilter =
    search.trim().length > 0 ||
    resultFilter !== "ALL" ||
    directionFilter !== "ALL";

  const activeFilterCount =
    (directionFilter !== "ALL" ? 1 : 0) + (sortOption !== "NEWEST" ? 1 : 0);

  const filteredTrades = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = trades.filter((trade) => {
      const matchesSearch =
        query.length === 0 ||
        trade.instrument.toLowerCase().includes(query) ||
        trade.strategy.toLowerCase().includes(query) ||
        trade.emotion.toLowerCase().includes(query) ||
        trade.notes.toLowerCase().includes(query);

      const matchesResult =
        resultFilter === "ALL" ||
        (resultFilter === "WINS" && trade.pnl > 0) ||
        (resultFilter === "LOSSES" && trade.pnl < 0);

      const matchesDirection =
        directionFilter === "ALL" || trade.direction === directionFilter;

      return matchesSearch && matchesResult && matchesDirection;
    });

    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case "OLDEST":
          return (
            new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime()
          );

        case "BEST":
          return b.pnl - a.pnl;

        case "WORST":
          return a.pnl - b.pnl;

        case "NEWEST":
        default:
          return (
            new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime()
          );
      }
    });

    return result;
  }, [trades, search, resultFilter, directionFilter, sortOption]);

  const totalPnl = useMemo(
    () => filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0),
    [filteredTrades],
  );

  const wins = filteredTrades.filter((trade) => trade.pnl > 0).length;

  const losses = filteredTrades.filter((trade) => trade.pnl < 0).length;

  function openFilters() {
    setDraftDirection(directionFilter);
    setDraftSort(sortOption);
    setFilterOpen(true);
  }

  function applyFilters() {
    setDirectionFilter(draftDirection);
    setSortOption(draftSort);
    setFilterOpen(false);
  }

  function resetFilters() {
    setDraftDirection("ALL");
    setDraftSort("NEWEST");
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function goToTrade(trade: Trade) {
    router.push({
      pathname: "/trade/[id]",
      params: { id: trade.id },
    });
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          padding: 18,
          paddingTop: 24,
        }}
      >
        <View
          style={{
            marginBottom: 22,
          }}
        >
          <View
            style={{
              width: 110,
              height: 32,
              borderRadius: 8,
              backgroundColor: theme.cardSecondary,
            }}
          />

          <View
            style={{
              width: 190,
              height: 14,
              borderRadius: 7,
              backgroundColor: theme.cardSecondary,
              marginTop: 9,
            }}
          />
        </View>

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
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <View
                style={{
                  width: 90,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: theme.cardSecondary,
                }}
              />

              <View
                style={{
                  width: 130,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: theme.cardSecondary,
                  marginTop: 8,
                }}
              />
            </View>

            <View
              style={{
                width: 115,
                alignItems: "flex-end",
              }}
            >
              <View
                style={{
                  width: 62,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: theme.cardSecondary,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  gap: 6,
                  marginTop: 9,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: theme.cardSecondary,
                  }}
                />

                <View
                  style={{
                    width: 50,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: theme.cardSecondary,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: theme.border,
              marginTop: 18,
              marginBottom: 14,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              gap: 28,
            }}
          >
            {[1, 2, 3].map((item) => (
              <View key={item}>
                <View
                  style={{
                    width: 45,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.cardSecondary,
                  }}
                />

                <View
                  style={{
                    width: 28,
                    height: 16,
                    borderRadius: 6,
                    backgroundColor: theme.cardSecondary,
                    marginTop: 6,
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {[1, 2, 3].map((item) => (
          <View
            key={item}
            style={{
              height: 130,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 20,
              marginBottom: 11,
            }}
          />
        ))}
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
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text
              style={{
                color: theme.text,
                fontSize: 30,
                fontWeight: "800",
                letterSpacing: -0.8,
              }}
            >
              Trades
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                marginTop: 3,
              }}
            >
              Review your trading history
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("/add")}
              style={{
                ...styles.addButton,
                backgroundColor: theme.primary,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                + Add
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Summary */}
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
          <View style={styles.summaryTop}>
            {/* P&L + Metrics */}
            <View style={styles.summaryMain}>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                {hasSearchOrFilter ? "FILTERED P&L" : "TOTAL P&L"}
              </Text>

              <Text
                style={{
                  color: totalPnl >= 0 ? theme.positive : theme.primaryDark,
                  fontSize: 28,
                  fontWeight: "800",
                  marginTop: 3,
                  letterSpacing: -0.5,
                }}
              >
                {formatCurrency(totalPnl)}
              </Text>

              <View style={styles.summaryMetrics}>
                <SummaryMetric
                  label="Trades"
                  value={String(filteredTrades.length)}
                  theme={theme}
                />

                <SummaryMetric
                  label="Wins"
                  value={String(wins)}
                  valueColor={theme.positive}
                  theme={theme}
                />

                <SummaryMetric
                  label="Losses"
                  value={String(losses)}
                  valueColor={theme.primaryDark}
                  theme={theme}
                />
              </View>
            </View>

            {/* Export Section */}
            <View
              style={{
                ...styles.exportSection,
                borderLeftColor: theme.border,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 9,
                  fontWeight: "800",
                  letterSpacing: 1.2,
                  marginBottom: 9,
                }}
              >
                EXPORT TO
              </Text>

              <View style={styles.exportButtons}>
                <Pressable
                  onPress={() => exportTradesToExcel(trades)}
                  style={{
                    ...styles.exportButton,
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      ...styles.exportIcon,
                      backgroundColor: theme.primaryLight,
                    }}
                  >
                    <Ionicons
                      name="grid-outline"
                      size={17}
                      color={theme.primary}
                    />
                  </View>

                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 9,
                      fontWeight: "800",
                      marginTop: 5,
                    }}
                  >
                    Excel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => exportTradesToPdf(trades)}
                  style={{
                    ...styles.exportButton,
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      ...styles.exportIcon,
                      backgroundColor: theme.primaryLight,
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={17}
                      color={theme.primary}
                    />
                  </View>

                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 9,
                      fontWeight: "800",
                      marginTop: 5,
                    }}
                  >
                    PDF
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Search */}
        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 15,
            paddingHorizontal: 14,
            marginBottom: 12,
          }}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search instrument, strategy..."
            placeholderTextColor={theme.textSecondary}
            style={{
              color: theme.text,
              fontSize: 15,
              minHeight: 48,
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Quick filters */}
        <View style={styles.quickFilterRow}>
          <View style={styles.resultFilters}>
            <FilterChip
              label="All"
              active={resultFilter === "ALL"}
              onPress={() => setResultFilter("ALL")}
              theme={theme}
            />

            <FilterChip
              label="Wins"
              active={resultFilter === "WINS"}
              onPress={() => setResultFilter("WINS")}
              theme={theme}
            />

            <FilterChip
              label="Losses"
              active={resultFilter === "LOSSES"}
              onPress={() => setResultFilter("LOSSES")}
              theme={theme}
            />
          </View>

          <Pressable
            onPress={openFilters}
            style={{
              ...styles.filterButton,
              borderColor: activeFilterCount > 0 ? theme.primary : theme.border,
              backgroundColor:
                activeFilterCount > 0 ? theme.primaryLight : theme.card,
            }}
          >
            <Text
              style={{
                color: activeFilterCount > 0 ? theme.primary : theme.text,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              ⚙ Filters
            </Text>

            {activeFilterCount > 0 && (
              <View
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: theme.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: "800",
                  }}
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Trade list */}
        {filteredTrades.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 20,
              padding: 30,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 32,
                marginBottom: 10,
              }}
            >
              {trades.length === 0 ? "📒" : "🔎"}
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 17,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {trades.length === 0 ? "No trades yet" : "No trades found"}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                textAlign: "center",
                marginTop: 6,
                lineHeight: 19,
              }}
            >
              {trades.length === 0
                ? "Add your first trade to start building your journal."
                : "Try changing your search or filters."}
            </Text>

            {trades.length === 0 && (
              <Pressable
                onPress={() => router.push("/add")}
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 13,
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  marginTop: 18,
                  minHeight: 44,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  Add First Trade
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ gap: 11 }}>
            {filteredTrades.map((trade) => {
              const isWin = trade.pnl > 0;
              const isLoss = trade.pnl < 0;
              const resultType = getTradeResultType(trade);

              const resultColor = isWin
                ? theme.positive
                : isLoss
                  ? theme.primaryDark
                  : theme.textSecondary;

              const resultBackground = isWin
                ? theme.positiveLight
                : isLoss
                  ? theme.primaryLight
                  : theme.cardSecondary;

              return (
                <Pressable
                  key={trade.id}
                  onPress={() => goToTrade(trade)}
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: 4,
                        backgroundColor: theme.primary,
                      }}
                    />

                    <View
                      style={{
                        flex: 1,
                        padding: 16,
                      }}
                    >
                      <View style={styles.tradeMainRow}>
                        <View
                          style={{
                            flex: 1,
                            paddingRight: 12,
                            minWidth: 0,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 7,
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                color: theme.text,
                                fontSize: 19,
                                fontWeight: "800",
                                letterSpacing: -0.3,
                                maxWidth: "72%",
                              }}
                            >
                              {trade.instrument}
                            </Text>

                            <View
                              style={{
                                backgroundColor:
                                  trade.direction === "LONG"
                                    ? theme.primaryLight
                                    : theme.cardSecondary,
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    trade.direction === "LONG"
                                      ? theme.primary
                                      : theme.textSecondary,
                                  fontSize: 10,
                                  fontWeight: "800",
                                  letterSpacing: 0.4,
                                }}
                              >
                                {trade.direction}
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={{
                              color: theme.textSecondary,
                              fontSize: 12,
                              marginTop: 5,
                            }}
                            numberOfLines={1}
                          >
                            {trade.strategy || "No strategy"}
                            {"  ·  "}
                            {formatDate(trade.exitTime)}
                          </Text>
                        </View>

                        <View
                          style={{
                            alignItems: "flex-end",
                            flexShrink: 0,
                          }}
                        >
                          <Text
                            style={{
                              color: resultColor,
                              fontSize: 19,
                              fontWeight: "800",
                              letterSpacing: -0.3,
                            }}
                          >
                            {formatCurrency(trade.pnl)}
                          </Text>

                          <View
                            style={{
                              backgroundColor: resultBackground,
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              marginTop: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: resultColor,
                                fontSize: 9,
                                fontWeight: "800",
                              }}
                            >
                              {resultType.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 16,
                          paddingTop: 13,
                          borderTopWidth: 1,
                          borderTopColor: theme.border,
                        }}
                      >
                        <TradeMetric
                          label="Entry"
                          value={trade.entryPrice.toLocaleString("en-IN")}
                          theme={theme}
                        />

                        <View
                          style={{
                            width: 1,
                            backgroundColor: theme.border,
                            marginHorizontal: 18,
                          }}
                        />

                        <TradeMetric
                          label="Exit"
                          value={trade.exitPrice.toLocaleString("en-IN")}
                          theme={theme}
                        />

                        <View
                          style={{
                            width: 1,
                            backgroundColor: theme.border,
                            marginHorizontal: 18,
                          }}
                        />

                        <TradeMetric
                          label="Qty"
                          value={String(trade.quantity)}
                          theme={theme}
                        />

                        <View style={styles.planContainer}>
                          <View
                            style={{
                              backgroundColor: trade.followedPlan
                                ? theme.positiveLight
                                : theme.primaryLight,
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: trade.followedPlan
                                  ? theme.positive
                                  : theme.primaryDark,
                                fontSize: 10,
                                fontWeight: "800",
                              }}
                            >
                              {trade.followedPlan ? "✓ PLAN" : "✕ PLAN"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => setFilterOpen(false)}
            style={{
              flex: 1,
            }}
          />

          <View
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 30,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.border,
                alignSelf: "center",
                marginBottom: 18,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 21,
                  fontWeight: "800",
                }}
              >
                Filters
              </Text>

              <Pressable
                onPress={() => setFilterOpen(false)}
                style={styles.sheetCloseButton}
              >
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 10,
              }}
            >
              Direction
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <SheetChip
                label="All"
                active={draftDirection === "ALL"}
                onPress={() => setDraftDirection("ALL")}
                theme={theme}
              />

              <SheetChip
                label="Long"
                active={draftDirection === "LONG"}
                onPress={() => setDraftDirection("LONG")}
                theme={theme}
              />

              <SheetChip
                label="Short"
                active={draftDirection === "SHORT"}
                onPress={() => setDraftDirection("SHORT")}
                theme={theme}
              />
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 10,
              }}
            >
              Sort by
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 26,
              }}
            >
              <SheetChip
                label="Newest"
                active={draftSort === "NEWEST"}
                onPress={() => setDraftSort("NEWEST")}
                theme={theme}
              />

              <SheetChip
                label="Oldest"
                active={draftSort === "OLDEST"}
                onPress={() => setDraftSort("OLDEST")}
                theme={theme}
              />

              <SheetChip
                label="Best P&L"
                active={draftSort === "BEST"}
                onPress={() => setDraftSort("BEST")}
                theme={theme}
              />

              <SheetChip
                label="Worst P&L"
                active={draftSort === "WORST"}
                onPress={() => setDraftSort("WORST")}
                theme={theme}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              <Pressable
                onPress={resetFilters}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  Reset
                </Text>
              </Pressable>

              <Pressable
                onPress={applyFilters}
                style={{
                  flex: 1.5,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: theme.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "800",
                  }}
                >
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SummaryMetric({
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
          fontSize: 12,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: valueColor ?? theme.text,
          fontSize: 16,
          fontWeight: "800",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: typeof Colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 40,
        paddingHorizontal: 13,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: active ? theme.primary : theme.card,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
      }}
    >
      <Text
        style={{
          color: active ? "#FFFFFF" : theme.text,
          fontSize: 13,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SheetChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: typeof Colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 15,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: active ? theme.primary : theme.card,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
      }}
    >
      <Text
        style={{
          color: active ? "#FFFFFF" : theme.text,
          fontSize: 13,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TradeMetric({
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
          color: theme.textSecondary,
          fontSize: 10,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.text,
          fontSize: 12,
          fontWeight: "700",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = {
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  } satisfies ViewStyle,

  headerContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  } satisfies ViewStyle,

  headerActions: {
    flexDirection: "row",
    gap: 7,
  } satisfies ViewStyle,

  headerButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  } satisfies ViewStyle,

  addButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 14,
  } satisfies ViewStyle,

  summaryTop: {
    flexDirection: "row",
    alignItems: "stretch",
  } satisfies ViewStyle,

  summaryMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14,
  } satisfies ViewStyle,

  summaryMetrics: {
    flexDirection: "row",
    gap: 28,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  } satisfies ViewStyle,

  exportSection: {
    width: 126,
    paddingLeft: 14,
    borderLeftWidth: 1,
    justifyContent: "center",
  } satisfies ViewStyle,

  exportButtons: {
    flexDirection: "row",
    gap: 7,
  } satisfies ViewStyle,

  exportButton: {
    width: 52,
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  exportIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  quickFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 8,
  } satisfies ViewStyle,

  resultFilters: {
    flexDirection: "row",
    flex: 1,
    gap: 7,
  } satisfies ViewStyle,

  filterButton: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  } satisfies ViewStyle,

  tradeMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  } satisfies ViewStyle,

  planContainer: {
    marginLeft: "auto",
    justifyContent: "center",
  } satisfies ViewStyle,

  sheetCloseButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 4,
  } satisfies ViewStyle,
};
