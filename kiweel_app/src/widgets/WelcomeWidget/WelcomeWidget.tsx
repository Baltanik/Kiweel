/**
 * WELCOME WIDGET - Hero header with greeting and stats
 * 
 * Mobile-first design, React Native ready
 * Modular component <200 lines
 */

import React from 'react';
import { Sun, Moon, Coffee, Flame, Trophy } from 'lucide-react';
import { Stack, useSpacing, useTypography } from '../../design';

interface WelcomeWidgetProps {
  userName?: string;
  dailyStreak: number;
  kiweelTokens: number;
  currentTime: Date;
  className?: string;
}

export const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({
  userName = 'Kiweer',
  dailyStreak,
  kiweelTokens,
  currentTime,
  className = '',
}) => {
  const { spacing } = useSpacing();
  const { typography } = useTypography();

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { 
      greeting: 'Buongiorno', 
      icon: <Sun size={24} style={{ color: '#FCD34D' }} /> 
    };
    if (hour < 18) return { 
      greeting: 'Buon pomeriggio', 
      icon: <Coffee size={24} style={{ color: '#F59E0B' }} /> 
    };
    return { 
      greeting: 'Buonasera', 
      icon: <Moon size={24} style={{ color: '#A855F7' }} /> 
    };
  };

  const timeOfDay = getTimeOfDay();

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #14B8A6 100%)',
    borderRadius: 16,
    padding: spacing.xl,
    color: 'white',
    overflow: 'hidden',
  };

  const decorationStyle1: React.CSSProperties = {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  };

  const decorationStyle2: React.CSSProperties = {
    position: 'absolute',
    bottom: -48,
    left: -48,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  };

  const greetingStyle: React.CSSProperties = {
    ...typography.h2,
    color: 'white',
    marginBottom: spacing.lg,
  };

  const statsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  };

  const statBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderRadius: 20,
  };

  const statTextStyle: React.CSSProperties = {
    ...typography.buttonSmall,
    color: 'white',
  };

  const timeStyle: React.CSSProperties = {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <div className={`kiweel-welcome-widget ${className}`} style={containerStyle}>
      {/* Background decorations */}
      <div style={decorationStyle1} />
      <div style={decorationStyle2} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing="lg">
          {/* Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {timeOfDay.icon}
            <h1 style={greetingStyle}>
              {timeOfDay.greeting}, {userName}!
            </h1>
          </div>
          
          {/* Stats and time */}
          <div style={statsContainerStyle}>
            {/* Daily streak */}
            <div style={statBadgeStyle}>
              <Flame size={16} style={{ color: '#FCD34D' }} />
              <span style={statTextStyle}>{dailyStreak} giorni</span>
            </div>
            
            {/* Kiweel tokens */}
            <div style={statBadgeStyle}>
              <Trophy size={16} style={{ color: '#FCD34D' }} />
              <span style={statTextStyle}>{kiweelTokens} tokens</span>
            </div>
            
            {/* Current time */}
            <div style={timeStyle}>
              {currentTime.toLocaleTimeString('it-IT', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
              })}
            </div>
          </div>
        </Stack>
      </div>
    </div>
  );
};
