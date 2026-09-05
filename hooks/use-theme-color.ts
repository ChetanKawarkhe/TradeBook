import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  const theme = useColorScheme() ?? "light";

  const colorFromProps =
    theme === "dark" ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
} 