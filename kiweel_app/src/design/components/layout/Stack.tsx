/**
 * STACK - Vertical layout component
 * 
 * Handles consistent vertical spacing between elements
 * React Native ready (Flexbox-based)
 */

import React from 'react';
import { spacing, SpacingKey } from '../../tokens/spacing';

interface StackProps {
  children: React.ReactNode;
  spacing?: SpacingKey;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing: spacingKey = 'md',
  align = 'stretch',
  className = '',
  style = {},
}) => {
  const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[spacingKey],
    alignItems: align === 'start' ? 'flex-start' : 
                align === 'end' ? 'flex-end' : 
                align === 'center' ? 'center' : 'stretch',
    ...style,
  };

  return (
    <div 
      className={`kiweel-stack ${className}`}
      style={stackStyle}
    >
      {children}
    </div>
  );
};

/**
 * Specialized stack variants
 */

// Tight spacing for related elements
export const TightStack: React.FC<Omit<StackProps, 'spacing'>> = (props) => (
  <Stack {...props} spacing="sm" />
);

// Loose spacing for sections
export const LooseStack: React.FC<Omit<StackProps, 'spacing'>> = (props) => (
  <Stack {...props} spacing="xl" />
);

// Center-aligned stack
export const CenterStack: React.FC<Omit<StackProps, 'align'>> = (props) => (
  <Stack {...props} align="center" />
);
