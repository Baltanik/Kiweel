/**
 * WIDGET CUSTOMIZER - Dashboard personalization
 * 
 * Permette di abilitare/disabilitare widget
 * Mobile-first design
 */

import React, { useState } from 'react';
import { Settings, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useWidgetConfig } from '../../hooks/useWidgetConfig';

interface WidgetCustomizerProps {
  userId?: string;
  onConfigChange?: () => void;
}

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  userId,
  onConfigChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { widgetConfig, toggleWidget, resetToDefaults } = useWidgetConfig(userId);

  const widgetLabels = {
    welcome: 'Benvenuto',
    progress: 'Progressi Giornalieri',
    quickActions: 'Azioni Rapide',
    hydration: 'Idratazione',
    activity: 'Attività Recenti',
    sharedData: 'Dati Condivisi',
  };

  const handleToggle = (widgetId: keyof typeof widgetConfig) => {
    toggleWidget(widgetId);
    onConfigChange?.();
  };

  const handleReset = () => {
    resetToDefaults();
    onConfigChange?.();
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '80px',
          right: '16px',
          zIndex: 1000,
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Settings size={16} />
      </Button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsOpen(false)}
    >
      <Card
        style={{
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Settings size={20} />
            Personalizza Dashboard
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '16px'
          }}>
            Scegli quali widget visualizzare nella tua dashboard
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {Object.entries(widgetLabels).map(([widgetId, label]) => {
            const config = widgetConfig[widgetId as keyof typeof widgetConfig];
            const isEnabled = config?.enabled ?? false;

            return (
              <div
                key={widgetId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isEnabled ? (
                    <Eye size={16} style={{ color: '#10B981' }} />
                  ) : (
                    <EyeOff size={16} style={{ color: '#9CA3AF' }} />
                  )}
                  <span style={{ 
                    fontSize: '14px',
                    color: isEnabled ? '#000' : '#9CA3AF'
                  }}>
                    {label}
                  </span>
                </div>
                
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(widgetId as keyof typeof widgetConfig)}
                />
              </div>
            );
          })}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Fatto
          </Button>
        </div>
      </Card>
    </div>
  );
};
