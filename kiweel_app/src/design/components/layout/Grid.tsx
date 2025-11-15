/**
 * GRID - Responsive grid layout component
 * 
 * Mobile-first responsive grid using Flexbox
 * React Native compatible (no CSS Grid)
 */

import React from 'react';
import { spacing, SpacingKey } from '../../tokens/spacing';

interface GridProps {
  children: React.ReactNode;
  columns?: number | { mobile?: number; tablet?: number; desktop?: number };
  spacing?: SpacingKey;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 2,
  spacing: spacingKey = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
  style = {},
}) => {
  // Handle responsive columns
  const getColumns = () => {
    if (typeof columns === 'number') return columns;
    // For now, use mobile columns (responsive logic can be added later)
    return columns.mobile || 2;
  };

  const columnCount = getColumns();
  const gap = spacing[spacingKey];

  const gridStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gap,
    alignItems: align === 'start' ? 'flex-start' : 
                align === 'end' ? 'flex-end' : 
                align === 'center' ? 'center' : 'stretch',
    justifyContent: justify === 'start' ? 'flex-start' :
                   justify === 'end' ? 'flex-end' :
                   justify === 'center' ? 'center' :
                   justify === 'between' ? 'space-between' :
                   justify === 'around' ? 'space-around' :
                   justify === 'evenly' ? 'space-evenly' : 'flex-start',
    ...style,
  };

  // Calculate item width accounting for gaps
  const itemWidth = `calc(${100 / columnCount}% - ${(gap * (columnCount - 1)) / columnCount}px)`;

  return (
    <div 
      className={`kiweel-grid ${className}`}
      style={gridStyle}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          style={{
            width: itemWidth,
            minWidth: 0, // Prevent flex item overflow
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

/**
 * Specialized grid variants
 */

// Two-column grid (most common on mobile)
export const TwoColumnGrid: React.FC<Omit<GridProps, 'columns'>> = (props) => (
  <Grid {...props} columns={2} />
);

// Three-column grid (for tablets/desktop)
export const ThreeColumnGrid: React.FC<Omit<GridProps, 'columns'>> = (props) => (
  <Grid {...props} columns={3} />
);

// Single column grid (for mobile lists)
export const SingleColumnGrid: React.FC<Omit<GridProps, 'columns'>> = (props) => (
  <Grid {...props} columns={1} />
);

// Responsive grid that adapts to screen size
export const ResponsiveGrid: React.FC<Omit<GridProps, 'columns'>> = (props) => (
  <Grid 
    {...props} 
    columns={{ 
      mobile: 2, 
      tablet: 3, 
      desktop: 4 
    }} 
  />
);
