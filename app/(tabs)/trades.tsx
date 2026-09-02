import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, type AppTheme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import { formatCurrency } from "@/utils/trade";

export default function TradesScreen() {
  const colorScheme = useColorScheme();

  const theme: AppTheme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { trades, loading } = useTrades();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 28,
                fontWeight: "800",
              }}
            >
              Trades
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                marginTop: 3,
              }}
            >
              {trades.length} recorded trades
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/add")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {trades.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 80,
            }}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 24,
                backgroundColor: theme.primaryLight,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={32}
                color={theme.primary}
              />
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 19,
                fontWeight: "800",
              }}
            >
              No trades yet
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Record your first trade and start building your trading history.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/add")}
              style={{
                marginTop: 20,
                backgroundColor: theme.primary,
                paddingHorizontal: 22,
                paddingVertical: 13,
                borderRadius: 15,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "800",
                }}
              >
                Add First Trade
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={trades}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 30,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 13,
                        backgroundColor: theme.primaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name={
                          item.direction === "LONG" ? "arrow-up" : "arrow-down"
                        }
                        size={19}
                        color={theme.primary}
                      />
                    </View>

                    <View>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 15,
                          fontWeight: "800",
                        }}
                      >
                        {item.instrument}
                      </Text>

                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 11,
                          marginTop: 3,
                        }}
                      >
                        {item.direction} · {item.quantity}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      color: item.pnl >= 0 ? theme.positive : theme.negative,
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    {formatCurrency(item.pnl)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 14,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 11,
                    }}
                  >
                    {item.entryPrice} → {item.exitPrice}
                  </Text>

                  <Text
                    style={{
                      color: item.followedPlan
                        ? theme.positive
                        : theme.negative,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {item.followedPlan ? "✓ Plan followed" : "⚠ Plan broken"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
