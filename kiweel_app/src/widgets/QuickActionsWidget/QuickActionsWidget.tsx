/**
 * QUICK ACTIONS WIDGET - Action buttons grid
 * 
 * Mobile-first design, React Native ready
 * Modular component <200 lines
 */

import React from 'react';
import { Zap } from 'lucide-react';
import { Grid, Stack, useColors, useSpacing, useTypography } from '../../design';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  onPress: () => void;
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions,
  title = 'Azioni Rapide',
  className = '',
}) => {
  const { colors } = useColors();
  const { spacing } = useSpacing();
  const { typography } = useTypography();

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    border: `1px solid ${colors.outline}`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.h3,
    color: colors.onSurface,
  };

  const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => {
    const buttonStyle: React.CSSProperties = {
      padding: spacing.lg,
      borderRadius: 12,
      background: action.gradient,
      border: 'none',
      cursor: 'pointer',
      color: 'white',
      minHeight: spacing.touchTarget * 2, // Double height for better touch
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    };

    const iconStyle: React.CSSProperties = {
      color: 'white',
    };

    const textStyle: React.CSSProperties = {
      ...typography.buttonSmall,
      color: 'white',
      textAlign: 'center',
    };

    return (
      <button
        style={buttonStyle}
        onClick={action.onPress}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        <div style={iconStyle}>
          {action.icon}
        </div>
        <span style={textStyle}>
          {action.title}
        </span>
      </button>
    );
  };

  return (
    <div className={`kiweel-quick-actions-widget ${className}`} style={containerStyle}>
      <Stack spacing="md">
        {/* Header */}
        <div style={headerStyle}>
          <Zap size={20} style={{ color: colors.primary }} />
          <h3 style={titleStyle}>{title}</h3>
        </div>

        {/* Actions grid */}
        <Grid columns={2} spacing="md">
          {actions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </Grid>
      </Stack>
    </div>
  );
};
