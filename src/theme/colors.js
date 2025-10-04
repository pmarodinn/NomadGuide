export const colors = {
  // Primary (Blue)
  primary: '#1565C0',
  primaryContainer: '#E3F2FD',
  primaryLight: '#42A5F5',
  primaryDark: '#0D47A1',
  
  // Secondary (Yellow/Gold)
  secondary: '#FFC107',
  secondaryContainer: '#FFF8E1',
  secondaryLight: '#FFD54F',
  secondaryDark: '#FF8F00',
  
  // Background
  background: '#F7F9FC',
  backgroundSecondary: '#FFFFFF',
  
  // Surface
  surface: '#FFFFFF',
  surfaceVariant: '#F7F9FC',
  surfaceContainer: '#F3F4F6',
  
  // Status Colors
  success: '#4CAF50',
  successContainer: '#E8F5E8',
  error: '#F44336',
  errorContainer: '#FFEBEE',
  warning: '#FF9800',
  warningContainer: '#FFF3E0',
  info: '#2196F3',
  infoContainer: '#E3F2FD',
  
  // Text
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#1C1B1F',
  
  // Neutral/Gray Scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Transparent
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  // Headlines
  headlineLarge: { 
    fontSize: 32, 
    fontWeight: '400', 
    lineHeight: 40,
    color: colors.onSurface 
  },
  headlineMedium: { 
    fontSize: 28, 
    fontWeight: '400', 
    lineHeight: 36,
    color: colors.onSurface 
  },
  headlineSmall: { 
    fontSize: 24, 
    fontWeight: '400', 
    lineHeight: 32,
    color: colors.onSurface 
  },
  
  // Titles
  titleLarge: { 
    fontSize: 22, 
    fontWeight: '500', 
    lineHeight: 28,
    color: colors.onSurface 
  },
  titleMedium: { 
    fontSize: 16, 
    fontWeight: '500', 
    lineHeight: 24,
    color: colors.onSurface 
  },
  titleSmall: { 
    fontSize: 14, 
    fontWeight: '500', 
    lineHeight: 20,
    color: colors.onSurface 
  },
  
  // Body
  bodyLarge: { 
    fontSize: 16, 
    fontWeight: '400', 
    lineHeight: 24,
    color: colors.onSurface 
  },
  bodyMedium: { 
    fontSize: 14, 
    fontWeight: '400', 
    lineHeight: 20,
    color: colors.onSurface 
  },
  bodySmall: { 
    fontSize: 12, 
    fontWeight: '400', 
    lineHeight: 16,
    color: colors.onSurfaceVariant 
  },
  
  // Labels
  labelLarge: { 
    fontSize: 14, 
    fontWeight: '500', 
    lineHeight: 20,
    color: colors.onSurface 
  },
  labelMedium: { 
    fontSize: 12, 
    fontWeight: '500', 
    lineHeight: 16,
    color: colors.onSurface 
  },
  labelSmall: { 
    fontSize: 11, 
    fontWeight: '500', 
    lineHeight: 16,
    color: colors.onSurface 
  },
};

export const elevation = {
  level0: { elevation: 0, shadowOpacity: 0 },
  level1: { 
    elevation: 1, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  level2: { 
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  level3: { 
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  level4: { 
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  level5: { 
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const layout = {
  // Container widths
  containerPadding: spacing.md,
  cardPadding: spacing.md,
  
  // Common dimensions
  buttonHeight: 48,
  inputHeight: 56,
  headerHeight: 64,
  tabBarHeight: 60,
  
  // Icon sizes
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconXxl: 48,
};
