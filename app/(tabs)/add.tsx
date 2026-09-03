import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import type { Trade, TradeDirection } from "@/types/trade";
import { calculatePnl, formatCurrency } from "@/utils/trade";

const STRATEGIES = [
  "Breakout",
  "Pullback",
  "Trend",
  "Reversal",
  "Scalp",
  "Swing",
  "Other",
];

const EMOTIONS = [
  "Calm",
  "Confident",
  "Focused",
  "Excited",
  "Fearful",
  "Greedy",
  "FOMO",
  "Frustrated",
  "Revenge",
];

const MISTAKES = [
  "None",
  "Early Entry",
  "Late Entry",
  "Oversized",
  "Moved Stop",
  "Early Exit",
  "Revenge Trade",
  "FOMO",
  "Ignored Plan",
];

const EXIT_REASONS = [
  "Target Hit",
  "Stop Loss",
  "Trailing Stop",
  "Manual Exit",
  "Time Based",
  "Invalid Setup",
];

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View style={{ marginBottom: 10 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: theme.text,
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            marginTop: 3,
            fontSize: 12,
            color: theme.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 7,
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          minHeight: multiline ? 90 : 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.cardSecondary,
          color: theme.text,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          fontSize: 15,
        }}
      />
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: selected ? theme.primary : theme.cardSecondary,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          color: selected ? "#FFFFFF" : theme.text,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {[1, 2, 3, 4, 5].map((number) => {
        const selected = number <= value;

        return (
          <Pressable
            key={number}
            onPress={() => onChange(number)}
            style={{
              width: 48,
              height: 42,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? theme.primary : theme.cardSecondary,
              borderWidth: 1,
              borderColor: selected ? theme.primary : theme.border,
            }}
          >
            <Text
              style={{
                color: selected ? "#FFFFFF" : theme.text,
                fontWeight: "700",
              }}
            >
              {number}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AddTradeScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { addTrade } = useTrades();

  const [instrument, setInstrument] = useState("");
  const [direction, setDirection] = useState<TradeDirection>("LONG");

  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [fees, setFees] = useState("");

  const [strategy, setStrategy] = useState("");
  const [setup, setSetup] = useState("");

  const [entryReason, setEntryReason] = useState("");
  const [exitReason, setExitReason] = useState("");

  const [emotion, setEmotion] = useState("");
  const [emotionBefore, setEmotionBefore] = useState("");
  const [emotionDuring, setEmotionDuring] = useState("");
  const [emotionAfter, setEmotionAfter] = useState("");

  const [confidence, setConfidence] = useState(3);
  const [stress, setStress] = useState(1);
  const [fomo, setFomo] = useState(1);

  const [followedPlan, setFollowedPlan] = useState(true);
  const [mistake, setMistake] = useState("None");
  const [ruleViolation, setRuleViolation] = useState("");

  const [riskReward, setRiskReward] = useState("");
  const [notes, setNotes] = useState("");

  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);

  const livePnl = useMemo(() => {
    const qty = Number(quantity);
    const entry = Number(entryPrice);
    const exit = Number(exitPrice);
    const fee = Number(fees || 0);

    if (
      !Number.isFinite(qty) ||
      !Number.isFinite(entry) ||
      !Number.isFinite(exit) ||
      qty <= 0 ||
      entry <= 0 ||
      exit <= 0
    ) {
      return 0;
    }

    return calculatePnl(direction, entry, exit, qty, fee);
  }, [quantity, entryPrice, exitPrice, fees, direction]);

  function resetForm() {
    setInstrument("");
    setDirection("LONG");
    setQuantity("");
    setEntryPrice("");
    setExitPrice("");
    setFees("");
    setStrategy("");
    setSetup("");
    setEntryReason("");
    setExitReason("");
    setEmotion("");
    setEmotionBefore("");
    setEmotionDuring("");
    setEmotionAfter("");
    setConfidence(3);
    setStress(1);
    setFomo(1);
    setFollowedPlan(true);
    setMistake("None");
    setRuleViolation("");
    setRiskReward("");
    setNotes("");
    setShowMore(false);
  }

  async function handleSave() {
    if (!instrument.trim()) {
      Alert.alert("Missing instrument", "Enter the instrument name.");
      return;
    }

    const qty = Number(quantity);
    const entry = Number(entryPrice);
    const exit = Number(exitPrice);
    const fee = Number(fees || 0);

    if (
      !Number.isFinite(qty) ||
      qty <= 0 ||
      !Number.isFinite(entry) ||
      entry <= 0 ||
      !Number.isFinite(exit) ||
      exit <= 0
    ) {
      Alert.alert(
        "Invalid trade",
        "Enter valid quantity, entry price and exit price.",
      );
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();

      const trade: Trade = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

        instrument: instrument.trim().toUpperCase(),
        direction,
        quantity: qty,
        entryPrice: entry,
        exitPrice: exit,
        fees: fee,

        pnl: calculatePnl(direction, entry, exit, qty, fee),

        strategy: strategy || "Other",
        setup: setup.trim() || undefined,

        entryReason: entryReason.trim() || undefined,

        exitReason: exitReason || undefined,

        emotion: emotion || emotionBefore || "Neutral",

        emotionBefore: emotionBefore || undefined,

        emotionDuring: emotionDuring || undefined,

        emotionAfter: emotionAfter || undefined,

        confidence,
        stress,
        fomo,

        followedPlan,

        ruleViolation: ruleViolation.trim() || undefined,

        mistake: mistake === "None" ? undefined : mistake,

        riskReward: riskReward.trim() ? Number(riskReward) : undefined,

        notes: notes.trim(),

        entryTime: now,
        exitTime: now,
      };

      await addTrade(trade);

      resetForm();

      // Go directly to Trades after saving
      router.replace("/(tabs)/trades");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Could not save",
        "Something went wrong while saving the trade.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 130,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
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
              Add Trade
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Log it. Learn from it.
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: theme.cardSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color={theme.text} />
          </Pressable>
        </View>

        {/* Core */}
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
          <SectionTitle title="Trade" />

          <Field
            label="Instrument"
            value={instrument}
            onChangeText={setInstrument}
            placeholder="i.e. NIFTY"
            keyboardType="default"
          />

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 7,
            }}
          >
            Direction
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {(["LONG", "SHORT"] as TradeDirection[]).map((item) => {
              const selected = direction === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setDirection(item)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected
                      ? theme.primary
                      : theme.cardSecondary,
                    borderWidth: 1,
                    borderColor: selected ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : theme.text,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {item === "LONG" ? "Buy / Long" : "Sell / Short"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="i.e. 50"
            keyboardType="numeric"
          />

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Field
                label="Entry Price"
                value={entryPrice}
                onChangeText={setEntryPrice}
                placeholder="i.e. 125.50"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Field
                label="Exit Price"
                value={exitPrice}
                onChangeText={setExitPrice}
                placeholder="i.e. 130.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Field
            label="Fees"
            value={fees}
            onChangeText={setFees}
            placeholder="i.e. 20"
            keyboardType="decimal-pad"
          />

          {/* Live P&L */}
          <View
            style={{
              borderRadius: 14,
              backgroundColor:
                livePnl >= 0 ? theme.primaryLight : theme.cardSecondary,
              padding: 14,
              marginTop: 2,
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              LIVE P&L
            </Text>

            <Text
              style={{
                color: livePnl >= 0 ? theme.positive : theme.negative,
                fontSize: 24,
                fontWeight: "800",
                marginTop: 3,
              }}
            >
              {formatCurrency(livePnl)}
            </Text>
          </View>
        </View>

        {/* Strategy */}
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
          <SectionTitle title="Setup" subtitle="What kind of trade was this?" />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {STRATEGIES.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={strategy === item}
                onPress={() => setStrategy(item)}
              />
            ))}
          </View>

          <Field
            label="Setup"
            value={setup}
            onChangeText={setSetup}
            placeholder="i.e. Opening range breakout"
          />
        </View>

        {/* Psychology */}
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
          <SectionTitle
            title="Mindset"
            subtitle="Capture what was happening mentally."
          />

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 7,
            }}
          >
            Emotion
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {EMOTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={emotion === item}
                onPress={() => setEmotion(item)}
              />
            ))}
          </View>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 7,
            }}
          >
            Emotion Before
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {EMOTIONS.slice(0, 6).map((item) => (
              <Chip
                key={item}
                label={item}
                selected={emotionBefore === item}
                onPress={() => setEmotionBefore(item)}
              />
            ))}
          </View>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 7,
            }}
          >
            Emotion During
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {EMOTIONS.slice(0, 6).map((item) => (
              <Chip
                key={item}
                label={item}
                selected={emotionDuring === item}
                onPress={() => setEmotionDuring(item)}
              />
            ))}
          </View>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 7,
            }}
          >
            Emotion After
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {EMOTIONS.slice(0, 6).map((item) => (
              <Chip
                key={item}
                label={item}
                selected={emotionAfter === item}
                onPress={() => setEmotionAfter(item)}
              />
            ))}
          </View>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Confidence
          </Text>

          <RatingSelector value={confidence} onChange={setConfidence} />

          <View style={{ height: 16 }} />

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Stress
          </Text>

          <RatingSelector value={stress} onChange={setStress} />

          <View style={{ height: 16 }} />

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            FOMO
          </Text>

          <RatingSelector value={fomo} onChange={setFomo} />
        </View>

        {/* Discipline */}
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
          <SectionTitle
            title="Discipline"
            subtitle="Separate good execution from good luck."
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 5,
              marginBottom: 12,
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
                Followed my plan
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                Was this trade executed as planned?
              </Text>
            </View>

            <Pressable
              onPress={() => setFollowedPlan(!followedPlan)}
              style={{
                width: 54,
                height: 32,
                borderRadius: 20,
                backgroundColor: followedPlan ? theme.primary : theme.border,
                padding: 3,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: "#FFFFFF",
                  alignSelf: followedPlan ? "flex-end" : "flex-start",
                }}
              />
            </Pressable>
          </View>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 7,
            }}
          >
            Mistake
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {MISTAKES.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={mistake === item}
                onPress={() => setMistake(item)}
              />
            ))}
          </View>

          {!followedPlan && (
            <Field
              label="Rule Violation"
              value={ruleViolation}
              onChangeText={setRuleViolation}
              placeholder="i.e. Entered before confirmation"
              multiline
            />
          )}
        </View>

        {/* More context */}
        <Pressable
          onPress={() => setShowMore(!showMore)}
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
              More Context
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              Entry, exit and risk details
            </Text>
          </View>

          <Ionicons
            name={showMore ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>

        {showMore && (
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
            <Field
              label="Why did you enter?"
              value={entryReason}
              onChangeText={setEntryReason}
              placeholder="i.e. Breakout with strong volume"
              multiline
            />

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 7,
              }}
            >
              Exit Reason
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {EXIT_REASONS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={exitReason === item}
                  onPress={() => setExitReason(item)}
                />
              ))}
            </View>

            <Field
              label="Risk / Reward"
              value={riskReward}
              onChangeText={setRiskReward}
              placeholder="i.e. 2"
              keyboardType="decimal-pad"
            />

            <Field
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="What should you remember about this trade?"
              multiline
            />
          </View>
        )}

        {/* Save */}
        <Pressable
          disabled={saving}
          onPress={handleSave}
          style={{
            height: 56,
            borderRadius: 16,
            backgroundColor: saving ? theme.border : theme.primary,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <Text
            style={{
              color: saving ? theme.textSecondary : "#FFFFFF",
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            {saving ? "Saving..." : "Save Trade"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
