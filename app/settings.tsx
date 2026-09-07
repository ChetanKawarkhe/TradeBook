import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SettingsScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.back()}
          style={{
            ...styles.backButton,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <Text style={{ ...styles.backText, color: theme.text }}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={{ ...styles.title, color: theme.text }}>Settings</Text>

          <Text
            style={{
              ...styles.subtitle,
              color: theme.textSecondary,
            }}
          >
            Manage your TradeBook data and preferences
          </Text>
        </View>
      </View>

      {/* Data & Backup */}
      <Text
        style={{
          ...styles.sectionLabel,
          color: theme.textSecondary,
        }}
      >
        DATA
      </Text>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => router.push("/data-backup")}
        style={{
          ...styles.optionCard,
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            ...styles.iconBox,
            backgroundColor: theme.primaryLight,
          }}
        >
          <Text style={styles.iconText}>↥</Text>
        </View>

        <View style={styles.optionContent}>
          <Text style={{ ...styles.optionTitle, color: theme.text }}>
            Data & Backup
          </Text>

          <Text
            style={{
              ...styles.optionDescription,
              color: theme.textSecondary,
            }}
          >
            Backup, restore, and export your TradeBook data
          </Text>
        </View>

        <Text style={{ ...styles.chevron, color: theme.textSecondary }}>›</Text>
      </TouchableOpacity>

      {/* Account */}
      <Text
        style={{
          ...styles.sectionLabel,
          color: theme.textSecondary,
        }}
      >
        ACCOUNT
      </Text>

      <View
        style={{
          ...styles.optionCard,
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            ...styles.iconBox,
            backgroundColor: theme.cardSecondary,
          }}
        >
          <Text style={styles.iconText}>T</Text>
        </View>

        <View style={styles.optionContent}>
          <Text style={{ ...styles.optionTitle, color: theme.text }}>
            Account
          </Text>

          <Text
            style={{
              ...styles.optionDescription,
              color: theme.textSecondary,
            }}
          >
            Google account connection will be added later
          </Text>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = {
  container: {
    padding: 20,
    paddingTop: 58,
  } satisfies ViewStyle,

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  } satisfies ViewStyle,

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  } satisfies ViewStyle,

  backText: {
    fontSize: 30,
    lineHeight: 32,
    marginTop: -3,
  } satisfies TextStyle,

  headerText: {
    flex: 1,
  } satisfies ViewStyle,

  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
  } satisfies TextStyle,

  subtitle: {
    fontSize: 12,
    marginTop: 4,
  } satisfies TextStyle,

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 9,
    marginTop: 4,
  } satisfies TextStyle,

  optionCard: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  } satisfies ViewStyle,

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  } satisfies ViewStyle,

  iconText: {
    fontSize: 18,
    fontWeight: "800",
  } satisfies TextStyle,

  optionContent: {
    flex: 1,
  } satisfies ViewStyle,

  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
  } satisfies TextStyle,

  optionDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  } satisfies TextStyle,

  chevron: {
    fontSize: 26,
    marginLeft: 8,
  } satisfies TextStyle,
};
