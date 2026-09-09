import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/store/AuthProvider";
import { saveRestoredTradeBookBackup } from "@/utils/backup";
import {
  downloadGoogleDriveBackup,
  findGoogleDriveBackup,
} from "@/utils/googleDrive";

export default function LoginScreen() {
  const { signIn, signingIn } = useAuth();

  async function restoreDriveBackup() {
    try {
      const backupFile = await findGoogleDriveBackup();

      if (!backupFile) {
        router.replace("/(tabs)");
        return;
      }

      const backup = await downloadGoogleDriveBackup(backupFile.fileId);

      await saveRestoredTradeBookBackup(backup);

      Alert.alert(
        "Restore complete",
        "Your TradeBook data has been restored successfully.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );
    } catch (error) {
      console.error("Google Drive restore failed:", error);

      Alert.alert(
        "Restore failed",
        "We couldn't restore your TradeBook backup. Your existing local data has not been changed.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );
    }
  }

  async function handleSignIn() {
    const backupFound = await signIn();

    if (backupFound) {
      Alert.alert(
        "Backup found",
        "A TradeBook backup was found in your Google Drive.",
        [
          {
            text: "Restore backup",
            onPress: restoreDriveBackup,
          },
          {
            text: "Continue without restoring",
            style: "cancel",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );

      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        TradeBook
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          marginBottom: 32,
          opacity: 0.7,
        }}
      >
        Sign in to continue
      </Text>

      <TouchableOpacity
        onPress={handleSignIn}
        disabled={signingIn}
        style={{
          minWidth: 220,
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: "center",
          backgroundColor: "#111827",
          opacity: signingIn ? 0.7 : 1,
        }}
      >
        {signingIn ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text
            style={{
              color: "#ffffff",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Continue with Google
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
