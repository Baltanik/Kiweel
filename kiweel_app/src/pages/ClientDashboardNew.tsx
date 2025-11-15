/**
 * CLIENT DASHBOARD - Mobile-native redesign
 * 
 * Modular widget-based architecture
 * React Native ready, <200 lines
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Moon, Apple, Dumbbell, Activity, Users } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// New design system  
import { Stack } from '../design';
// Existing layout
import { MobileLayout } from '@/components/layout/MobileLayout';

// New widget system
import { 
  WelcomeWidget, 
  ProgressWidget, 
  QuickActionsWidget, 
  HydrationWidget 
} from '../widgets';

// Dashboard customization
import { WidgetCustomizer } from '../components/dashboard/WidgetCustomizer';
import { useWidgetConfig } from '../hooks/useWidgetConfig';

// Existing hooks and services
import { useAuth } from '@/contexts/AuthContext';
import { useDietPlans } from '@/hooks/useDietPlans';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { TokenService } from '@/integrations/tokens/tokenService';
import { supabase } from '@/integrations/supabase/client';

export default function ClientDashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Widget configuration
  const { widgetConfig } = useWidgetConfig(user?.id);
  
  // State
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayMood] = useState(7);
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [sleepHours] = useState(7.5);
  const [dailyStreak] = useState(12);
  const [kiweelTokens, setKiweelTokens] = useState(0);

  // Real-time hooks
  const { dietPlans } = useDietPlans({ clientId: user?.id, status: 'active' });
  const { workoutPlans } = useWorkoutPlans({ clientId: user?.id, status: 'active' });

  const activeDietPlan = dietPlans[0] || null;
  
  // Suppress unused variable warning
  void workoutPlans;

  // Load data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // User profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          
          // Token balance
          try {
            const balance = await TokenService.getBalance(user.id);
            setKiweelTokens(balance);
          } catch {
            setKiweelTokens(profile.kiweel_tokens || 0);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleAddWater = () => {
    if (waterGlasses < 8) {
      setWaterGlasses(prev => prev + 1);
      toast.success('💧 Bicchiere d\'acqua aggiunto!');
    }
  };

  // Data preparation
  const getCurrentMeal = () => {
    if (!activeDietPlan) {
      return {
        meal: 'Nessun piano attivo',
        description: 'Crea un piano alimentare con il tuo KIWEERIST',
        completed: 0,
        needsPlanning: true,
      };
    }

    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 10) return { meal: 'Colazione', description: 'Piano attivo', completed: 0 };
    if (hour >= 12 && hour < 15) return { meal: 'Pranzo', description: 'Piano attivo', completed: 0 };
    if (hour >= 18 && hour < 22) return { meal: 'Cena', description: 'Piano attivo', completed: 0 };
    return { meal: 'Prossimo pasto', description: 'Piano attivo', completed: 0 };
  };

  const currentMeal = getCurrentMeal();
  const isRestDay = currentTime.getDay() === 0;

  // Progress items
  const progressItems = [
    {
      id: '1',
      title: 'Come ti senti oggi?',
      completed: todayMood,
      total: 10,
      icon: <Heart size={20} />,
      color: 'pink' as const,
      type: 'mood' as const,
      displayValue: `😊 Molto Bene`,
      onPress: () => console.log('Open mood selector'),
    },
    {
      id: '2',
      title: 'Ore di sonno',
      completed: sleepHours,
      total: 8,
      icon: <Moon size={20} />,
      color: 'purple' as const,
      type: 'sleep' as const,
      displayValue: `${sleepHours}h / 8h`,
      onPress: () => console.log('Open sleep input'),
    },
    {
      id: '3',
      title: 'Dieta del giorno',
      completed: currentMeal.completed,
      total: 1,
      icon: <Apple size={20} />,
      color: 'green' as const,
      type: 'diet' as const,
      displayValue: currentMeal.meal,
      briefing: currentMeal.description,
      onPress: () => navigate('/diet'),
    },
    {
      id: '4',
      title: 'Allenamento',
      completed: isRestDay ? 1 : 0,
      total: 1,
      icon: <Dumbbell size={20} />,
      color: 'orange' as const,
      type: 'workout' as const,
      displayValue: isRestDay ? 'Giorno di riposo' : 'Da completare',
      onPress: () => navigate('/workout'),
    },
  ];

  // Quick actions
  const quickActions = [
    {
      id: '1',
      title: 'Registra Allenamento',
      icon: <Dumbbell size={20} />,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      onPress: () => navigate('/workout'),
    },
    {
      id: '2',
      title: 'Aggiungi Pasto',
      icon: <Apple size={20} />,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      onPress: () => navigate('/diet'),
    },
    {
      id: '3',
      title: 'I Miei Progressi',
      icon: <Activity size={20} />,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      onPress: () => navigate('/progress'),
    },
    {
      id: '4',
      title: 'Kiweel Feed',
      icon: <Users size={20} />,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      onPress: () => navigate('/feed'),
    },
  ];

  if (loading) {
    return (
      <MobileLayout>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          padding: '16px'
        }}>
          <p>Caricamento...</p>
        </div>
      </MobileLayout>
    );
  }

  // Render widgets based on configuration
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'welcome':
        return widgetConfig.welcome?.enabled ? (
          <WelcomeWidget
            key="welcome"
            userName={userProfile?.name}
            dailyStreak={dailyStreak}
            kiweelTokens={kiweelTokens}
            currentTime={currentTime}
          />
        ) : null;
        
      case 'progress':
        return widgetConfig.progress?.enabled ? (
          <ProgressWidget key="progress" items={progressItems} />
        ) : null;
        
      case 'quickActions':
        return widgetConfig.quickActions?.enabled ? (
          <QuickActionsWidget key="quickActions" actions={quickActions} />
        ) : null;
        
      case 'hydration':
        return widgetConfig.hydration?.enabled ? (
          <HydrationWidget
            key="hydration"
            currentGlasses={waterGlasses}
            onAddGlass={handleAddWater}
          />
        ) : null;
        
      default:
        return null;
    }
  };

  // Get enabled widgets in order
  const enabledWidgets = Object.values(widgetConfig)
    .filter(widget => widget?.enabled)
    .sort((a, b) => (a?.order || 0) - (b?.order || 0))
    .map(widget => widget?.id)
    .filter(Boolean);

  return (
    <MobileLayout>
      {/* Widget Customizer */}
      <WidgetCustomizer userId={user?.id} />
      
      <div style={{ padding: '16px' }}>
        <Stack spacing="lg">
          {enabledWidgets.map(widgetId => renderWidget(widgetId)).filter(Boolean)}
          
          {/* Fallback se nessun widget abilitato */}
          {enabledWidgets.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <p>Nessun widget abilitato.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Tocca l'icona ⚙️ per personalizzare la dashboard.
              </p>
            </div>
          )}
        </Stack>
      </div>
    </MobileLayout>
  );
}
