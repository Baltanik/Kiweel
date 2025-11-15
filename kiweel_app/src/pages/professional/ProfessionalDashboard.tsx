import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DashboardStats {
  totalClients: number;
  activePlans: number;
  upcomingAppointments: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'message' | 'shared_data' | 'review';
  title: string;
  description: string;
  timestamp: string;
  client_name?: string;
}

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<any>(null);

  // Fetch professional profile
  useEffect(() => {
    const fetchProfessional = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching professional:", error);
      } else {
        setProfessional(data);
      }
    };

    fetchProfessional();
  }, [user]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["professional-stats", professional?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!professional?.id) throw new Error("No professional ID");

      // Get total clients (unique client_ids from diet_plans and workout_plans)
      const { data: dietClients } = await supabase
        .from("diet_plans")
        .select("client_id")
        .eq("dietitian_id", professional.id);

      const { data: workoutClients } = await supabase
        .from("workout_plans")
        .select("client_id")
        .eq("trainer_id", professional.id);

      const allClientIds = new Set([
        ...(dietClients?.map(d => d.client_id) || []),
        ...(workoutClients?.map(w => w.client_id) || [])
      ]);

      // Get active plans count
      const { count: activeDietPlans } = await supabase
        .from("diet_plans")
        .select("*", { count: "exact", head: true })
        .eq("dietitian_id", professional.id)
        .eq("status", "active");

      const { count: activeWorkoutPlans } = await supabase
        .from("workout_plans")
        .select("*", { count: "exact", head: true })
        .eq("trainer_id", professional.id)
        .eq("status", "active");

      // Get upcoming appointments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { count: upcomingBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", professional.id)
        .eq("status", "confirmed")
        .gte("booking_date", new Date().toISOString())
        .lte("booking_date", nextWeek.toISOString());

      // Get reviews stats
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("professional_id", professional.id);

      const averageRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      return {
        totalClients: allClientIds.size,
        activePlans: (activeDietPlans || 0) + (activeWorkoutPlans || 0),
        upcomingAppointments: upcomingBookings || 0,
        monthlyRevenue: 0, // TODO: Implement revenue tracking
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews?.length || 0
      };
    },
    enabled: !!professional?.id
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ["recent-activity", professional?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!professional?.id) return [];

      const activities: RecentActivity[] = [];

      // Recent bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select(`
          id, booking_date, status, notes,
          users!bookings_client_id_fkey(name)
        `)
        .eq("professional_id", professional.id)
        .order("created_at", { ascending: false })
        .limit(3);

      bookings?.forEach(booking => {
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'Nuova prenotazione',
          description: `${booking.users?.name} - ${format(new Date(booking.booking_date), 'dd MMM yyyy HH:mm', { locale: it })}`,
          timestamp: booking.booking_date,
          client_name: booking.users?.name || 'Cliente'
        });
      });

      // Recent messages
      const { data: messages } = await supabase
        .from("messages")
        .select(`
          id, content, created_at,
          sender:users!messages_sender_id_fkey(name)
        `)
        .eq("receiver_id", user?.id || '')
        .order("created_at", { ascending: false })
        .limit(3);

      messages?.forEach(message => {
        activities.push({
          id: `message-${message.id}`,
          type: 'message',
          title: 'Nuovo messaggio',
          description: message.content.substring(0, 50) + '...',
          timestamp: message.created_at,
          client_name: message.sender?.name || 'Cliente'
        });
      });

      // Recent shared data
      const { data: sharedData } = await supabase
        .from("shared_data")
        .select(`
          id, data_type, category, created_at,
          users!shared_data_client_id_fkey(name)
        `)
        .eq("professional_id", professional.id)
        .order("created_at", { ascending: false })
        .limit(3);

      sharedData?.forEach(data => {
        activities.push({
          id: `shared-${data.id}`,
          type: 'shared_data',
          title: 'Dati condivisi',
          description: `${data.data_type}${data.category ? ` - ${data.category}` : ''}`,
          timestamp: data.created_at || new Date().toISOString(),
          client_name: data.users?.name || 'Cliente'
        });
      });

      // Sort by timestamp and return latest 5
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    },
    enabled: !!professional?.id
  });

  const quickActions = [
    {
      title: "Crea Piano Dieta",
      description: "Nuovo piano alimentare per un cliente",
      icon: FileText,
      color: "from-green-500 to-emerald-500",
      action: () => navigate("/pro/plans/create/diet")
    },
    {
      title: "Crea Piano Allenamento", 
      description: "Nuovo programma di allenamento",
      icon: Activity,
      color: "from-orange-500 to-red-500",
      action: () => navigate("/pro/plans/create/workout")
    },
    {
      title: "Gestisci Clienti",
      description: "Visualizza e gestisci i tuoi clienti",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate("/pro/clients")
    },
    {
      title: "Calendario",
      description: "Visualizza appuntamenti e disponibilità",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      action: () => navigate("/pro/calendar")
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'message': return MessageSquare;
      case 'shared_data': return FileText;
      case 'review': return Star;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600 bg-blue-50';
      case 'message': return 'text-green-600 bg-green-50';
      case 'shared_data': return 'text-purple-600 bg-purple-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!professional) {
    return (
      <ProfessionalLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Caricamento profilo professionale...</p>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Benvenuto, {user?.user_metadata?.name || "Professional"}
            </h1>
            <p className="text-gray-600 mt-1">
              Ecco una panoramica della tua attività
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {professional.profession_type}
            </Badge>
            {professional.verified && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Verificato
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clienti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.totalClients || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Piani Attivi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.activePlans || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prossimi Appuntamenti</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.upcomingAppointments || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Medio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.averageRating || 0}
                    <span className="text-sm text-gray-500 ml-1">
                      ({stats?.totalReviews || 0} recensioni)
                    </span>
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow"
                    onClick={action.action}
                  >
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Attività Recente
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/pro/activity")}>
                Vedi tutto
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm', { locale: it })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nessuna attività recente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfessionalLayout>
  );
}
