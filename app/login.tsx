import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/store/AuthProvider";

export default function LoginScreen() {
  const { signIn, signingIn } = useAuth();

  async function handleSignIn() {
    await signIn();
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
