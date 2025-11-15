/**
 * HYDRATION WIDGET - Water intake tracker
 * 
 * Mobile-first design, React Native ready
 * Modular component <200 lines
 */

import React from 'react';
import { Droplets } from 'lucide-react';
import { Stack, useColors, useSpacing, useTypography } from '../../design';

interface HydrationWidgetProps {
  currentGlasses: number;
  targetGlasses?: number;
  onAddGlass: () => void;
  className?: string;
}

export const HydrationWidget: React.FC<HydrationWidgetProps> = ({
  currentGlasses,
  targetGlasses = 8,
  onAddGlass,
  className = '',
}) => {
  const { colors } = useColors();
  const { spacing } = useSpacing();
  const { typography } = useTypography();

  const isCompleted = currentGlasses >= targetGlasses;
  const canAddMore = currentGlasses < targetGlasses;

  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #EBF8FF 0%, #E0F2FE 100%)',
    borderRadius: 12,
    padding: spacing.lg,
    border: '1px solid #BAE6FD',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.h3,
    color: colors.onSurface,
  };

  const counterStyle: React.CSSProperties = {
    ...typography.h2,
    color: '#0284C7',
    fontWeight: '700',
  };

  const glassesContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  };

  const glassesGridStyle: React.CSSProperties = {
    display: 'flex',
    gap: spacing.xs,
    flexWrap: 'wrap',
  };

  const glassStyle = (filled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid #0284C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: filled ? '#0284C7' : 'white',
    color: filled ? 'white' : '#0284C7',
    fontSize: 16,
    transition: 'all 0.2s ease',
  });

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#0284C7',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: `${spacing.sm}px ${spacing.md}px`,
    cursor: canAddMore ? 'pointer' : 'not-allowed',
    opacity: canAddMore ? 1 : 0.5,
    ...typography.buttonSmall,
    transition: 'all 0.2s ease',
  };

  const completionStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: spacing.sm,
    backgroundColor: '#DCFCE7',
    color: '#166534',
    borderRadius: 8,
    ...typography.bodySmall,
  };

  return (
    <div className={`kiweel-hydration-widget ${className}`} style={containerStyle}>
      <Stack spacing="md">
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleContainerStyle}>
            <Droplets size={20} style={{ color: '#0284C7' }} />
            <h3 style={titleStyle}>Idratazione</h3>
          </div>
          <div style={counterStyle}>
            {currentGlasses}/{targetGlasses}
          </div>
        </div>

        {/* Glasses visualization and button */}
        <div style={glassesContainerStyle}>
          <div style={glassesGridStyle}>
            {Array.from({ length: targetGlasses }, (_, index) => (
              <div
                key={`glass-${index}`}
                style={glassStyle(index < currentGlasses)}
              >
                💧
              </div>
            ))}
          </div>
          
          <button
            style={buttonStyle}
            onClick={onAddGlass}
            disabled={!canAddMore}
            onMouseEnter={(e) => {
              if (canAddMore) {
                e.currentTarget.style.backgroundColor = '#0369A1';
              }
            }}
            onMouseLeave={(e) => {
              if (canAddMore) {
                e.currentTarget.style.backgroundColor = '#0284C7';
              }
            }}
          >
            + Bicchiere
          </button>
        </div>

        {/* Completion message */}
        {isCompleted && (
          <div style={completionStyle}>
            🎉 Obiettivo raggiunto!
          </div>
        )}
      </Stack>
    </div>
  );
};
