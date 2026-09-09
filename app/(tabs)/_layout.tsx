import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function TradeBookTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const addIndex = 2;

  const barHeight = Platform.OS === "ios" ? 78 : 68;

  return (
    <View
      style={{
        position: "absolute",

        left: 0,
        right: 0,
        bottom: 0,

        height: barHeight,
      }}
    >
      {/* Navigation surface */}
      <View
        style={{
          position: "absolute",

          left: 18,
          right: 18,
          bottom: 0,

          height: barHeight,

          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,

          backgroundColor: theme.card,

          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: theme.border,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: colorScheme === "dark" ? 0.3 : 0.08,
          shadowRadius: 12,

          elevation: 10,
        }}
      />

      {/* Navigation items */}
      <View
        style={{
          position: "absolute",

          left: 16,
          right: 16,
          bottom: 0,

          height: barHeight,

          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const focused = state.index === index;

          if (index === addIndex) {
            return (
              <View
                key={route.key}
                style={{
                  flex: 1,
                  height: "100%",

                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AddTradeButton
                  focused={focused}
                  theme={theme}
                  onPress={() => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  }}
                />
              </View>
            );
          }

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const iconName =
            route.name === "index"
              ? focused
                ? "home"
                : "home-outline"
              : route.name === "trades"
                ? focused
                  ? "swap-horizontal"
                  : "swap-horizontal-outline"
                : route.name === "analytics"
                  ? focused
                    ? "stats-chart"
                    : "stats-chart-outline"
                  : focused
                    ? "book"
                    : "book-outline";

          return (
            <TradeBookTab
              key={route.key}
              label={label}
              iconName={iconName}
              focused={focused}
              theme={theme}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TradeBookTab({
  label,
  iconName,
  focused,
  theme,
  onPress,
  onLongPress,
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.94)).current;

  const translateY = useRef(new Animated.Value(focused ? -1 : 2)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.94,

        tension: 180,
        friction: 12,

        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: focused ? -1 : 2,

        tension: 180,
        friction: 12,

        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, translateY]);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{
        selected: focused,
      }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: 1,

        height: "100%",

        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          minWidth: 58,

          height: 48,

          paddingHorizontal: 9,

          borderRadius: 16,

          alignItems: "center",
          justifyContent: "center",

          backgroundColor: focused ? theme.primaryLight : "transparent",

          transform: [
            {
              scale,
            },
            {
              translateY,
            },
          ],
        }}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={focused ? theme.primary : theme.tabIconDefault}
        />

        <Animated.Text
          style={{
            marginTop: 2,

            fontSize: 10,

            fontWeight: focused ? "800" : "600",

            color: focused ? theme.primary : theme.tabIconDefault,
          }}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

function AddTradeButton({
  focused,
  theme,
  onPress,
}: {
  focused: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(focused ? 1.04 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.04 : 1,

      tension: 180,
      friction: 10,

      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.91,

      tension: 250,
      friction: 12,

      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: focused ? 1.04 : 1,

      tension: 180,
      friction: 10,

      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add trade"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        width: 62,
        height: 62,

        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          width: 54,
          height: 54,

          borderRadius: 27,

          alignItems: "center",
          justifyContent: "center",

          backgroundColor: focused ? theme.primaryDark : theme.primary,

          borderWidth: 3,
          borderColor: theme.card,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: 3,
          },

          shadowOpacity: theme.background === "#F7F7F5" ? 0.14 : 0.28,

          shadowRadius: 6,

          elevation: 8,

          transform: [
            {
              scale,
            },
          ],
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TradeBookTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="trades"
        options={{
          title: "Trades",
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
        }}
      />
    </Tabs>
  );
}
