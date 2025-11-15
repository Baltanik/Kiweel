/**
 * WIDGET CONFIGURATION HOOK
 * 
 * Gestisce personalizzazione dashboard
 * Salva preferenze utente in localStorage
 */

import { useState, useEffect } from 'react';

export interface WidgetConfig {
  id: string;
  enabled: boolean;
  order: number;
}

interface WidgetSettings {
  welcome: WidgetConfig;
  progress: WidgetConfig;
  quickActions: WidgetConfig;
  hydration: WidgetConfig;
  activity?: WidgetConfig;
  sharedData?: WidgetConfig;
}

const DEFAULT_WIDGET_CONFIG: WidgetSettings = {
  welcome: { id: 'welcome', enabled: true, order: 1 },
  progress: { id: 'progress', enabled: true, order: 2 },
  quickActions: { id: 'quickActions', enabled: true, order: 3 },
  hydration: { id: 'hydration', enabled: true, order: 4 },
  activity: { id: 'activity', enabled: false, order: 5 },
  sharedData: { id: 'sharedData', enabled: false, order: 6 },
};

export const useWidgetConfig = (userId?: string) => {
  const [widgetConfig, setWidgetConfig] = useState<WidgetSettings>(DEFAULT_WIDGET_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `kiweel_widget_config_${userId || 'default'}`;

  // Load config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWidgetConfig({ ...DEFAULT_WIDGET_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error('Error loading widget config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Save config to localStorage
  const saveConfig = (newConfig: WidgetSettings) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      setWidgetConfig(newConfig);
    } catch (error) {
      console.error('Error saving widget config:', error);
    }
  };

  // Toggle widget enabled/disabled
  const toggleWidget = (widgetId: keyof WidgetSettings) => {
    const newConfig = {
      ...widgetConfig,
      [widgetId]: {
        ...widgetConfig[widgetId],
        enabled: !widgetConfig[widgetId]?.enabled,
      },
    };
    saveConfig(newConfig);
  };

  // Update widget order
  const updateWidgetOrder = (widgetId: keyof WidgetSettings, newOrder: number) => {
    const newConfig = {
      ...widgetConfig,
      [widgetId]: {
        ...widgetConfig[widgetId],
        order: newOrder,
      },
    };
    saveConfig(newConfig);
  };

  // Get enabled widgets sorted by order
  const getEnabledWidgets = () => {
    return Object.values(widgetConfig)
      .filter(widget => widget?.enabled)
      .sort((a, b) => (a?.order || 0) - (b?.order || 0));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    saveConfig(DEFAULT_WIDGET_CONFIG);
  };

  return {
    widgetConfig,
    isLoading,
    toggleWidget,
    updateWidgetOrder,
    getEnabledWidgets,
    resetToDefaults,
    saveConfig,
  };
};
