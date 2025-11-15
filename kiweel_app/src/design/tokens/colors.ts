/**
 * KIWEEL MOBILE-NATIVE COLOR SYSTEM
 * 
 * HSL values converted to RGB for React Native compatibility
 * Semantic color names for consistent theming
 * Dark mode support built-in
 */

/**
 * Base color palette - RGB values for React Native
 */
export const baseColors = {
  // Kiweel Brand Colors
  green: {
    50: 'rgb(236, 253, 245)',   // Very light green
    100: 'rgb(209, 250, 229)',  // Light green
    200: 'rgb(167, 243, 208)',  // Lighter green
    300: 'rgb(110, 231, 183)',  // Light green
    400: 'rgb(52, 211, 153)',   // Medium green
    500: 'rgb(16, 185, 129)',   // Primary green #10B981
    600: 'rgb(5, 150, 105)',    // Darker green
    700: 'rgb(4, 120, 87)',     // Dark green
    800: 'rgb(6, 95, 70)',      // Very dark green
    900: 'rgb(6, 78, 59)',      // Darkest green
  },
  
  teal: {
    50: 'rgb(240, 253, 250)',   // Very light teal
    100: 'rgb(204, 251, 241)',  // Light teal
    200: 'rgb(153, 246, 228)',  // Lighter teal
    300: 'rgb(94, 234, 212)',   // Light teal
    400: 'rgb(45, 212, 191)',   // Medium teal
    500: 'rgb(20, 184, 166)',   // Primary teal #14B8A6
    600: 'rgb(13, 148, 136)',   // Darker teal
    700: 'rgb(15, 118, 110)',   // Dark teal
    800: 'rgb(17, 94, 89)',     // Very dark teal
    900: 'rgb(19, 78, 74)',     // Darkest teal
  },
  
  // Neutral colors
  gray: {
    50: 'rgb(249, 250, 251)',   // Almost white
    100: 'rgb(243, 244, 246)',  // Very light gray
    200: 'rgb(229, 231, 235)',  // Light gray
    300: 'rgb(209, 213, 219)',  // Medium light gray
    400: 'rgb(156, 163, 175)',  // Medium gray
    500: 'rgb(107, 114, 128)',  // Gray
    600: 'rgb(75, 85, 99)',     // Dark gray
    700: 'rgb(55, 65, 81)',     // Darker gray
    800: 'rgb(31, 41, 55)',     // Very dark gray
    900: 'rgb(17, 24, 39)',     // Almost black
  },
  
  // Status colors
  red: {
    50: 'rgb(254, 242, 242)',   // Very light red
    100: 'rgb(254, 226, 226)',  // Light red
    200: 'rgb(254, 202, 202)',  // Lighter red
    300: 'rgb(252, 165, 165)',  // Light red
    400: 'rgb(248, 113, 113)',  // Medium red
    500: 'rgb(239, 68, 68)',    // Primary red #EF4444
    600: 'rgb(220, 38, 38)',    // Darker red
    700: 'rgb(185, 28, 28)',    // Dark red
    800: 'rgb(153, 27, 27)',    // Very dark red
    900: 'rgb(127, 29, 29)',    // Darkest red
  },
  
  yellow: {
    50: 'rgb(255, 251, 235)',   // Very light yellow
    100: 'rgb(254, 243, 199)',  // Light yellow
    200: 'rgb(253, 230, 138)',  // Lighter yellow
    300: 'rgb(252, 211, 77)',   // Light yellow
    400: 'rgb(251, 191, 36)',   // Medium yellow
    500: 'rgb(245, 158, 11)',   // Primary yellow #F59E0B
    600: 'rgb(217, 119, 6)',    // Darker yellow
    700: 'rgb(180, 83, 9)',     // Dark yellow
    800: 'rgb(146, 64, 14)',    // Very dark yellow
    900: 'rgb(120, 53, 15)',    // Darkest yellow
  },
  
  blue: {
    50: 'rgb(239, 246, 255)',   // Very light blue
    100: 'rgb(219, 234, 254)',  // Light blue
    200: 'rgb(191, 219, 254)',  // Lighter blue
    300: 'rgb(147, 197, 253)',  // Light blue
    400: 'rgb(96, 165, 250)',   // Medium blue
    500: 'rgb(59, 130, 246)',   // Primary blue #3B82F6
    600: 'rgb(37, 99, 235)',    // Darker blue
    700: 'rgb(29, 78, 216)',    // Dark blue
    800: 'rgb(30, 64, 175)',    // Very dark blue
    900: 'rgb(30, 58, 138)',    // Darkest blue
  },
} as const;

/**
 * Semantic color tokens - Light theme
 */
export const lightColors = {
  // Background colors
  background: baseColors.gray[50],      // Main background
  surface: 'rgb(255, 255, 255)',       // Cards, modals
  surfaceVariant: baseColors.gray[100], // Secondary surfaces
  
  // Text colors
  onBackground: baseColors.gray[900],    // Primary text
  onSurface: baseColors.gray[800],       // Secondary text
  onSurfaceVariant: baseColors.gray[600], // Tertiary text
  
  // Primary colors
  primary: baseColors.green[500],        // Main brand color
  onPrimary: 'rgb(255, 255, 255)',      // Text on primary
  primaryContainer: baseColors.green[100], // Primary backgrounds
  onPrimaryContainer: baseColors.green[800], // Text on primary bg
  
  // Secondary colors
  secondary: baseColors.teal[500],       // Secondary brand color
  onSecondary: 'rgb(255, 255, 255)',    // Text on secondary
  secondaryContainer: baseColors.teal[100], // Secondary backgrounds
  onSecondaryContainer: baseColors.teal[800], // Text on secondary bg
  
  // Status colors
  error: baseColors.red[500],
  onError: 'rgb(255, 255, 255)',
  errorContainer: baseColors.red[100],
  onErrorContainer: baseColors.red[800],
  
  warning: baseColors.yellow[500],
  onWarning: 'rgb(255, 255, 255)',
  warningContainer: baseColors.yellow[100],
  onWarningContainer: baseColors.yellow[800],
  
  success: baseColors.green[500],
  onSuccess: 'rgb(255, 255, 255)',
  successContainer: baseColors.green[100],
  onSuccessContainer: baseColors.green[800],
  
  info: baseColors.blue[500],
  onInfo: 'rgb(255, 255, 255)',
  infoContainer: baseColors.blue[100],
  onInfoContainer: baseColors.blue[800],
  
  // Border and outline colors
  outline: baseColors.gray[300],
  outlineVariant: baseColors.gray[200],
  
  // Interactive states
  hover: baseColors.gray[100],
  pressed: baseColors.gray[200],
  focus: baseColors.green[500],
  disabled: baseColors.gray[300],
  onDisabled: baseColors.gray[500],
} as const;

/**
 * Semantic color tokens - Dark theme
 */
export const darkColors = {
  // Background colors
  background: baseColors.gray[900],      // Main background
  surface: baseColors.gray[800],         // Cards, modals
  surfaceVariant: baseColors.gray[700],  // Secondary surfaces
  
  // Text colors
  onBackground: baseColors.gray[100],    // Primary text
  onSurface: baseColors.gray[200],       // Secondary text
  onSurfaceVariant: baseColors.gray[400], // Tertiary text
  
  // Primary colors
  primary: baseColors.green[400],        // Lighter for dark bg
  onPrimary: baseColors.gray[900],       // Dark text on primary
  primaryContainer: baseColors.green[800], // Dark primary backgrounds
  onPrimaryContainer: baseColors.green[200], // Light text on dark primary
  
  // Secondary colors
  secondary: baseColors.teal[400],       // Lighter for dark bg
  onSecondary: baseColors.gray[900],     // Dark text on secondary
  secondaryContainer: baseColors.teal[800], // Dark secondary backgrounds
  onSecondaryContainer: baseColors.teal[200], // Light text on dark secondary
  
  // Status colors
  error: baseColors.red[400],
  onError: baseColors.gray[900],
  errorContainer: baseColors.red[800],
  onErrorContainer: baseColors.red[200],
  
  warning: baseColors.yellow[400],
  onWarning: baseColors.gray[900],
  warningContainer: baseColors.yellow[800],
  onWarningContainer: baseColors.yellow[200],
  
  success: baseColors.green[400],
  onSuccess: baseColors.gray[900],
  successContainer: baseColors.green[800],
  onSuccessContainer: baseColors.green[200],
  
  info: baseColors.blue[400],
  onInfo: baseColors.gray[900],
  infoContainer: baseColors.blue[800],
  onInfoContainer: baseColors.blue[200],
  
  // Border and outline colors
  outline: baseColors.gray[600],
  outlineVariant: baseColors.gray[700],
  
  // Interactive states
  hover: baseColors.gray[700],
  pressed: baseColors.gray[600],
  focus: baseColors.green[400],
  disabled: baseColors.gray[700],
  onDisabled: baseColors.gray[500],
} as const;

/**
 * Current theme colors (will be switched based on theme)
 */
export const colors = lightColors;

/**
 * Utility function to get colors based on theme
 */
export const getColors = (isDark: boolean = false) => {
  return isDark ? darkColors : lightColors;
};

export type ColorKey = keyof typeof colors;
export type BaseColorKey = keyof typeof baseColors;
