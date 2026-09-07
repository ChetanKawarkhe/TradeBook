import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import type { PlaybookRule } from "@/types/journal";

const CATEGORIES: PlaybookRule["category"][] = [
  "ENTRY",
  "RISK",
  "EXIT",
  "MINDSET",
];

export default function PlaybookScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const { rules, addRule, deleteRule } = useJournal();

  const { trades } = useTrades();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState<PlaybookRule["category"]>("ENTRY");

  const playbookStats = React.useMemo(() => {
    const totalTrades = trades.length;

    const followedPlan = trades.filter((trade) => trade.followedPlan).length;

    const adherenceRate =
      totalTrades > 0 ? Math.round((followedPlan / totalTrades) * 100) : 0;

    const ruleViolations = rules.map((rule) => {
      const violations = trades.filter(
        (trade) =>
          trade.ruleViolation?.trim().toLowerCase() ===
          rule.title.trim().toLowerCase(),
      ).length;

      return {
        rule,
        violations,
      };
    });

    return {
      totalTrades,
      adherenceRate,
      ruleViolations,
    };
  }, [trades, rules]);

  async function saveRule() {
    if (!title.trim()) {
      Alert.alert("Missing rule", "Give your rule a title.");
      return;
    }

    const rule: PlaybookRule = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

      title: title.trim(),

      description: description.trim(),

      category,

      active: true,

      createdAt: new Date().toISOString(),
    };

    await addRule(rule);

    setTitle("");
    setDescription("");
  }

  function removeRule(id: string) {
    Alert.alert(
      "Delete rule?",
      "This rule will be removed from your playbook.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRule(id),
        },
      ],
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
          marginBottom: 22,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: theme.cardSecondary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={21} color={theme.text} />
        </Pressable>

        <View>
          <Text
            style={{
              color: theme.text,
              fontSize: 27,
              fontWeight: "900",
            }}
          >
            Playbook
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Your rules, edge and execution checklist.
          </Text>
        </View>
      </View>

      {/* Add rule */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 17,
            fontWeight: "800",
            marginBottom: 14,
          }}
        >
          Add Rule
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 7,
          }}
        >
          Rule Title
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="i.e. Never enter without confirmation"
          placeholderTextColor={theme.textSecondary}
          style={{
            height: 48,
            borderRadius: 13,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.cardSecondary,
            color: theme.text,
            paddingHorizontal: 14,
            fontSize: 14,
            marginBottom: 14,
          }}
        />

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 7,
          }}
        >
          Category
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          {CATEGORIES.map((item) => {
            const selected = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: selected
                    ? theme.primary
                    : theme.cardSecondary,
                  borderWidth: 1,
                  borderColor: selected ? theme.primary : theme.border,
                  marginRight: 7,
                  marginBottom: 7,
                }}
              >
                <Text
                  style={{
                    color: selected ? "#FFFFFF" : theme.text,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 7,
          }}
        >
          Details
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Why does this rule matter?"
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 85,
            borderRadius: 13,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.cardSecondary,
            color: theme.text,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            marginBottom: 14,
          }}
        />

        <Pressable
          onPress={saveRule}
          style={{
            height: 50,
            borderRadius: 14,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "800",
            }}
          >
            Add to Playbook
          </Text>
        </Pressable>
      </View>
      {/* Rule Tracking */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 11,
            fontWeight: "800",
          }}
        >
          RULE TRACKING
        </Text>

        <Text
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: "900",
            marginTop: 5,
          }}
        >
          {playbookStats.adherenceRate}%
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 11,
            marginTop: 2,
          }}
        >
          Plan adherence across {playbookStats.totalTrades}{" "}
          {playbookStats.totalTrades === 1 ? "trade" : "trades"}
        </Text>

        {rules.length > 0 ? (
          <View
            style={{
              marginTop: 15,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                fontWeight: "800",
                marginBottom: 9,
              }}
            >
              Rule Violations
            </Text>

            {playbookStats.ruleViolations.map(({ rule, violations }) => (
              <View
                key={rule.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 9,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
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
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {rule.title}
                  </Text>

                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    {rule.category}
                  </Text>
                </View>

                <Text
                  style={{
                    color: violations > 0 ? theme.negative : theme.positive,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  {violations} {violations === 1 ? "violation" : "violations"}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              marginTop: 14,
              lineHeight: 17,
            }}
          >
            Add playbook rules to start tracking which rules are being violated.
          </Text>
        )}
      </View>

      {/* Rules */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
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
          <Text
            style={{
              color: theme.text,
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            My Rules
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              fontWeight: "700",
            }}
          >
            {rules.length} rules
          </Text>
        </View>

        {rules.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 30,
            }}
          >
            <Ionicons name="book-outline" size={32} color={theme.primary} />

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "700",
                marginTop: 9,
              }}
            >
              Your playbook is empty
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Turn your lessons into rules you can actually follow.
            </Text>
          </View>
        ) : (
          rules.map((rule) => (
            <View
              key={rule.id}
              style={{
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
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
                    paddingRight: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.primaryLight,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginRight: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.primary,
                          fontSize: 9,
                          fontWeight: "800",
                        }}
                      >
                        {rule.category}
                      </Text>
                    </View>

                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: "800",
                      }}
                    >
                      {rule.title}
                    </Text>
                  </View>

                  {rule.description ? (
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 12,
                        lineHeight: 18,
                      }}
                    >
                      {rule.description}
                    </Text>
                  ) : null}
                </View>

                <Pressable onPress={() => removeRule(rule.id)} hitSlop={8}>
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
