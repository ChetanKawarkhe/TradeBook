import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, type AppTheme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTrades } from "@/store/TradeProvider";
import type { TradeDirection } from "@/types/trade";
import { calculatePnl, formatCurrency } from "@/utils/trade";

const emotions = [
  "Calm",
  "Confident",
  "FOMO",
  "Fearful",
  "Angry",
  "Uncertain",
  "Patient",
  "Greedy",
];

const strategies = [
  "Breakout",
  "Pullback",
  "Support / Resistance",
  "Trend",
  "Reversal",
  "Price Action",
  "News",
  "Other",
];

export default function AddTradeScreen() {
  const colorScheme = useColorScheme();

  const theme: AppTheme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { addTrade } = useTrades();

  const [direction, setDirection] = useState<TradeDirection>("LONG");

  const [instrument, setInstrument] = useState("");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [fees, setFees] = useState("");

  const [strategy, setStrategy] = useState("");
  const [emotion, setEmotion] = useState("");
  const [followedPlan, setFollowedPlan] = useState(true);
  const [notes, setNotes] = useState("");

  const entry = Number(entryPrice) || 0;
  const exit = Number(exitPrice) || 0;
  const qty = Number(quantity) || 0;
  const feeValue = Number(fees) || 0;

  const pnl = calculatePnl(direction, entry, exit, qty, feeValue);

  async function handleSave() {
    if (!instrument.trim()) {
      Alert.alert("Missing instrument", "Enter the instrument name.");
      return;
    }

    if (qty <= 0) {
      Alert.alert("Invalid quantity", "Enter a valid quantity.");
      return;
    }

    if (entry <= 0 || exit <= 0) {
      Alert.alert("Invalid prices", "Enter valid entry and exit prices.");
      return;
    }

    const now = new Date().toISOString();

    await addTrade({
      id: `${Date.now()}`,
      instrument: instrument.trim().toUpperCase(),
      direction,
      quantity: qty,
      entryPrice: entry,
      exitPrice: exit,
      fees: feeValue,
      pnl,
      strategy,
      emotion,
      followedPlan,
      notes: notes.trim(),
      entryTime: now,
      exitTime: now,
    });

    // Reset the form before leaving the screen.
    setDirection("LONG");
    setInstrument("");
    setQuantity("");
    setEntryPrice("");
    setExitPrice("");
    setFees("");
    setStrategy("");
    setEmotion("");
    setFollowedPlan(true);
    setNotes("");

    Alert.alert(
      "Trade saved",
      `${formatCurrency(pnl)} recorded successfully.`,
      [
        {
          text: "Done",
          onPress: () => router.replace("/(tabs)/trades"),
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
        >
          {/* HEADER */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: theme.card,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="arrow-back" size={21} color={theme.text} />
            </TouchableOpacity>

            <View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 25,
                  fontWeight: "800",
                }}
              >
                Add Trade
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  marginTop: 3,
                }}
              >
                Record what really happened.
              </Text>
            </View>
          </View>

          {/* LONG / SHORT */}

          <View
            style={{
              flexDirection: "row",
              backgroundColor: theme.cardSecondary,
              borderRadius: 16,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {(["LONG", "SHORT"] as TradeDirection[]).map((item) => {
              const selected = direction === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setDirection(item)}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 13,
                    alignItems: "center",
                    backgroundColor: selected ? theme.primary : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : theme.textSecondary,
                      fontWeight: "800",
                      fontSize: 13,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* INSTRUMENT */}

          <Field
            label="Instrument"
            placeholder="i.e. GOLD"
            value={instrument}
            onChangeText={setInstrument}
            theme={theme}
          />

          {/* QUANTITY */}

          <Field
            label="Quantity"
            placeholder="i.e. 50"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            theme={theme}
          />

          {/* ENTRY / EXIT */}

          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Field
                label={direction === "LONG" ? "Buy Price" : "Sell Price"}
                placeholder={
                  direction === "LONG" ? "i.e. 2500.50" : "i.e. 2500.50"
                }
                value={entryPrice}
                onChangeText={setEntryPrice}
                keyboardType="decimal-pad"
                theme={theme}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Field
                label={direction === "LONG" ? "Sell Price" : "Buy Price"}
                placeholder={
                  direction === "LONG" ? "i.e. 2515.75" : "i.e. 2485.25"
                }
                value={exitPrice}
                onChangeText={setExitPrice}
                keyboardType="decimal-pad"
                theme={theme}
              />
            </View>
          </View>

          {/* FEES */}

          <Field
            label="Fees"
            placeholder="i.e. 20"
            value={fees}
            onChangeText={setFees}
            keyboardType="decimal-pad"
            theme={theme}
          />

          {/* P&L PREVIEW */}

          <View
            style={{
              backgroundColor:
                pnl >= 0 ? theme.primaryLight : theme.cardSecondary,
              borderRadius: 22,
              padding: 20,
              marginTop: 4,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              ESTIMATED P&L
            </Text>

            <Text
              style={{
                color: pnl >= 0 ? theme.positive : theme.negative,
                fontSize: 32,
                fontWeight: "800",
                marginTop: 6,
              }}
            >
              {formatCurrency(pnl)}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Updates automatically as you enter prices.
            </Text>
          </View>

          {/* STRATEGY */}

          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Strategy
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 22,
            }}
          >
            {strategies.map((item) => {
              const selected = strategy === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setStrategy(item)}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                    borderRadius: 20,
                    backgroundColor: selected ? theme.primary : theme.card,
                    borderWidth: 1,
                    borderColor: selected ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : theme.text,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* EMOTION */}

          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            How did you feel?
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 22,
            }}
          >
            {emotions.map((item) => {
              const selected = emotion === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setEmotion(item)}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                    borderRadius: 20,
                    backgroundColor: selected ? theme.primary : theme.card,
                    borderWidth: 1,
                    borderColor: selected ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : theme.text,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* PLAN */}

          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Did you follow your plan?
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <TouchableOpacity
              onPress={() => setFollowedPlan(true)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 15,
                alignItems: "center",
                backgroundColor: followedPlan ? theme.primary : theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  color: followedPlan ? "#FFFFFF" : theme.text,
                  fontWeight: "700",
                }}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFollowedPlan(false)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 15,
                alignItems: "center",
                backgroundColor: !followedPlan ? theme.negative : theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  color: !followedPlan ? "#FFFFFF" : theme.text,
                  fontWeight: "700",
                }}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {/* NOTES */}

          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Notes
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="i.e. Breakout from resistance with strong volume"
            placeholderTextColor={theme.textSecondary}
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 110,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 18,
              padding: 15,
              color: theme.text,
              fontSize: 14,
              marginBottom: 20,
            }}
          />

          {/* SAVE */}

          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 17,
              borderRadius: 18,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Save Trade
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  theme,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
  theme: AppTheme;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: theme.text,
          fontSize: 13,
          fontWeight: "700",
          marginBottom: 8,
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
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 15,
          paddingHorizontal: 15,
          paddingVertical: 13,
          color: theme.text,
          fontSize: 15,
        }}
      />
    </View>
  );
}
