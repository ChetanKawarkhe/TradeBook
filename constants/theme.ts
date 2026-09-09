export const Colors = {
  light: {
    background: "#F7F7F5",
    card: "#FFFFFF",
    cardSecondary: "#F1F1EE",
    
    text: "#171717",
    textSecondary: "#6B6B6B",
    textMuted: "#929292",
    
    border: "#E3E3DF",
    
    primary: "#E8751A",
    primaryDark: "#C95D0B",
    primaryLight: "#FFF1E6",
    
    positive: "#16A34A",
    positiveLight: "#EAF7EE",
    
    negative: "#DC2626",
    negativeLight: "#FDECEC",
    
    warning: "#D97706",
    warningLight: "#FFF4E5",
    
    neutral: "#737373",
    neutralLight: "#F0F0F0",
    
    surface: "#FFFFFF",
    surfaceSecondary: "#F1F1EE",

    tabIconDefault: "#8A8A86",
  },
  
  dark: {
    background: "#101110",
    card: "#181A18",
    cardSecondary: "#202220",

    text: "#F5F5F3",
    textSecondary: "#B3B3AF",
    textMuted: "#777772",

    border: "#30322F",

    primary: "#F28A32",
    primaryDark: "#D86D18",
    primaryLight: "#3A2517",

    positive: "#4ADE80",
    positiveLight: "#14291B",

    negative: "#F87171",
    negativeLight: "#32191A",

    warning: "#FBBF24",
    warningLight: "#302611",

    neutral: "#A3A3A3",
    neutralLight: "#292A28",

    surface: "#181A18",
    surfaceSecondary: "#202220",

    tabIconDefault: "#8B8B86",
  },
};

export type AppTheme = typeof Colors.light;