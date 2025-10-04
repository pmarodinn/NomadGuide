import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryContainer,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.errorContainer,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    onBackground: colors.onBackground,
    outline: colors.gray300,
    outlineVariant: colors.gray200,
    inverseSurface: colors.gray800,
    inverseOnSurface: colors.gray50,
    inversePrimary: colors.primaryLight,
    shadow: colors.gray900,
    scrim: colors.overlay,
    
    // Custom colors for banking UI
    success: colors.success,
    successContainer: colors.successContainer,
    warning: colors.warning,
    warningContainer: colors.warningContainer,
    info: colors.info,
    infoContainer: colors.infoContainer,
  },
  roundness: 12,
};

export default theme;
