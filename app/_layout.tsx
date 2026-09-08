import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/store/AuthProvider";
import { JournalProvider } from "@/store/JournalProvider";
import { TradeProvider } from "@/store/TradeProvider";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inLoginScreen = segments[0] === "login";

    if (!user && !inLoginScreen) {
      router.replace("/login");
      return;
    }

    if (user && inLoginScreen) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="trade/[id]" options={{ headerShown: false }} />

        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TradeProvider>
        <JournalProvider>
          <RootNavigation />
        </JournalProvider>
      </TradeProvider>
    </AuthProvider>
  );
}
