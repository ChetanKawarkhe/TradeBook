import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@/store/AuthProvider";
import { useJournal } from "@/store/JournalProvider";
import { useTrades } from "@/store/TradeProvider";
import { restoreAutomaticBackup } from "@/utils/backup";
import { exportTradesToExcel, exportTradesToPdf } from "@/utils/exportTrades";

function ActionCard({
  icon,
  title,
  description,
  theme,
  onPress,
  disabled = false,
}: {
  icon: string;
  title: string;
  description: string;
  theme: typeof Colors.light;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
      style={{
        ...styles.actionCard,
        backgroundColor: theme.card,
        borderColor: theme.border,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <View
        style={{
          ...styles.iconBox,
          backgroundColor: theme.primaryLight,
        }}
      >
        <Text
          style={{
            ...styles.iconText,
            color: theme.primary,
          }}
        >
          {icon}
        </Text>
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

  const { user, signOut } = useAuth();

  const { trades, replaceTrades } = useTrades();

  const { entries, rules, replaceEntries, replaceRules } = useJournal();

  const [restoring, setRestoring] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleExcelExport() {
    await exportTradesToExcel(trades);
  }

  async function handlePdfExport() {
    await exportTradesToPdf(trades);
  }

  async function handleRestore() {
    if (restoring) {
      return;
    }

    try {
      setRestoring(true);

      const backup = await restoreAutomaticBackup();

      Alert.alert(
        "Restore Data",
        `This will replace your current data with the latest local backup.\n\nBackup contains:\n• ${backup.trades.length} trades\n• ${backup.journalEntries.length} journal entries\n• ${backup.playbookRules.length} playbook rules\n\nYour current data will be replaced. Continue?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setRestoring(false);
            },
          },
          {
            text: "Restore",
            onPress: async () => {
              try {
                await replaceTrades(backup.trades);
                await replaceEntries(backup.journalEntries);
                await replaceRules(backup.playbookRules);

                Alert.alert(
                  "Restore Complete",
                  "Your TradeBook data has been restored successfully.",
                );
              } catch (error) {
                console.error("Failed to restore TradeBook data:", error);

                Alert.alert(
                  "Restore Failed",
                  "TradeBook could not restore the backup. Your existing data may still be available.",
                );
              } finally {
                setRestoring(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to prepare TradeBook restore:", error);

      Alert.alert(
        "No Backup Found",
        "TradeBook could not find a valid local backup.",
      );

      setRestoring(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out of TradeBook?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setSigningOut(true);
            await signOut();
          } catch (error) {
            console.error("Failed to sign out:", error);

            Alert.alert(
              "Sign Out Failed",
              "TradeBook could not sign you out. Please try again.",
            );
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
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
        GOOGLE ACCOUNT
      </Text>

      <View
        style={{
          ...styles.accountCard,
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            ...styles.accountIconBox,
            backgroundColor: theme.primaryLight,
          }}
        >
          <Text
            style={{
              ...styles.accountIcon,
              color: theme.primary,
            }}
          >
            G
          </Text>
        </View>

        <View style={styles.accountContent}>
          <Text
            style={{
              ...styles.accountTitle,
              color: theme.text,
            }}
          >
            Google account connected
          </Text>

          <Text
            style={{
              ...styles.accountEmail,
              color: theme.textSecondary,
            }}
            numberOfLines={1}
          >
            {user?.user?.email ?? "Google account"}
          </Text>
        </View>

        <View
          style={{
            ...styles.connectedBadge,
            backgroundColor: theme.positiveLight,
          }}
        >
          <Text
            style={{
              ...styles.connectedBadgeText,
              color: theme.positive,
            }}
          >
            Connected
          </Text>
        </View>
      </View>

      <Text
        style={{
          ...styles.accountNote,
          color: theme.textSecondary,
        }}
      >
        Your Google account is connected. Google Drive backup authorization will
        be used for cloud backup.
      </Text>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleSignOut}
        disabled={signingOut}
        style={{
          ...styles.signOutButton,
          borderColor: theme.border,
          backgroundColor: theme.card,
          opacity: signingOut ? 0.6 : 1,
        }}
      >
        {signingOut ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Text
            style={{
              ...styles.signOutText,
              color: theme.primaryDark,
            }}
          >
            Sign Out
          </Text>
        )}
      </TouchableOpacity>

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
          <Text
            style={{
              ...styles.statusIcon,
              color: theme.primary,
            }}
          >
            ✓
          </Text>
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
        title={restoring ? "Restoring Data..." : "Restore Data"}
        description={
          restoring
            ? "Restoring your latest local TradeBook backup"
            : "Restore TradeBook from your latest local backup"
        }
        theme={theme}
        onPress={handleRestore}
        disabled={restoring}
      />

      {restoring && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.primary} />

          <Text
            style={{
              ...styles.loadingText,
              color: theme.textSecondary,
            }}
          >
            Restoring your data...
          </Text>
        </View>
      )}

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
        <Text
          style={{
            ...styles.infoIcon,
            color: theme.primary,
          }}
        >
          ☁
        </Text>

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
            Your TradeBook backup is automatically synced to Google Drive when
            your data changes. You can restore your latest cloud backup when
            signing in.
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

  accountCard: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  } satisfies ViewStyle,

  accountIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  } satisfies ViewStyle,

  accountIcon: {
    fontSize: 20,
    fontWeight: "800",
  } satisfies TextStyle,

  accountContent: {
    flex: 1,
    minWidth: 0,
  } satisfies ViewStyle,

  accountTitle: {
    fontSize: 14,
    fontWeight: "800",
  } satisfies TextStyle,

  accountEmail: {
    fontSize: 12,
    marginTop: 4,
  } satisfies TextStyle,

  connectedBadge: {
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 8,
  } satisfies ViewStyle,

  connectedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  } satisfies TextStyle,

  accountNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  } satisfies TextStyle,

  signOutButton: {
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  } satisfies ViewStyle,

  signOutText: {
    fontSize: 13,
    fontWeight: "800",
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

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
    paddingHorizontal: 4,
  } satisfies ViewStyle,

  loadingText: {
    fontSize: 12,
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
