import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJournal } from "@/store/JournalProvider";
import { useTrades } from "@/store/TradeProvider";

export default function JournalEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { entries, deleteEntry } = useJournal();
  const { trades } = useTrades();

  const entry = entries.find((item) => item.id === id);

  const linkedTrades = entry
    ? entry.tradeIds && entry.tradeIds.length > 0
      ? trades.filter((trade) => entry.tradeIds?.includes(trade.id))
      : trades.filter((trade) => trade.exitTime.slice(0, 10) === entry.date)
    : [];

  if (!entry) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Ionicons
          name="document-text-outline"
          size={42}
          color={theme.textSecondary}
        />

        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: "800",
            marginTop: 14,
          }}
        >
          Journal entry not found
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            height: 46,
            paddingHorizontal: 20,
            borderRadius: 13,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: "800",
            }}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  function formatDate(date: string) {
    const parsed = new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function removeEntry() {
    if (!entry) {
      return;
    }

    const entryId = entry.id;

    Alert.alert(
      "Delete Journal Entry?",
      "This journal entry will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteEntry(entryId);
            router.back();
          },
        },
      ],
    );
  }
  function Section({
    title,
    icon,
    value,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
  }) {
    if (!value.trim()) {
      return null;
    }

    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <Ionicons name={icon} size={17} color={theme.primary} />

          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: "800",
            }}
          >
            {title}
          </Text>
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 14,
            lineHeight: 21,
          }}
        >
          {value}
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
      {/* Header */}
      <View
        style={{
          paddingTop: 58,
          paddingHorizontal: 18,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.background,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.cardSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </Pressable>

          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: "800",
            }}
          >
            Journal Entry
          </Text>

          <Pressable
            onPress={removeEntry}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.cardSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trash-outline" size={19} color={theme.negative} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 40,
        }}
      >
        {/* Date */}
        <View
          style={{
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 25,
              fontWeight: "900",
              letterSpacing: -0.5,
            }}
          >
            {formatDate(entry.date)}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 5,
            }}
          >
            Trading journal
          </Text>
        </View>

        {/* Mood / Bias */}
        {(entry.mood || entry.marketBias) && (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {entry.mood && (
              <View
                style={{
                  flex: 1,
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
                    fontWeight: "700",
                  }}
                >
                  MOOD
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    fontWeight: "800",
                    marginTop: 6,
                  }}
                >
                  {entry.mood}
                </Text>
              </View>
            )}

            {entry.marketBias && (
              <View
                style={{
                  flex: 1,
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
                    fontWeight: "700",
                  }}
                >
                  MARKET BIAS
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    fontWeight: "800",
                    marginTop: 6,
                  }}
                >
                  {entry.marketBias}
                </Text>
              </View>
            )}
          </View>
        )}

        <Section title="Trading Plan" icon="map-outline" value={entry.plan} />

        <Section
          title="What Went Well"
          icon="checkmark-circle-outline"
          value={entry.whatWentWell}
        />

        <Section
          title="What Went Wrong"
          icon="alert-circle-outline"
          value={entry.whatWentWrong}
        />

        <Section title="Key Lesson" icon="bulb-outline" value={entry.lesson} />

        <Section
          title="Notes"
          icon="document-text-outline"
          value={entry.notes}
        />
        {/* Linked Trades */}
        {linkedTrades.length > 0 ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={17}
                color={theme.primary}
              />

              <Text
                style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: "800",
                }}
              >
                Today's Trades
              </Text>
            </View>

            {linkedTrades.map((trade) => (
              <Pressable
                key={trade.id}
                onPress={() => router.push(`/trade/${trade.id}`)}
                style={{
                  padding: 12,
                  borderRadius: 13,
                  backgroundColor: theme.cardSecondary,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    {trade.instrument}
                  </Text>

                  <Text
                    style={{
                      color: trade.pnl >= 0 ? theme.positive : theme.negative,
                      fontSize: 13,
                      fontWeight: "800",
                    }}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnl.toFixed(2)}
                  </Text>
                </View>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  {trade.direction} · {trade.strategy || "No strategy"}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => router.push("/trades")}
              style={{
                alignSelf: "flex-start",
                marginTop: 2,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                View all trades →
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Edit */}
        <Pressable
          onPress={() => {
            router.replace({
              pathname: "/(tabs)/journal",
              params: {
                editId: entry.id,
              },
            });
          }}
          style={{
            height: 50,
            borderRadius: 14,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            marginTop: 4,
          }}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "800",
            }}
          >
            Edit Journal
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
