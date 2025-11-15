/**
 * KIWEEL MOBILE-NATIVE TYPOGRAPHY SYSTEM
 * 
 * Optimized for mobile readability
 * React Native compatible (no rem, specific font weights)
 * iOS/Android system fonts with fallbacks
 */

/**
 * Font families - System fonts for performance
 */
export const fontFamilies = {
  // Primary font stack (system fonts)
  primary: [
    '-apple-system',
    'BlinkMacSystemFont', 
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ].join(', '),
  
  // Monospace for code/data
  mono: [
    'SF Mono',
    'Monaco', 
    'Inconsolata',
    'Roboto Mono',
    'Courier New',
    'monospace'
  ].join(', '),
} as const;

/**
 * Font weights - React Native compatible values
 */
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Font sizes - Mobile-first scale
 * Base: 16px for optimal mobile readability
 */
export const fontSizes = {
  // Small text
  xs: 12,   // 0.75rem - captions, fine print
  sm: 14,   // 0.875rem - secondary text, labels
  
  // Base text
  base: 16, // 1rem - body text, buttons
  lg: 18,   // 1.125rem - large body text
  
  // Headings
  xl: 20,   // 1.25rem - h4, card titles
  xxl: 24,  // 1.5rem - h3, section titles
  xxxl: 28, // 1.75rem - h2, page titles
  xxxxl: 32, // 2rem - h1, hero titles
  
  // Display (special cases)
  display: 40, // 2.5rem - hero numbers, stats
} as const;

/**
 * Line heights - Optimized for mobile reading
 */
export const lineHeights = {
  tight: 1.2,   // Headings, titles
  normal: 1.4,  // Body text, buttons
  relaxed: 1.6, // Long-form content
  loose: 1.8,   // Special cases
} as const;

/**
 * Typography presets - Ready-to-use combinations
 */
export const typography = {
  // Display text
  hero: {
    fontSize: fontSizes.xxxxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.primary,
  },
  
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.primary,
  },
  
  // Headings
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.primary,
  },
  
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.primary,
  },
  
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  // Body text
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    fontFamily: fontFamilies.primary,
  },
  
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  // UI elements
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  // Special
  code: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.mono,
  },
} as const;

/**
 * Mobile-specific adjustments
 */
export const mobileTypography = {
  // Larger touch targets for mobile
  buttonMobile: {
    ...typography.button,
    fontSize: fontSizes.lg, // Slightly larger on mobile
  },
  
  // Better readability on small screens
  bodyMobile: {
    ...typography.body,
    lineHeight: lineHeights.relaxed, // More breathing room
  },
} as const;

export type TypographyKey = keyof typeof typography;
export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;
