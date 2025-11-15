# 📱 KIWEEL MOBILE-NATIVE REDESIGN PLAN

**Target:** React → React Native conversion ready
**Focus:** Mobile-first, performance, modularity

## 🎯 DESIGN PRINCIPLES

### Mobile-Native First
- **Viewport:** 375px base, scale up
- **Touch targets:** Min 44px (Apple HIG)
- **Safe areas:** Notch, home indicator, status bar
- **Gestures:** Swipe, pull-to-refresh, long press
- **Performance:** 60fps, lazy loading, virtualization

### React Native Ready
- **Flexbox only** - no CSS Grid
- **Standard props** - no CSS tricks
- **Platform APIs** - haptics, notifications, camera
- **Navigation** - stack, tab, modal patterns

## 🏗️ ARCHITECTURE REFACTOR

### 1. DESIGN SYSTEM FOUNDATION
```
src/design/
├── tokens/
│   ├── spacing.ts      # 4, 8, 12, 16, 24, 32, 48px
│   ├── typography.ts   # Scale + line heights
│   ├── colors.ts       # HSL → RGB conversion
│   └── shadows.ts      # Elevation system
├── components/
│   ├── primitives/     # Button, Input, Card base
│   ├── layout/         # Container, Stack, Grid
│   └── widgets/        # Dashboard components
└── hooks/
    ├── useSpacing.ts   # Responsive spacing
    ├── useSafeArea.ts  # Safe area handling
    └── useHaptics.ts   # Feedback system
```

### 2. LAYOUT SYSTEM
```
src/layout/
├── SafeAreaProvider.tsx    # Safe area context
├── Container.tsx           # Max-width + padding
├── Stack.tsx              # Vertical spacing
├── Grid.tsx               # Responsive grid
└── ScrollView.tsx         # Performance optimized
```

### 3. DASHBOARD WIDGETS
```
src/widgets/
├── WelcomeWidget/         # Hero header
├── ProgressWidget/        # Today's goals
├── QuickActionsWidget/    # Action buttons
├── HydrationWidget/       # Water tracker
├── ActivityWidget/        # Recent activity
└── SharedDataWidget/      # Professional data
```

### 4. STATE MANAGEMENT
```
src/state/
├── dashboard/
│   ├── useDashboardData.ts    # Unified data hook
│   ├── useWidgetConfig.ts     # Widget preferences
│   └── useProgressTracking.ts # Progress state
└── global/
    ├── useUserProfile.ts      # User data
    └── useAppSettings.ts      # App preferences
```

## 📐 SPACING SYSTEM

### Base Scale (Mobile-first)
```typescript
export const spacing = {
  xs: 4,   // 0.25rem
  sm: 8,   // 0.5rem  
  md: 12,  // 0.75rem
  lg: 16,  // 1rem
  xl: 24,  // 1.5rem
  xxl: 32, // 2rem
  xxxl: 48 // 3rem
} as const;
```

### Responsive Breakpoints
```typescript
export const breakpoints = {
  mobile: 375,   // iPhone base
  tablet: 768,   // iPad portrait
  desktop: 1024  // Not primary focus
} as const;
```

## 🎨 COMPONENT PATTERNS

### Widget Structure
```typescript
interface Widget {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
  data?: any;
}
```

### Layout Patterns
```typescript
// Stack (Vertical)
<Stack spacing="lg">
  <WelcomeWidget />
  <ProgressWidget />
</Stack>

// Grid (Responsive)
<Grid columns={2} spacing="md">
  <QuickActionWidget />
  <QuickActionWidget />
</Grid>
```

## 🔄 MIGRATION STRATEGY

### Phase 1: Foundation (2 giorni)
- [ ] Design tokens setup
- [ ] Layout components
- [ ] Safe area provider
- [ ] Base widget structure

### Phase 2: Dashboard Refactor (3 giorni)
- [ ] Break ClientDashboard into widgets
- [ ] Implement widget system
- [ ] State management cleanup
- [ ] Performance optimization

### Phase 3: Polish & Testing (2 giorni)
- [ ] Animations & micro-interactions
- [ ] Gesture handling
- [ ] Performance testing
- [ ] React Native compatibility check

## 🎯 SUCCESS METRICS

### Performance
- [ ] First paint < 1s
- [ ] Smooth 60fps scrolling
- [ ] Memory usage < 100MB
- [ ] Bundle size optimized

### UX
- [ ] Touch targets ≥ 44px
- [ ] Consistent spacing system
- [ ] Intuitive gestures
- [ ] Native feel

### Code Quality
- [ ] Components < 200 lines
- [ ] Reusable widget system
- [ ] TypeScript strict mode
- [ ] React Native ready

---

**NEXT:** Start with design tokens and layout foundation
