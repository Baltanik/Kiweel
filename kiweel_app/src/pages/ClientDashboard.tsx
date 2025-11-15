import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KiweelLayout } from "@/components/layout/KiweelLayout";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import {
  Heart,
  Flame,
  Zap,
  Droplets,
  Activity,
  Trophy,
  Sun,
  Moon,
  Coffee,
  Apple,
  Dumbbell,
  Users,
  MessageCircle,
  ChevronRight,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSharedData } from "@/hooks/useSharedData";
import { useDietPlans } from "@/hooks/useDietPlans";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { TokenService } from "@/integrations/tokens/tokenService";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayMood, setTodayMood] = useState(7);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showSleepInput, setShowSleepInput] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [kiweelTokens, setKiweelTokens] = useState(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  
  // Use real-time hooks
  const { sharedData: allSharedData } = useSharedData({ clientId: user?.id });
  const { dietPlans } = useDietPlans({ clientId: user?.id, status: "active" });
  const { workoutPlans } = useWorkoutPlans({ clientId: user?.id, status: "active" });
  
  const activeDietPlan = dietPlans[0] || null;
  const activeWorkoutPlan = workoutPlans[0] || null;
  const recentSharedData = allSharedData.slice(0, 3);

  // Fetch user profile and data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);
        
        // Fetch token balance using TokenService
        try {
          const balance = await TokenService.getBalance(user.id);
          setKiweelTokens(balance);
        } catch (tokenError) {
          console.error("Error fetching token balance:", tokenError);
          setKiweelTokens(profile.kiweel_tokens || 0);
        }

        // Fetch recent posts from Kiweel Feed
        const { data: posts } = await supabase
          .from("professional_posts")
          .select("*, professionals(title, users(name))")
          .order("created_at", { ascending: false })
          .limit(3);

        if (posts) setRecentPosts(posts);
        
        // Diet plans, workout plans, and shared data are now handled by real-time hooks

        // Calculate daily streak (simplified - would need proper logic)
        setDailyStreak(12); // TODO: Calculate from progress_tracking

        // Fetch today's progress data
        const today = new Date().toISOString().split("T")[0];
        const { data: todayProgress } = await supabase
          .from("progress_tracking")
          .select("*")
          .eq("client_id", user.id)
          .eq("tracking_date", today)
          .single();

        if (todayProgress) {
          if (todayProgress.mood !== null) setTodayMood(parseInt(todayProgress.mood) || 0);
          // Note: sleep_hours and water_glasses not in progress_tracking table
          // These will be tracked separately or added to schema later
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: "Buongiorno", icon: <Sun className="text-yellow-500" size={24} /> };
    if (hour < 18) return { greeting: "Buon pomeriggio", icon: <Coffee className="text-amber-500" size={24} /> };
    return { greeting: "Buonasera", icon: <Moon className="text-purple-500" size={24} /> };
  };

  const moodScale = [
    { value: 0, emoji: "😭", label: "Pessimo", color: "from-red-600 to-red-800" },
    { value: 1, emoji: "😢", label: "Molto Male", color: "from-red-500 to-red-700" },
    { value: 2, emoji: "😞", label: "Male", color: "from-red-400 to-red-600" },
    { value: 3, emoji: "😕", label: "Non Bene", color: "from-orange-500 to-red-500" },
    { value: 4, emoji: "😐", label: "Così Così", color: "from-orange-400 to-orange-600" },
    { value: 5, emoji: "🙂", label: "Normale", color: "from-yellow-400 to-orange-500" },
    { value: 6, emoji: "😊", label: "Bene", color: "from-yellow-300 to-yellow-500" },
    { value: 7, emoji: "😄", label: "Molto Bene", color: "from-green-400 to-yellow-400" },
    { value: 8, emoji: "😁", label: "Ottimo", color: "from-green-500 to-green-400" },
    { value: 9, emoji: "🤩", label: "Fantastico", color: "from-green-600 to-green-500" },
    { value: 10, emoji: "🚀", label: "Al Top!", color: "from-green-700 to-green-600" },
  ];

  const isRestDay = currentTime.getDay() === 0;

  const getCurrentMeal = () => {
    if (!activeDietPlan) {
      return {
        meal: "Nessun piano attivo",
        description: "Crea un piano alimentare con il tuo KIWEERIST",
        completed: 0,
        needsPlanning: true,
      };
    }

    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 10) {
      return { meal: "Colazione", description: "Piano attivo", completed: 0, needsPlanning: false };
    } else if (hour >= 12 && hour < 15) {
      return { meal: "Pranzo", description: "Piano attivo", completed: 0, needsPlanning: false };
    } else if (hour >= 18 && hour < 22) {
      return { meal: "Cena", description: "Piano attivo", completed: 0, needsPlanning: false };
    }
    return { meal: "Prossimo pasto", description: "Piano attivo", completed: 0, needsPlanning: false };
  };

  const currentMeal = getCurrentMeal();

  const todaysGoals = [
    {
      id: 1,
      title: "Come ti senti oggi?",
      completed: todayMood,
      total: 10,
      icon: <Heart size={20} />,
      color: "pink",
      type: "mood",
      displayValue: `${moodScale[todayMood].emoji} ${moodScale[todayMood].label}`,
    },
    {
      id: 2,
      title: "Ore di sonno",
      completed: sleepHours,
      total: 8,
      icon: <Moon size={20} />,
      color: "purple",
      type: "sleep",
      displayValue: `${sleepHours}h / 8h`,
    },
    {
      id: 3,
      title: "Dieta del giorno",
      completed: currentMeal.completed,
      total: 1,
      icon: <Apple size={20} />,
      color: "green",
      type: "diet",
      displayValue: currentMeal.meal,
      briefing: currentMeal.description,
    },
    {
      id: 4,
      title: "Allenamento",
      completed: isRestDay ? 1 : 0,
      total: 1,
      icon: <Dumbbell size={20} />,
      color: "orange",
      type: "workout",
      displayValue: isRestDay ? "Giorno di riposo" : "Da completare",
      workoutType: activeWorkoutPlan ? activeWorkoutPlan.name : "Nessun piano attivo",
      isRestDay: isRestDay,
    },
  ];

  const quickActions = [
    { id: 1, title: "Registra Allenamento", icon: <Dumbbell size={20} />, color: "from-orange-500 to-red-500", action: () => navigate("/workout") },
    { id: 2, title: "Aggiungi Pasto", icon: <Apple size={20} />, color: "from-green-500 to-emerald-500", action: () => navigate("/diet") },
    { id: 3, title: "I Miei Progressi", icon: <Activity size={20} />, color: "from-blue-500 to-cyan-500", action: () => navigate("/progress") },
    { id: 4, title: "Kiweel Feed", icon: <Users size={20} />, color: "from-purple-500 to-pink-500", action: () => navigate("/feed") },
  ];

  const handleMoodSelection = async (moodValue: number) => {
    setTodayMood(moodValue);
    setShowMoodSelector(false);
    const selectedMood = moodScale[moodValue];
    toast.success(`Umore registrato: ${selectedMood.emoji} ${selectedMood.label}!`);

    // Save to progress_tracking
    if (user) {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("progress_tracking").upsert({
        client_id: user.id,
        tracking_date: today,
        mood: moodValue.toString(),
      });
    }
  };

  const handleSleepInput = async (hours: number) => {
    setSleepHours(hours);
    setShowSleepInput(false);
    toast.success(`Ore di sonno aggiornate: ${hours}h!`);

    // Note: sleep_hours not in current schema
    // This functionality will be added when schema is extended
  };

  const addWater = async () => {
    if (waterGlasses < 8) {
      const newCount = waterGlasses + 1;
      setWaterGlasses(newCount);
      toast.success("💧 Bicchiere d'acqua aggiunto!");

      // Note: water_glasses not in current schema
      // This functionality will be added when schema is extended
    }
  };

  const CircularProgress = ({ percentage, size = 60, strokeWidth = 6, color = "blue" }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    const colorMap: Record<string, string> = {
      blue: "#3B82F6",
      green: "#10B981",
      orange: "#F59E0B",
      purple: "#8B5CF6",
      pink: "#EC4899",
    };

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 absolute" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{percentage}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <KiweelLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </KiweelLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-4 pb-6">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              {timeOfDay().icon}
              <h1 className="text-2xl font-bold">
                {timeOfDay().greeting}, {userProfile?.name || "Kiweer"}!
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <Flame className="text-orange-300" size={16} />
                <span className="text-sm font-semibold">{dailyStreak} giorni</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <Trophy className="text-yellow-300" size={16} />
                <span className="text-sm font-semibold">{kiweelTokens} tokens</span>
              </div>
              <div className="text-sm text-white/90">
                {currentTime.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", hour12: false })}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Progress Cards */}
        <div className="grid grid-cols-2 gap-3">
          {todaysGoals.map((goal) => {
            const percentage = goal.type === "mood" ? (goal.completed / goal.total) * 100 : goal.type === "sleep" ? (goal.completed / goal.total) * 100 : (goal.completed / goal.total) * 100;
            // const _isCompleted = goal.completed >= goal.total;

            return (
              <Card key={goal.id} className="p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    goal.color === "pink" ? "bg-pink-100 text-pink-600" :
                    goal.color === "purple" ? "bg-purple-100 text-purple-600" :
                    goal.color === "green" ? "bg-green-100 text-green-600" :
                    "bg-orange-100 text-orange-600"
                  }`}>{goal.icon}</div>
                  <CircularProgress percentage={Math.round(percentage)} size={40} color={goal.color} />
                </div>
                <h3 className="font-bold text-sm text-gray-800 mb-1">{goal.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{goal.displayValue}</p>
                {goal.briefing && <p className="text-xs text-gray-500">{goal.briefing}</p>}

                <Button
                  size="sm"
                  variant="outline"
                  className={`w-full mt-2 text-xs ${
                    goal.type === "mood" ? "border-pink-200 text-pink-700 hover:bg-pink-50" : ""
                  } ${goal.type === "sleep" ? "border-purple-200 text-purple-700 hover:bg-purple-50" : ""} ${
                    goal.type === "diet" ? "border-green-200 text-green-700 hover:bg-green-50" : ""
                  } ${goal.type === "workout" ? "border-orange-200 text-orange-700 hover:bg-orange-50" : ""}`}
                  onClick={() => {
                    if (goal.type === "mood") setShowMoodSelector(true);
                    if (goal.type === "sleep") setShowSleepInput(true);
                    if (goal.type === "diet") navigate("/diet");
                    if (goal.type === "workout") navigate("/workout");
                  }}
                >
                  {goal.type === "mood" && "Aggiorna"}
                  {goal.type === "sleep" && "Inserisci"}
                  {goal.type === "diet" && "Vedi Piano"}
                  {goal.type === "workout" && (isRestDay ? "Riposo" : "Inizia")}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="text-blue-500" size={20} />
            Azioni Rapide
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                onClick={action.action}
                className={`p-4 h-auto bg-gradient-to-r ${action.color} text-white font-semibold hover:scale-105 transition-all shadow-lg`}
              >
                <div className="flex flex-col items-center gap-2">
                  {action.icon}
                  <span className="text-xs">{action.title}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Water Tracker */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Droplets className="text-blue-500" size={20} />
              Idratazione
            </h3>
            <div className="text-xl font-bold text-blue-600">{waterGlasses}/8</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[...Array(8)].map((_, index) => (
                <div
                  key={`water-glass-${index}`}
                  className={`w-8 h-8 rounded-full border-2 border-blue-300 flex items-center justify-center transition-all ${
                    index < waterGlasses ? "bg-blue-500 text-white" : "bg-white"
                  }`}
                >
                  💧
                </div>
              ))}
            </div>
            <Button onClick={addWater} disabled={waterGlasses >= 8} size="sm" className="bg-blue-500 hover:bg-blue-600">
              + Bicchiere
            </Button>
          </div>
          {waterGlasses >= 8 && (
            <div className="text-center p-2 bg-green-100 text-green-700 rounded-lg mt-3 text-sm">
              🎉 Obiettivo raggiunto!
            </div>
          )}
        </Card>

        {/* Shared Data */}
        {recentSharedData.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-green-500" size={20} />
                Dati Condivisi
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/shared-data")}>
                Vedi tutto <ChevronRight size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {recentSharedData.slice(0, 2).map((data: any) => {
                const getDataTypeIcon = (type: string) => {
                  const icons: Record<string, string> = {
                    diet_plan: "🥗",
                    workout_plan: "💪",
                    diagnosis: "📋",
                    progress: "📊",
                    prescription: "💊",
                  };
                  return icons[type] || "📄";
                };
                return (
                  <div
                    key={data.id}
                    className="bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors cursor-pointer border border-green-200"
                    onClick={() => navigate("/shared-data")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getDataTypeIcon(data.data_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-xs">
                            {data.professionals?.users?.name || "KIWEERIST"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(data.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{data.category || data.data_type}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        {recentPosts.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-purple-500" size={20} />
                Attività Recenti
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/feed")}>
                Vedi tutto <ChevronRight size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {recentPosts.slice(0, 2).map((post: any) => (
                <div
                  key={post.id}
                  className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate("/feed")}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {post.professionals?.users?.name?.[0] || "K"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-xs">
                          {post.professionals?.users?.name || "KIWEERIST"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-xs line-clamp-2 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Come ti senti oggi?</h3>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {moodScale.map((mood) => (
                <Button
                  key={mood.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoodSelection(mood.value)}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <span className="text-xl mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.value}</span>
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowMoodSelector(false)} className="w-full">
              Annulla
            </Button>
          </Card>
        </div>
      )}

      {/* Sleep Input Modal */}
      {showSleepInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Quante ore hai dormito?</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5].map((hours) => (
                <Button
                  key={`sleep-${hours}`}
                  variant={sleepHours === hours ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSleepInput(hours)}
                  className={sleepHours === hours ? "bg-purple-500" : ""}
                >
                  {hours}h
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowSleepInput(false)} className="w-full">
              Annulla
            </Button>
          </Card>
        </div>
      )}
    </MobileLayout>
  );
}

