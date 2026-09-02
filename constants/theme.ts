export type AppTheme = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  card: string;
  cardSecondary: string;
  border: string;

  primary: string;
  primaryDark: string;
  primaryLight: string;

  positive: string;
  negative: string;
  textSecondary: string;
};

export const Colors: Record<'light' | 'dark', AppTheme> = {
  light: {
    text: '#18181B',
    background: '#F8F8F7',
    tint: '#F97316',
    icon: '#71717A',
    tabIconDefault: '#71717A',
    tabIconSelected: '#F97316',
    card: '#FFFFFF',
    cardSecondary: '#F3F3F1',
    border: '#E4E4E7',
    primary: '#F97316',
    primaryDark: '#EA580C',
    primaryLight: '#FFF7ED',
    positive: '#16A34A',
    negative: '#DC2626',
    textSecondary: '#71717A',
  },

  dark: {
    text: '#FAFAFA',
    background: '#0D0D0E',
    tint: '#F97316',
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#F97316',
    card: '#171719',
    cardSecondary: '#202023',
    border: '#2A2A2E',
    primary: '#F97316',
    primaryDark: '#EA580C',
    primaryLight: '#7C2D12',
    positive: '#4ADE80',
    negative: '#F87171',
    textSecondary: '#A1A1AA',
  },
};

export const lightTheme = Colors.light;
export const darkTheme = Colors.dark;