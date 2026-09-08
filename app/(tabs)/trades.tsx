import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";


import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJournal } from "@/store/JournalProvider";
import { useTrades } from "@/store/TradeProvider";
import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/trade";
import { getTradeResultType } from "@/utils/tradeResult";

import {
  exportTradesToExcel,
  exportTradesToPdf,
} from "@/utils/exportTrades";

type ResultFilter = "ALL" | "WINS" | "LOSSES";
type DirectionFilter = "ALL" | "LONG" | "SHORT";
type SortOption = "NEWEST" | "OLDEST" | "BEST" | "WORST";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function TradesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { trades, loading, deleteTrade, replaceTrades } = useTrades();

  const { entries, rules, replaceEntries, replaceRules } = useJournal();

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("ALL");

  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("ALL");

  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");

  const [filterOpen, setFilterOpen] = useState(false);

  // Temporary values used inside the bottom sheet.
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
          Loading trades...
        </Text>
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <View>
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

          <View
            style={{
              flexDirection: "row",
              gap: 7,
            }}
          >
            <Pressable
              onPress={()=> exportTradesToExcel(trades)}
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                paddingHorizontal: 10,
                paddingVertical: 11,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Excel
              </Text>
            </Pressable>

            <Pressable
              onPress={()=> exportTradesToPdf(trades)}
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                paddingHorizontal: 10,
                paddingVertical: 11,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                PDF
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/add")}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 13,
                paddingVertical: 11,
                borderRadius: 14,
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

        {/* Compact Summary */}
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
              color: totalPnl >= 0 ? theme.positive : theme.negative,
              fontSize: 27,
              fontWeight: "800",
              marginTop: 3,
            }}
          >
            {formatCurrency(totalPnl)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginTop: 14,
              gap: 24,
            }}
          >
            <View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                }}
              >
                Trades
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {filteredTrades.length}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                }}
              >
                Wins
              </Text>
              <Text
                style={{
                  color: theme.positive,
                  fontSize: 16,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {wins}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                }}
              >
                Losses
              </Text>
              <Text
                style={{
                  color: theme.negative,
                  fontSize: 16,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {losses}
              </Text>
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 18,
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              gap: 7,
            }}
          >
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
              borderWidth: 1,
              borderColor: activeFilterCount > 0 ? theme.primary : theme.border,
              backgroundColor:
                activeFilterCount > 0 ? theme.primaryLight : theme.card,
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
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
          <View style={{ gap: 10 }}>
            {filteredTrades.map((trade) => (
              <Pressable
                key={trade.id}
                onPress={() => goToTrade(trade)}
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                {/* Top row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      paddingRight: 10,
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
                          color: theme.text,
                          fontSize: 17,
                          fontWeight: "800",
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
                          borderRadius: 7,
                          paddingHorizontal: 7,
                          paddingVertical: 3,
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
                          }}
                        >
                          {trade.direction}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 12,
                        }}
                      >
                        {trade.strategy || "No strategy"} ·{" "}
                        {formatDate(trade.exitTime)}
                      </Text>

                      <View
                        style={{
                          backgroundColor:
                            trade.pnl > 0
                              ? trade.followedPlan
                                ? theme.primaryLight
                                : theme.cardSecondary
                              : trade.pnl < 0
                                ? trade.followedPlan
                                  ? theme.cardSecondary
                                  : theme.primaryLight
                                : theme.cardSecondary,
                          borderRadius: 7,
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              trade.pnl > 0 && trade.followedPlan
                                ? theme.positive
                                : trade.pnl < 0 && trade.followedPlan
                                  ? theme.textSecondary
                                  : trade.pnl === 0
                                    ? theme.textSecondary
                                    : theme.negative,
                            fontSize: 10,
                            fontWeight: "800",
                          }}
                        >
                          {getTradeResultType(trade)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={{
                      color: trade.pnl >= 0 ? theme.positive : theme.negative,
                      fontSize: 17,
                      fontWeight: "800",
                    }}
                  >
                    {formatCurrency(trade.pnl)}
                  </Text>
                </View>

                {/* Details */}
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 15,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    gap: 24,
                  }}
                >
                  <TradeMetric
                    label="Entry"
                    value={trade.entryPrice.toLocaleString("en-IN")}
                    theme={theme}
                  />

                  <TradeMetric
                    label="Exit"
                    value={trade.exitPrice.toLocaleString("en-IN")}
                    theme={theme}
                  />

                  <TradeMetric
                    label="Qty"
                    value={String(trade.quantity)}
                    theme={theme}
                  />

                  <View
                    style={{
                      marginLeft: "auto",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: trade.followedPlan
                          ? theme.positive
                          : theme.negative,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {trade.followedPlan ? "✓ Plan" : "✕ Plan"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
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
            {/* Handle */}
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

            {/* Sheet header */}
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

              <Pressable onPress={() => setFilterOpen(false)}>
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

            {/* Direction */}
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

            {/* Sort */}
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

            {/* Actions */}
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
