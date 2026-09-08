import { useRouter } from "expo-router";
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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJournal } from "@/store/JournalProvider";
import { useTrades } from "@/store/TradeProvider";
import { exportTradesToExcel, exportTradesToPdf } from "@/utils/exportTrades";

function ActionCard({
  icon,
  title,
  description,
  theme,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  theme: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{
        ...styles.actionCard,
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
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      <View style={styles.actionContent}>
        <Text
          style={{
            ...styles.actionTitle,
            color: theme.text,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            ...styles.actionDescription,
            color: theme.textSecondary,
          }}
        >
          {description}
        </Text>
      </View>

      <Text
        style={{
          ...styles.chevron,
          color: theme.textSecondary,
        }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
}

export default function DataBackupScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const { trades } = useTrades();
  const { entries, rules } = useJournal();

  async function handleExcelExport() {
    await exportTradesToExcel(trades);
  }

  async function handlePdfExport() {
    await exportTradesToPdf(trades);
  }

  function handleRestore() {
    Alert.alert(
      "Restore Data",
      "Local restore will be connected to the backup system in the next step.",
    );
  }

  return (
    <ScrollView
      style={{
        backgroundColor: theme.background,
      }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
          <Text
            style={{
              ...styles.backText,
              color: theme.text,
            }}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text
            style={{
              ...styles.title,
              color: theme.text,
            }}
          >
            Data & Backup
          </Text>

          <Text
            style={{
              ...styles.subtitle,
              color: theme.textSecondary,
            }}
          >
            Protect and export your TradeBook data
          </Text>
        </View>
      </View>

      <Text
        style={{
          ...styles.sectionLabel,
          color: theme.textSecondary,
        }}
      >
        AUTOMATIC BACKUP
      </Text>

      <View
        style={{
          ...styles.statusCard,
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            ...styles.statusIconBox,
            backgroundColor: theme.primaryLight,
          }}
        >
          <Text style={styles.statusIcon}>✓</Text>
        </View>

        <View style={styles.statusContent}>
          <Text
            style={{
              ...styles.statusTitle,
              color: theme.text,
            }}
          >
            Automatic backup is enabled
          </Text>

          <Text
            style={{
              ...styles.statusDescription,
              color: theme.textSecondary,
            }}
          >
            TradeBook automatically saves a local backup whenever your trades,
            journal, or playbook changes.
          </Text>
        </View>
      </View>

      <Text
        style={{
          ...styles.sectionLabel,
          color: theme.textSecondary,
        }}
      >
        RESTORE
      </Text>

      <ActionCard
        icon="↧"
        title="Restore Data"
        description="Restore TradeBook from your latest local backup"
        theme={theme}
        onPress={handleRestore}
      />

      <Text
        style={{
          ...styles.sectionLabel,
          color: theme.textSecondary,
        }}
      >
        EXPORT
      </Text>

      <ActionCard
        icon="▣"
        title="Export to Excel"
        description="Export your trades as an Excel spreadsheet"
        theme={theme}
        onPress={handleExcelExport}
      />

      <ActionCard
        icon="▤"
        title="Export to PDF"
        description="Create a readable PDF report of your trades"
        theme={theme}
        onPress={handlePdfExport}
      />

      <Text
        style={{
          ...styles.sectionLabel,
          color: theme.textSecondary,
        }}
      >
        CLOUD BACKUP
      </Text>

      <View
        style={{
          ...styles.infoCard,
          backgroundColor: theme.cardSecondary,
        }}
      >
        <Text style={styles.infoIcon}>☁️</Text>

        <View style={styles.infoContent}>
          <Text
            style={{
              ...styles.infoTitle,
              color: theme.text,
            }}
          >
            Google Drive
          </Text>

          <Text
            style={{
              ...styles.infoText,
              color: theme.textSecondary,
            }}
          >
            Automatic cloud backup will be added later. Your local backup will
            continue working without an internet connection.
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

  statusCard: {
    minHeight: 94,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  } satisfies ViewStyle,

  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  } satisfies ViewStyle,

  statusIcon: {
    fontSize: 20,
    fontWeight: "800",
  } satisfies TextStyle,

  statusContent: {
    flex: 1,
  } satisfies ViewStyle,

  statusTitle: {
    fontSize: 15,
    fontWeight: "800",
  } satisfies TextStyle,

  statusDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  } satisfies TextStyle,

  actionCard: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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

  actionContent: {
    flex: 1,
  } satisfies ViewStyle,

  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
  } satisfies TextStyle,

  actionDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  } satisfies TextStyle,

  chevron: {
    fontSize: 26,
    marginLeft: 8,
  } satisfies TextStyle,

  infoCard: {
    flexDirection: "row",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  } satisfies ViewStyle,

  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  } satisfies TextStyle,

  infoContent: {
    flex: 1,
  } satisfies ViewStyle,

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  } satisfies TextStyle,

  infoText: {
    fontSize: 12,
    lineHeight: 18,
  } satisfies TextStyle,
};
