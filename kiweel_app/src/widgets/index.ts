/**
 * KIWEEL WIDGET SYSTEM
 * 
 * Modular dashboard widgets
 * Mobile-first, React Native ready
 */

// Widget exports
export * from './WelcomeWidget';
export * from './ProgressWidget';
export * from './QuickActionsWidget';
export * from './HydrationWidget';

// Widget types and interfaces
export interface BaseWidget {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  title?: string;
}

export interface WidgetConfig {
  widgets: BaseWidget[];
  layout: 'single' | 'grid';
  spacing: 'tight' | 'normal' | 'loose';
}

// Widget factory types
export type WidgetType = 
  | 'welcome'
  | 'progress'
  | 'quickActions'
  | 'hydration'
  | 'activity'
  | 'sharedData';

export interface WidgetProps {
  id: string;
  className?: string;
  [key: string]: any;
}
