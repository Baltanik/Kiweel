/**
 * KIWEEL MOBILE-NATIVE SPACING SYSTEM
 * 
 * Base scale ottimizzato per mobile-first design
 * Compatibile con React Native (no rem, solo px)
 * 
 * Usage:
 * - padding: spacing.lg
 * - gap: spacing.md
 * - margin: spacing.xl
 */

export const spacing = {
  // Micro spacing
  xs: 4,   // 0.25rem - borders, fine adjustments
  sm: 8,   // 0.5rem  - small gaps, icon spacing
  
  // Base spacing
  md: 12,  // 0.75rem - default gap between elements
  lg: 16,  // 1rem    - standard padding, margins
  
  // Large spacing
  xl: 24,  // 1.5rem  - section spacing
  xxl: 32, // 2rem    - large section gaps
  xxxl: 48, // 3rem   - page-level spacing
  
  // Special mobile spacing
  safeTop: 44,     // Status bar + notch
  safeBottom: 34,  // Home indicator
  touchTarget: 44, // Minimum touch target (Apple HIG)
  tabBar: 64,      // Bottom navigation height
} as const;

/**
 * Responsive spacing multipliers
 * Mobile-first approach: base values are for mobile
 */
export const spacingMultipliers = {
  mobile: 1,    // 375px+ (base)
  tablet: 1.25, // 768px+ (25% larger)
  desktop: 1.5, // 1024px+ (50% larger, but not primary focus)
} as const;

/**
 * Component-specific spacing
 */
export const componentSpacing = {
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    radius: 12, // React Native compatible
  },
  
  widget: {
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: spacing.touchTarget,
  },
  
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: spacing.touchTarget,
  },
  
  list: {
    itemPadding: spacing.lg,
    itemGap: spacing.sm,
    sectionGap: spacing.xl,
  },
} as const;

/**
 * Layout containers
 */
export const containerSpacing = {
  // Main content padding from screen edges
  screenPadding: 16, // spacing.lg value
  
  // Maximum content width (mobile-first)
  maxWidth: {
    mobile: '100%',
    tablet: 480,  // Centered on tablet
    desktop: 600, // Centered on desktop
  },
  
  // Safe area handling
  safeArea: {
    top: 44, // spacing.safeTop
    bottom: 34, // spacing.safeBottom
    horizontal: 16, // screenPadding
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type ComponentSpacingKey = keyof typeof componentSpacing;
