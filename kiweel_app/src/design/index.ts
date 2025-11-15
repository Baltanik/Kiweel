/**
 * KIWEEL DESIGN SYSTEM
 * 
 * Centralized export for all design system components and utilities
 * Mobile-first, React Native ready
 */

// Design tokens
export * from './tokens/spacing';
export * from './tokens/typography';
export * from './tokens/colors';

// Layout components
export * from './components/layout/Container';
export * from './components/layout/Stack';
export * from './components/layout/Grid';
export * from './components/layout/ScrollView';

// Hooks
export * from './hooks/useDesignSystem';

// Re-export commonly used items for convenience
export { spacing, componentSpacing, containerSpacing } from './tokens/spacing';
export { typography, fontSizes, fontWeights } from './tokens/typography';
export { colors, lightColors, darkColors, getColors } from './tokens/colors';

export { 
  Container, 
  ScreenContainer, 
  ContentContainer, 
  FullWidthContainer 
} from './components/layout/Container';

export { 
  Stack, 
  TightStack, 
  LooseStack, 
  CenterStack 
} from './components/layout/Stack';

export { 
  Grid, 
  TwoColumnGrid, 
  ThreeColumnGrid, 
  SingleColumnGrid, 
  ResponsiveGrid 
} from './components/layout/Grid';

export { 
  ScrollView, 
  HorizontalScrollView, 
  ListScrollView 
} from './components/layout/ScrollView';

export {
  useDesignSystem,
  useSpacing,
  useTypography,
  useColors,
  useResponsive,
  useTheme,
} from './hooks/useDesignSystem';
