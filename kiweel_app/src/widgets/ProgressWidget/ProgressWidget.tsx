/**
 * PROGRESS WIDGET - Today's goals tracking
 * 
 * Mobile-first design, React Native ready
 * Modular component <200 lines
 */

import React from 'react';
import { Grid, useColors, useSpacing, useTypography } from '../../design';

interface ProgressItem {
  id: string;
  title: string;
  completed: number;
  total: number;
  icon: React.ReactNode;
  color: 'pink' | 'purple' | 'green' | 'orange';
  type: 'mood' | 'sleep' | 'diet' | 'workout';
  displayValue: string;
  briefing?: string;
  onPress?: () => void;
}

interface ProgressWidgetProps {
  items: ProgressItem[];
  className?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  items,
  className = '',
}) => {
  const { colors } = useColors();
  const { spacing } = useSpacing();
  const { typography } = useTypography();

  const CircularProgress: React.FC<{
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color: string;
  }> = ({ percentage, size = 40, strokeWidth = 4, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    const colorMap: Record<string, string> = {
      pink: '#EC4899',
      purple: '#8B5CF6',
      green: '#10B981',
      orange: '#F59E0B',
    };

    return (
      <div 
        style={{ 
          position: 'relative',
          width: size, 
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg 
          width={size} 
          height={size}
          style={{ 
            position: 'absolute',
            transform: 'rotate(-90deg)',
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.3s ease-in-out',
            }}
          />
        </svg>
        <span 
          style={{
            ...typography.caption,
            fontWeight: '700',
            color: colors.onSurface,
          }}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    );
  };

  const ProgressCard: React.FC<{ item: ProgressItem }> = ({ item }) => {
    const percentage = (item.completed / item.total) * 100;
    
    const cardStyle: React.CSSProperties = {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      border: `1px solid ${colors.outline}`,
      cursor: item.onPress ? 'pointer' : 'default',
    };

    const iconContainerStyle: React.CSSProperties = {
      padding: spacing.sm,
      borderRadius: 8,
      backgroundColor: 
        item.color === 'pink' ? '#FDF2F8' :
        item.color === 'purple' ? '#F3E8FF' :
        item.color === 'green' ? '#ECFDF5' :
        '#FEF3C7',
    };

    const iconStyle: React.CSSProperties = {
      color: 
        item.color === 'pink' ? '#EC4899' :
        item.color === 'purple' ? '#8B5CF6' :
        item.color === 'green' ? '#10B981' :
        '#F59E0B',
    };

    const buttonStyle: React.CSSProperties = {
      width: '100%',
      marginTop: spacing.sm,
      padding: `${spacing.sm}px ${spacing.md}px`,
      borderRadius: 8,
      border: `1px solid ${
        item.color === 'pink' ? '#FBCFE8' :
        item.color === 'purple' ? '#DDD6FE' :
        item.color === 'green' ? '#BBF7D0' :
        '#FDE68A'
      }`,
      backgroundColor: 'transparent',
      color: 
        item.color === 'pink' ? '#BE185D' :
        item.color === 'purple' ? '#7C3AED' :
        item.color === 'green' ? '#047857' :
        '#D97706',
      cursor: 'pointer',
      ...typography.buttonSmall,
    };

    const getButtonText = () => {
      switch (item.type) {
        case 'mood': return 'Aggiorna';
        case 'sleep': return 'Inserisci';
        case 'diet': return 'Vedi Piano';
        case 'workout': return item.displayValue.includes('riposo') ? 'Riposo' : 'Inizia';
        default: return 'Azione';
      }
    };

    return (
      <div style={cardStyle} onClick={item.onPress}>
        {/* Header with icon and progress */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}>
          <div style={iconContainerStyle}>
            <div style={iconStyle}>
              {item.icon}
            </div>
          </div>
          <CircularProgress 
            percentage={Math.round(percentage)} 
            color={item.color} 
          />
        </div>

        {/* Content */}
        <h3 style={{
          ...typography.label,
          color: colors.onSurface,
          marginBottom: spacing.xs,
        }}>
          {item.title}
        </h3>
        
        <p style={{
          ...typography.caption,
          color: colors.onSurfaceVariant,
          marginBottom: spacing.xs,
        }}>
          {item.displayValue}
        </p>
        
        {item.briefing && (
          <p style={{
            ...typography.caption,
            color: colors.onSurfaceVariant,
            marginBottom: spacing.sm,
          }}>
            {item.briefing}
          </p>
        )}

        <button style={buttonStyle}>
          {getButtonText()}
        </button>
      </div>
    );
  };

  return (
    <div className={`kiweel-progress-widget ${className}`}>
      <Grid columns={2} spacing="md">
        {items.map((item) => (
          <ProgressCard key={item.id} item={item} />
        ))}
      </Grid>
    </div>
  );
};
