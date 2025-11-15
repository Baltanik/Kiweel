/**
 * DESIGN SYSTEM HOOKS
 * 
 * Centralized access to design tokens
 * React Native compatible
 */

import { useMemo } from 'react';
import { spacing, componentSpacing, containerSpacing } from '../tokens/spacing';
import { typography, fontSizes, fontWeights } from '../tokens/typography';
import { colors, getColors } from '../tokens/colors';

/**
 * Main design system hook
 */
export const useDesignSystem = (isDark: boolean = false) => {
  const themeColors = useMemo(() => getColors(isDark), [isDark]);
  
  return {
    spacing,
    componentSpacing,
    containerSpacing,
    typography,
    fontSizes,
    fontWeights,
    colors: themeColors,
  };
};

/**
 * Spacing utilities hook
 */
export const useSpacing = () => {
  return {
    spacing,
    
    // Utility functions
    getSpacing: (key: keyof typeof spacing) => spacing[key],
    
    // Common spacing combinations
    cardSpacing: componentSpacing.card,
    buttonSpacing: componentSpacing.button,
    inputSpacing: componentSpacing.input,
    listSpacing: componentSpacing.list,
    
    // Container utilities
    screenPadding: containerSpacing.screenPadding,
    safeArea: containerSpacing.safeArea,
  };
};

/**
 * Typography utilities hook
 */
export const useTypography = () => {
  return {
    typography,
    fontSizes,
    fontWeights,
    
    // Utility functions
    getTypography: (key: keyof typeof typography) => typography[key],
    getFontSize: (key: keyof typeof fontSizes) => fontSizes[key],
    getFontWeight: (key: keyof typeof fontWeights) => fontWeights[key],
    
    // Style generators
    createTextStyle: (
      size: keyof typeof fontSizes,
      weight: keyof typeof fontWeights = 'normal',
      lineHeight: number = 1.4
    ) => ({
      fontSize: fontSizes[size],
      fontWeight: fontWeights[weight],
      lineHeight,
    }),
  };
};

/**
 * Colors utilities hook
 */
export const useColors = (isDark: boolean = false) => {
  const themeColors = useMemo(() => getColors(isDark), [isDark]);
  
  return {
    colors: themeColors,
    
    // Utility functions
    getColor: (key: keyof typeof colors) => themeColors[key],
    
    // Common color combinations
    primaryColors: {
      background: themeColors.primary,
      text: themeColors.onPrimary,
      container: themeColors.primaryContainer,
      onContainer: themeColors.onPrimaryContainer,
    },
    
    secondaryColors: {
      background: themeColors.secondary,
      text: themeColors.onSecondary,
      container: themeColors.secondaryContainer,
      onContainer: themeColors.onSecondaryContainer,
    },
    
    surfaceColors: {
      background: themeColors.surface,
      text: themeColors.onSurface,
      variant: themeColors.surfaceVariant,
      onVariant: themeColors.onSurfaceVariant,
    },
    
    statusColors: {
      error: themeColors.error,
      warning: themeColors.warning,
      success: themeColors.success,
      info: themeColors.info,
    },
  };
};

/**
 * Responsive utilities hook
 */
export const useResponsive = () => {
  // For now, return mobile-first utilities
  // Can be extended with actual responsive logic later
  
  return {
    isMobile: true,  // Assume mobile-first
    isTablet: false,
    isDesktop: false,
    
    // Responsive values
    getResponsiveValue: <T>(values: {
      mobile: T;
      tablet?: T;
      desktop?: T;
    }) => {
      // For now, always return mobile value
      // Can be extended with actual breakpoint detection
      return values.mobile;
    },
    
    // Responsive spacing
    getResponsiveSpacing: (key: keyof typeof spacing) => {
      return spacing[key]; // Mobile-first
    },
  };
};

/**
 * Theme utilities hook
 */
export const useTheme = () => {
  // For now, default to light theme
  // Can be extended with actual theme management
  const isDark = false;
  
  return {
    isDark,
    toggleTheme: () => {
      // Theme toggle logic would go here
      console.log('Theme toggle not implemented yet');
    },
    
    // Theme-aware utilities
    ...useDesignSystem(isDark),
  };
};
