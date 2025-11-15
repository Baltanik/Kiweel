/**
 * SCROLLVIEW - Performance-optimized scrolling container
 * 
 * Mobile-first scrolling with pull-to-refresh support
 * React Native compatible patterns
 */

import React, { useRef, useState, useCallback } from 'react';
import { spacing, SpacingKey } from '../../tokens/spacing';

interface ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;
  
  // Spacing
  padding?: SpacingKey;
  
  // Scroll behavior
  showScrollIndicator?: boolean;
  bounces?: boolean;
  
  // Pull to refresh
  refreshing?: boolean;
  onRefresh?: () => void;
  
  // Performance
  removeClippedSubviews?: boolean;
  
  // Events
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onScrollEnd?: () => void;
}

export const ScrollView: React.FC<ScrollViewProps> = ({
  children,
  className = '',
  style = {},
  contentContainerStyle = {},
  padding = 'lg',
  showScrollIndicator = true,
  bounces = true,
  refreshing = false,
  onRefresh,
  removeClippedSubviews = false,
  onScroll,
  onScrollEnd,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = event.currentTarget.scrollTop;
    setScrollY(currentScrollY);
    
    if (onScroll) {
      onScroll(event);
    }
  }, [onScroll]);

  const handleScrollEnd = useCallback(() => {
    if (onScrollEnd) {
      onScrollEnd();
    }
  }, [onScrollEnd]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Suppress unused variable warnings
  void refreshing;
  void removeClippedSubviews;
  void handleRefresh;

  const scrollViewStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
    scrollbarWidth: showScrollIndicator ? 'thin' : 'none',
    msOverflowStyle: showScrollIndicator ? 'auto' : 'none',
    
    // Hide scrollbar on WebKit browsers if needed
    ...(!showScrollIndicator && {
      '::-webkit-scrollbar': {
        display: 'none',
      },
    }),
    
    // Bounce effect simulation (limited on web)
    ...(bounces && {
      overscrollBehavior: 'contain',
    }),
    
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    padding: spacing[padding],
    minHeight: '100%',
    ...contentContainerStyle,
  };

  return (
    <div 
      ref={scrollRef}
      className={`kiweel-scroll-view ${className}`}
      style={scrollViewStyle}
      onScroll={handleScroll}
      onScrollCapture={handleScrollEnd}
    >
      {/* Pull to refresh indicator */}
      {onRefresh && (
        <div
          style={{
            position: 'absolute',
            top: -50,
            left: 0,
            right: 0,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateY(${Math.min(scrollY < 0 ? Math.abs(scrollY) : 0, 50)}px)`,
            opacity: scrollY < -20 ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: '2px solid #ccc',
              borderTop: '2px solid #333',
              borderRadius: '50%',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </div>
      )}
      
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

/**
 * Specialized scroll view variants
 */

// Horizontal scroll view
export const HorizontalScrollView: React.FC<ScrollViewProps> = (props) => (
  <ScrollView
    {...props}
    style={{
      ...props.style,
      overflowX: 'auto',
      overflowY: 'hidden',
    }}
    contentContainerStyle={{
      ...props.contentContainerStyle,
      display: 'flex',
      flexDirection: 'row',
      minWidth: '100%',
    }}
  />
);

// List scroll view with optimizations
export const ListScrollView: React.FC<ScrollViewProps> = (props) => (
  <ScrollView
    {...props}
    removeClippedSubviews={true}
    showScrollIndicator={true}
  />
);
