/**
 * CONTAINER - Mobile-first responsive container
 * 
 * Handles max-width, padding, and safe areas
 * React Native ready (Flexbox-based)
 */

import React from 'react';
import { spacing, containerSpacing } from '../../tokens/spacing';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'full';
  padding?: keyof typeof spacing;
  safeArea?: boolean;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'mobile',
  padding = 'lg',
  safeArea = true,
  style = {},
}) => {
  const getMaxWidth = () => {
    if (maxWidth === 'full') return '100%';
    return containerSpacing.maxWidth[maxWidth];
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: getMaxWidth(),
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: spacing[padding],
    paddingRight: spacing[padding],
    
    // Safe area handling (mobile-first)
    ...(safeArea && {
      paddingTop: containerSpacing.safeArea.top,
      paddingBottom: containerSpacing.safeArea.bottom,
    }),
    
    ...style,
  };

  return (
    <div 
      className={`kiweel-container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

/**
 * Specialized containers for common use cases
 */

// Screen-level container with safe areas
export const ScreenContainer: React.FC<Omit<ContainerProps, 'safeArea'>> = (props) => (
  <Container {...props} safeArea={true} />
);

// Content container without safe areas (for nested use)
export const ContentContainer: React.FC<Omit<ContainerProps, 'safeArea'>> = (props) => (
  <Container {...props} safeArea={false} />
);

// Full-width container (no max-width constraint)
export const FullWidthContainer: React.FC<Omit<ContainerProps, 'maxWidth'>> = (props) => (
  <Container {...props} maxWidth="full" />
);
