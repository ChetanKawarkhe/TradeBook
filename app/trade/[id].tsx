import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { evaluateTrade } from "@/core/TraderCore";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import { formatCurrency } from "@/utils/trade";

function InfoItem({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: typeof Colors.light;
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={{ ...styles.infoLabel, color: theme.textSecondary }}>
        {label}
      </Text>

      <Text style={{ ...styles.infoValue, color: theme.text }}>{value}</Text>
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
    <Text style={{ ...styles.sectionTitle, color: theme.text }}>{title}</Text>
  );
}

export default function TradeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { trades, deleteTrade } = useTrades();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const trade = trades.find((item) => item.id === id);

  if (!trade) {
    return (
      <View
        style={{
          ...styles.notFound,
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ ...styles.notFoundTitle, color: theme.text }}>
          Trade not found
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            ...styles.backButton,
            backgroundColor: theme.primary,
          }}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const positive = trade.pnl >= 0;
  const tradeQuality = evaluateTrade(trade);

  const tradeDate = new Date(trade.exitTime || trade.entryTime);

  const resultType =
    trade.pnl >= 0
      ? trade.followedPlan
        ? "Good Win"
        : "Bad Win"
      : trade.followedPlan
        ? "Good Loss"
        : "Bad Loss";

  function handleDelete() {
    const tradeId = trade?.id;

    if (!tradeId) {
      return;
    }

    Alert.alert(
      "Delete trade?",
      "This trade will be permanently removed from your journal.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTrade(tradeId);
            router.replace("/(tabs)/trades");
          },
        },
      ],
    );
  }

  return (
    <View
      style={{
        ...styles.screen,
        backgroundColor: theme.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={{
              ...styles.headerButton,
              backgroundColor: theme.cardSecondary,
            }}
          >
            <Text
              style={{
                ...styles.headerButtonText,
                color: theme.text,
              }}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              ...styles.headerTitle,
              color: theme.text,
            }}
          >
            Trade Review
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
            style={{
              ...styles.headerButton,
              backgroundColor: theme.cardSecondary,
            }}
          >
            <Text
              style={{
                ...styles.deleteIcon,
                color: theme.negative,
              }}
            >
              ×
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View
          style={{
            ...styles.heroCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View style={styles.heroTop}>
            <View>
              <Text
                style={{
                  ...styles.instrument,
                  color: theme.text,
                }}
              >
                {trade.instrument}
              </Text>

              <Text
                style={{
                  ...styles.date,
                  color: theme.textSecondary,
                }}
              >
                {tradeDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View
              style={{
                ...styles.directionBadge,
                backgroundColor: theme.primaryLight,
              }}
            >
              <Text
                style={{
                  ...styles.directionText,
                  color: theme.primary,
                }}
              >
                {trade.direction}
              </Text>
            </View>
          </View>

          <View style={styles.heroPnl}>
            <Text
              style={{
                ...styles.pnlLabel,
                color: theme.textSecondary,
              }}
            >
              NET P&L
            </Text>

            <Text
              style={{
                ...styles.pnlValue,
                color: positive ? theme.positive : theme.negative,
              }}
            >
              {formatCurrency(trade.pnl)}
            </Text>
          </View>
        </View>

        {/* Result */}
        <View
          style={{
            ...styles.resultCard,
            backgroundColor: positive
              ? theme.primaryLight
              : theme.cardSecondary,
          }}
        >
          <View
            style={{
              ...styles.resultIcon,
              backgroundColor: "rgba(255,255,255,0.45)",
            }}
          >
            <Text
              style={{
                ...styles.resultEmoji,
                color: positive ? theme.positive : theme.negative,
              }}
            >
              {positive ? "✓" : "!"}
            </Text>
          </View>

          <View style={styles.resultContent}>
            <Text
              style={{
                ...styles.resultLabel,
                color: theme.textSecondary,
              }}
            >
              TRADE OUTCOME
            </Text>

            <Text
              style={{
                ...styles.resultTitle,
                color: positive ? theme.positive : theme.negative,
              }}
            >
              {resultType}
            </Text>
          </View>
        </View>

        {/* Trade Quality */}
        <View
          style={{
            ...styles.qualityCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text
                style={{
                  ...styles.qualitySectionTitle,
                  color: theme.text,
                }}
              >
                Trade Quality
              </Text>

              <Text
                style={{
                  ...styles.sectionSubtitle,
                  color: theme.textSecondary,
                }}
              >
                How well you executed the trade
              </Text>
            </View>

            <View style={styles.qualityScore}>
              <Text
                style={{
                  ...styles.qualityScoreText,
                  color: theme.primary,
                }}
              >
                {tradeQuality.score}
              </Text>

              <Text
                style={{
                  ...styles.qualityScoreLabel,
                  color: theme.textSecondary,
                }}
              >
                /100
              </Text>
            </View>
          </View>

          <View style={styles.qualityGradeRow}>
            <View
              style={{
                ...styles.qualityGrade,
                backgroundColor: theme.primaryLight,
              }}
            >
              <Text
                style={{
                  ...styles.qualityGradeText,
                  color: theme.primary,
                }}
              >
                {tradeQuality.grade}
              </Text>
            </View>

            <Text
              style={{
                ...styles.qualityLabel,
                color: theme.text,
              }}
            >
              {tradeQuality.label}
            </Text>
          </View>

          <View style={styles.qualityReasons}>
            {tradeQuality.reasons.map((reason) => (
              <View key={reason} style={styles.qualityReasonRow}>
                <Text
                  style={{
                    ...styles.qualityCheck,
                    color: theme.positive,
                  }}
                >
                  ✓
                </Text>

                <Text
                  style={{
                    ...styles.qualityReason,
                    color: theme.textSecondary,
                  }}
                >
                  {reason}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance */}
        <SectionTitle title="Performance" theme={theme} />

        <View
          style={{
            ...styles.infoCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View style={styles.infoRow}>
            <InfoItem
              label="Entry Price"
              value={`₹${trade.entryPrice.toLocaleString("en-IN")}`}
              theme={theme}
            />

            <InfoItem
              label="Exit Price"
              value={`₹${trade.exitPrice.toLocaleString("en-IN")}`}
              theme={theme}
            />
          </View>

          <View
            style={{
              ...styles.divider,
              backgroundColor: theme.border,
            }}
          />

          <View style={styles.infoRow}>
            <InfoItem
              label="Quantity"
              value={trade.quantity.toLocaleString("en-IN")}
              theme={theme}
            />

            <InfoItem
              label="Fees"
              value={`₹${trade.fees.toLocaleString("en-IN")}`}
              theme={theme}
            />
          </View>
        </View>

        {/* Context */}
        <SectionTitle title="Trade Context" theme={theme} />

        <View
          style={{
            ...styles.infoCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <View style={styles.infoRow}>
            <InfoItem
              label="Strategy"
              value={trade.strategy || "Not specified"}
              theme={theme}
            />

            <InfoItem
              label="Emotion"
              value={trade.emotion || "Not specified"}
              theme={theme}
            />
          </View>

          <View
            style={{
              ...styles.divider,
              backgroundColor: theme.border,
            }}
          />

          <InfoItem
            label="Plan"
            value={trade.followedPlan ? "Followed plan" : "Plan violated"}
            theme={theme}
          />
        </View>

        {/* Notes */}
        <SectionTitle title="Notes" theme={theme} />

        <View
          style={{
            ...styles.notesCard,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              ...styles.notesText,
              color: trade.notes ? theme.text : theme.textSecondary,
            }}
          >
            {trade.notes || "No notes were added to this trade."}
          </Text>
        </View>

        {/* Review */}
        <SectionTitle title="Review" theme={theme} />

        <View
          style={{
            ...styles.reviewCard,
            backgroundColor: theme.cardSecondary,
          }}
        >
          <Text
            style={{
              ...styles.reviewTitle,
              color: theme.text,
            }}
          >
            How did you trade?
          </Text>

          <Text
            style={{
              ...styles.reviewText,
              color: theme.textSecondary,
            }}
          >
            {trade.followedPlan
              ? "You followed your plan. That's a positive process signal, regardless of the P&L."
              : "You deviated from your plan. This is useful information for improving your process."}
          </Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDelete}
          style={{
            ...styles.deleteButton,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              ...styles.deleteButtonText,
              color: theme.negative,
            }}
          >
            Delete Trade
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = {
  screen: {
    flex: 1,
  } satisfies ViewStyle,

  container: {
    padding: 20,
    paddingTop: 54,
  } satisfies ViewStyle,

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  } satisfies ViewStyle,

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  headerButtonText: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
    marginTop: -3,
  } satisfies TextStyle,

  deleteIcon: {
    fontSize: 27,
    lineHeight: 29,
    fontWeight: "300",
  } satisfies TextStyle,

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
  } satisfies TextStyle,

  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    marginBottom: 12,
  } satisfies ViewStyle,

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } satisfies ViewStyle,

  instrument: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.4,
  } satisfies TextStyle,

  date: {
    fontSize: 12,
    marginTop: 4,
  } satisfies TextStyle,

  directionBadge: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  } satisfies ViewStyle,

  directionText: {
    fontSize: 11,
    fontWeight: "800",
  } satisfies TextStyle,

  heroPnl: {
    marginTop: 28,
  } satisfies ViewStyle,

  pnlLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  } satisfies TextStyle,

  pnlValue: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 5,
  } satisfies TextStyle,

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
  } satisfies ViewStyle,

  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  } satisfies ViewStyle,

  resultEmoji: {
    fontSize: 18,
    fontWeight: "900",
  } satisfies TextStyle,

  resultContent: {
    flex: 1,
  } satisfies ViewStyle,

  resultLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  } satisfies TextStyle,

  resultTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  } satisfies TextStyle,

  qualityCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
  } satisfies ViewStyle,

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } satisfies ViewStyle,

  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  } satisfies ViewStyle,

  qualitySectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  } satisfies TextStyle,

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  } satisfies TextStyle,

  qualityScore: {
    flexDirection: "row",
    alignItems: "baseline",
  } satisfies ViewStyle,

  qualityScoreText: {
    fontSize: 28,
    fontWeight: "800",
  } satisfies TextStyle,

  qualityScoreLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  } satisfies TextStyle,

  qualityGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  } satisfies ViewStyle,

  qualityGrade: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  qualityGradeText: {
    fontSize: 20,
    fontWeight: "800",
  } satisfies TextStyle,

  qualityLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  } satisfies TextStyle,

  qualityReasons: {
    marginTop: 16,
  } satisfies ViewStyle,

  qualityReasonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  } satisfies ViewStyle,

  qualityCheck: {
    width: 22,
    fontSize: 17,
    fontWeight: "900",
  } satisfies TextStyle,

  qualityReason: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    marginTop: 2,
  } satisfies TextStyle,

  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
  } satisfies ViewStyle,

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  } satisfies ViewStyle,

  infoItem: {
    flex: 1,
  } satisfies ViewStyle,

  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 5,
  } satisfies TextStyle,

  infoValue: {
    fontSize: 15,
    fontWeight: "700",
  } satisfies TextStyle,

  divider: {
    height: 1,
    marginVertical: 17,
  } satisfies ViewStyle,

  notesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
  } satisfies ViewStyle,

  notesText: {
    fontSize: 14,
    lineHeight: 21,
  } satisfies TextStyle,

  reviewCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  } satisfies ViewStyle,

  reviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 7,
  } satisfies TextStyle,

  reviewText: {
    fontSize: 13,
    lineHeight: 20,
  } satisfies TextStyle,

  deleteButton: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  deleteButtonText: {
    fontSize: 14,
    fontWeight: "800",
  } satisfies TextStyle,

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  } satisfies ViewStyle,

  notFoundTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
  } satisfies TextStyle,

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  } satisfies ViewStyle,

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  } satisfies TextStyle,
};
