import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import type { JournalEntry } from "@/types/journal";
import { getTradeResultType } from "@/utils/tradeResult";

const MOODS = [
  "Calm",
  "Focused",
  "Confident",
  "Neutral",
  "Anxious",
  "Frustrated",
];

const BIASES = ["Bullish", "Bearish", "Neutral"];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  return (
    <View style={{ marginBottom: 15 }}>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 12,
          fontWeight: "700",
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
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          minHeight: multiline ? 90 : 48,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 13,
          backgroundColor: theme.cardSecondary,
          color: theme.text,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
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
        minHeight: 40,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: selected ? theme.primary : theme.cardSecondary,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
        marginRight: 8,
        marginBottom: 8,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: selected ? "#FFFFFF" : theme.text,
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function JournalScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const { editId } = useLocalSearchParams<{
    editId?: string;
  }>();

  const { entries, addEntry, deleteEntry, updateEntry, loading } = useJournal();

  const { trades } = useTrades();

  const [editing, setEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const [mood, setMood] = useState("");
  const [marketBias, setMarketBias] = useState("");

  const [plan, setPlan] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [lesson, setLesson] = useState("");
  const [notes, setNotes] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayEntry = entries.find((entry) => entry.date === today);

  const todayTrades = useMemo(
    () => trades.filter((trade) => trade.exitTime.slice(0, 10) === today),
    [trades, today],
  );

  const dailyReview = useMemo(() => {
    const pnl = todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    const followedPlan = todayTrades.filter(
      (trade) => trade.followedPlan,
    ).length;

    const goodWins = todayTrades.filter(
      (trade) => getTradeResultType(trade) === "Good Win",
    ).length;

    const badWins = todayTrades.filter(
      (trade) => getTradeResultType(trade) === "Bad Win",
    ).length;

    const goodLosses = todayTrades.filter(
      (trade) => getTradeResultType(trade) === "Good Loss",
    ).length;

    const badLosses = todayTrades.filter(
      (trade) => getTradeResultType(trade) === "Bad Loss",
    ).length;

    const planRate =
      todayTrades.length > 0
        ? Math.round((followedPlan / todayTrades.length) * 100)
        : 0;

    let message = "No trades recorded today yet.";

    if (todayTrades.length > 0) {
      if (badWins > 0) {
        message =
          "You made money, but some profitable trades came from breaking the plan.";
      } else if (badLosses > goodLosses) {
        message = "Focus on reducing rule violations and protecting your risk.";
      } else if (planRate >= 80) {
        message =
          "Strong process today. Keep protecting the plan regardless of the outcome.";
      } else {
        message =
          "Review your execution and identify one thing to improve tomorrow.";
      }
    }

    return {
      pnl,
      planRate,
      goodWins,
      badWins,
      goodLosses,
      badLosses,
      message,
    };
  }, [todayTrades]);

  function startEditing(entry: JournalEntry) {
    setEditingEntryId(entry.id);

    setMood(entry.mood ?? "");
    setMarketBias(entry.marketBias ?? "");
    setPlan(entry.plan);
    setWhatWentWell(entry.whatWentWell);
    setWhatWentWrong(entry.whatWentWrong);
    setLesson(entry.lesson);
    setNotes(entry.notes);

    setEditing(true);
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEditing(false);
        setEditingEntryId(null);
      };
    }, []),
  );

  useEffect(() => {
    if (!editId || loading) {
      return;
    }

    const entry = entries.find((item) => item.id === editId);

    if (!entry) {
      return;
    }

    startEditing(entry);
  }, [editId, loading, entries]);

  function startNewEntry() {
    setEditingEntryId(todayEntry?.id ?? null);

    setMood(todayEntry?.mood ?? "");
    setMarketBias(todayEntry?.marketBias ?? "");
    setPlan(todayEntry?.plan ?? "");
    setWhatWentWell(todayEntry?.whatWentWell ?? "");
    setWhatWentWrong(todayEntry?.whatWentWrong ?? "");
    setLesson(todayEntry?.lesson ?? "");
    setNotes(todayEntry?.notes ?? "");

    setEditing(true);
  }

  async function saveEntry() {
    if (!plan.trim() && !lesson.trim()) {
      Alert.alert("Add something first", "Write your trading plan or lesson.");
      return;
    }

    const now = new Date().toISOString();

    const existingEntry = editingEntryId
      ? entries.find((entry) => entry.id === editingEntryId)
      : undefined;

    const entry: JournalEntry = {
      id:
        existingEntry?.id ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

      date: existingEntry?.date ?? today,

      mood: mood || undefined,
      marketBias: marketBias || undefined,
      plan: plan.trim(),
      whatWentWell: whatWentWell.trim(),
      whatWentWrong: whatWentWrong.trim(),
      lesson: lesson.trim(),
      notes: notes.trim(),
      tradeIds: todayTrades.map((trade) => trade.id),

      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingEntry) {
      await updateEntry(entry);
    } else {
      await addEntry(entry);
    }

    setEditing(false);
    setEditingEntryId(null);
  }

  function removeEntry(id: string) {
    Alert.alert("Delete journal entry?", "This cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(id);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          padding: 20,
          paddingTop: 28,
        }}
      >
        <View
          style={{
            marginBottom: 22,
          }}
        >
          <View
            style={{
              width: 115,
              height: 32,
              borderRadius: 8,
              backgroundColor: theme.cardSecondary,
            }}
          />

          <View
            style={{
              width: 215,
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
            padding: 16,
            marginBottom: 16,
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
              <View
                style={{
                  width: 145,
                  height: 18,
                  borderRadius: 7,
                  backgroundColor: theme.cardSecondary,
                }}
              />

              <View
                style={{
                  width: 95,
                  height: 11,
                  borderRadius: 6,
                  backgroundColor: theme.cardSecondary,
                  marginTop: 7,
                }}
              />
            </View>

            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.cardSecondary,
              }}
            />
          </View>

          <View
            style={{
              height: 82,
              borderRadius: 14,
              backgroundColor: theme.cardSecondary,
              marginTop: 16,
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 20,
            padding: 16,
          }}
        >
          <View
            style={{
              width: 130,
              height: 17,
              borderRadius: 7,
              backgroundColor: theme.cardSecondary,
              marginBottom: 15,
            }}
          />

          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: theme.cardSecondary,
                marginBottom: 10,
              }}
            />
          ))}
        </View>

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 40,
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color={theme.primary} />

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 9,
            }}
          >
            Loading journal...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 120,
        backgroundColor: theme.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 28,
              fontWeight: "900",
            }}
          >
            Journal
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 13,
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            Think before you trade. Learn after.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/playbook")}
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            borderRadius: 22,
            backgroundColor: theme.cardSecondary,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 12,
          }}
        >
          <Ionicons name="book-outline" size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* Today's journal */}
      <View
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 15,
          }}
        >
          <View
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 17,
                fontWeight: "800",
              }}
            >
              Today's Journal
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>

          {!editing && (
            <Pressable
              onPress={startNewEntry}
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                minHeight: 44,
                borderRadius: 22,
                backgroundColor: theme.primaryLight,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 12,
              }}
            >
              <Ionicons
                name={todayEntry ? "create-outline" : "add"}
                size={21}
                color={theme.primary}
              />
            </Pressable>
          )}
        </View>

        {editing ? (
          <>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                fontWeight: "700",
                marginBottom: 7,
              }}
            >
              Mood
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {MOODS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={mood === item}
                  onPress={() => setMood(item)}
                />
              ))}
            </View>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                fontWeight: "700",
                marginBottom: 7,
              }}
            >
              Market Bias
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginBottom: 12,
              }}
            >
              {BIASES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={marketBias === item}
                  onPress={() => setMarketBias(item)}
                />
              ))}
            </View>

            <Field
              label="Today's Plan"
              value={plan}
              onChangeText={setPlan}
              placeholder="What is the plan today?"
            />

            <Field
              label="What Went Well?"
              value={whatWentWell}
              onChangeText={setWhatWentWell}
              placeholder="What did you execute correctly?"
            />

            <Field
              label="What Went Wrong?"
              value={whatWentWrong}
              onChangeText={setWhatWentWrong}
              placeholder="Where did execution break down?"
            />

            <Field
              label="Key Lesson"
              value={lesson}
              onChangeText={setLesson}
              placeholder="What will you do differently next time?"
            />

            <Field
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything else?"
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              <Pressable
                onPress={() => {
                  setEditing(false);
                  setEditingEntryId(null);
                }}
                style={{
                  height: 50,
                  minHeight: 50,
                  paddingHorizontal: 18,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.cardSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={saveEntry}
                style={{
                  flex: 1,
                  height: 50,
                  minHeight: 50,
                  borderRadius: 14,
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
                  Save Journal
                </Text>
              </Pressable>
            </View>
          </>
        ) : todayEntry ? (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {todayEntry.mood ? (
                <View
                  style={{
                    backgroundColor: theme.cardSecondary,
                    borderRadius: 999,
                    paddingHorizontal: 11,
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {todayEntry.mood}
                  </Text>
                </View>
              ) : null}

              {todayEntry.marketBias ? (
                <View
                  style={{
                    backgroundColor: theme.cardSecondary,
                    borderRadius: 999,
                    paddingHorizontal: 11,
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {todayEntry.marketBias}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              TODAY'S PLAN
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                lineHeight: 20,
                marginTop: 5,
              }}
            >
              {todayEntry.plan || "—"}
            </Text>

            {todayTrades.length > 0 ? (
              <View
                style={{
                  marginTop: 15,
                  padding: 13,
                  borderRadius: 13,
                  backgroundColor: theme.cardSecondary,
                }}
              >
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 10,
                    fontWeight: "800",
                  }}
                >
                  TODAY'S TRADES
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  {todayTrades.length}{" "}
                  {todayTrades.length === 1 ? "trade" : "trades"} recorded today
                </Text>

                <Pressable
                  onPress={() => router.push("/trades")}
                  style={{
                    minHeight: 40,
                    alignSelf: "flex-start",
                    justifyContent: "center",
                    marginTop: 5,
                  }}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    View today's trades →
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {todayEntry.lesson ? (
              <View
                style={{
                  marginTop: 15,
                  padding: 13,
                  borderRadius: 13,
                  backgroundColor: theme.primaryLight,
                }}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 10,
                    fontWeight: "800",
                  }}
                >
                  KEY LESSON
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    lineHeight: 19,
                    marginTop: 4,
                  }}
                >
                  {todayEntry.lesson}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={startNewEntry}
              style={{
                minHeight: 44,
                alignSelf: "flex-start",
                justifyContent: "center",
                marginTop: 9,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                Edit today's journal
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={startNewEntry}
            style={{
              minHeight: 120,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              borderStyle: "dashed",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="journal-outline" size={28} color={theme.primary} />

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "700",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Start today's journal
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginTop: 3,
                textAlign: "center",
              }}
            >
              Set your plan before the market moves.
            </Text>
          </Pressable>
        )}
      </View>

      {/* Daily Review */}
      {todayTrades.length > 0 ? (
        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            DAILY REVIEW
          </Text>

          <Text
            style={{
              color:
                dailyReview.pnl > 0
                  ? theme.positive
                  : dailyReview.pnl < 0
                    ? theme.primaryDark
                    : theme.text,
              fontSize: 28,
              fontWeight: "900",
              marginTop: 5,
            }}
          >
            {dailyReview.pnl >= 0 ? "+" : ""}
            {dailyReview.pnl.toFixed(2)}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Today's P&L · {todayTrades.length}{" "}
            {todayTrades.length === 1 ? "trade" : "trades"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                minWidth: "45%",
                padding: 11,
                borderRadius: 13,
                backgroundColor: theme.cardSecondary,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                PLAN ADHERENCE
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 19,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                {dailyReview.planRate}%
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: "45%",
                padding: 11,
                borderRadius: 13,
                backgroundColor: theme.cardSecondary,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                GOOD WINS
              </Text>

              <Text
                style={{
                  color: theme.positive,
                  fontSize: 19,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                {dailyReview.goodWins}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: "45%",
                padding: 11,
                borderRadius: 13,
                backgroundColor: theme.cardSecondary,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                BAD WINS
              </Text>

              <Text
                style={{
                  color: theme.primaryDark,
                  fontSize: 19,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                {dailyReview.badWins}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: "45%",
                padding: 11,
                borderRadius: 13,
                backgroundColor: theme.cardSecondary,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                LOSSES
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 19,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                {dailyReview.goodLosses + dailyReview.badLosses}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 14,
              padding: 13,
              borderRadius: 13,
              backgroundColor: theme.primaryLight,
            }}
          >
            <Text
              style={{
                color: theme.primary,
                fontSize: 10,
                fontWeight: "800",
              }}
            >
              PROCESS REVIEW
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                lineHeight: 19,
                marginTop: 4,
              }}
            >
              {dailyReview.message}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Journal history */}
      <View
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 20,
          padding: 16,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 17,
            fontWeight: "800",
            marginBottom: 12,
          }}
        >
          Journal History
        </Text>

        {entries.length === 0 ? (
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            Your previous journal entries will appear here.
          </Text>
        ) : (
          entries.slice(0, 8).map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() =>
                router.push({
                  pathname: "/journal/[id]",
                  params: { id: entry.id },
                })
              }
              style={{
                minHeight: 64,
                paddingVertical: 13,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                justifyContent: "center",
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
                    fontSize: 13,
                    fontWeight: "800",
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                >
                  {new Date(`${entry.date}T12:00:00`).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    marginLeft: 12,
                  }}
                >
                  <Pressable
                    onPress={() => startEditing(entry)}
                    hitSlop={8}
                    style={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      minHeight: 36,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={17}
                      color={theme.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => removeEntry(entry.id)}
                    hitSlop={8}
                    style={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      minHeight: 36,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {entry.lesson ? (
                <Text
                  numberOfLines={2}
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    lineHeight: 18,
                    marginTop: 2,
                    paddingRight: 8,
                  }}
                >
                  {entry.lesson}
                </Text>
              ) : null}
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}
