import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Users,
  MessageSquare,
  Calendar,
  Plus,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  health_goals?: string[];
  fitness_level?: string;
  medical_conditions?: string[];
  created_at: string;
  last_activity?: string;
  active_diet_plans: number;
  active_workout_plans: number;
  total_progress_entries: number;
}

interface ClientDetail {
  client: Client;
  dietPlans: any[];
  workoutPlans: any[];
  progressHistory: any[];
  sharedData: any[];
  bookings: any[];
}

export default function ClientManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Fetch clients list
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["professional-clients", professional?.id],
    queryFn: async (): Promise<Client[]> => {
      if (!professional?.id) return [];

      // Get unique client IDs from diet_plans and workout_plans
      const { data: dietClients } = await supabase
        .from("diet_plans")
        .select(`
          client_id,
          users!diet_plans_client_id_fkey(id, name, email, avatar_url, health_goals, fitness_level, medical_conditions, created_at)
        `)
        .eq("dietitian_id", professional.id);

      const { data: workoutClients } = await supabase
        .from("workout_plans")
        .select(`
          client_id,
          users!workout_plans_client_id_fkey(id, name, email, avatar_url, health_goals, fitness_level, medical_conditions, created_at)
        `)
        .eq("trainer_id", professional.id);

      // Combine and deduplicate clients
      const clientMap = new Map();

      dietClients?.forEach(item => {
        if (item.users) {
          clientMap.set(item.client_id, item.users);
        }
      });

      workoutClients?.forEach(item => {
        if (item.users) {
          clientMap.set(item.client_id, item.users);
        }
      });

      const uniqueClients = Array.from(clientMap.values());

      // Get additional stats for each client
      const clientsWithStats = await Promise.all(
        uniqueClients.map(async (client: any) => {
          // Count active plans
          const { count: activeDietPlans } = await supabase
            .from("diet_plans")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("dietitian_id", professional.id)
            .eq("status", "active");

          const { count: activeWorkoutPlans } = await supabase
            .from("workout_plans")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("trainer_id", professional.id)
            .eq("status", "active");

          // Count progress entries
          const { count: progressEntries } = await supabase
            .from("progress_tracking")
            .select("*", { count: "exact", head: true })
            .eq("user_id", client.id);

          // Get last activity (most recent progress entry or shared data)
          const { data: lastProgress } = await supabase
            .from("progress_tracking")
            .select("created_at")
            .eq("user_id", client.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...client,
            active_diet_plans: activeDietPlans || 0,
            active_workout_plans: activeWorkoutPlans || 0,
            total_progress_entries: progressEntries || 0,
            last_activity: lastProgress?.[0]?.created_at || client.created_at
          };
        })
      );

      return clientsWithStats;
    },
    enabled: !!professional?.id
  });

  // Fetch detailed client info when selected
  const { data: clientDetail } = useQuery({
    queryKey: ["client-detail", selectedClient, professional?.id],
    queryFn: async (): Promise<ClientDetail | null> => {
      if (!selectedClient || !professional?.id) return null;

      const client = clients?.find(c => c.id === selectedClient);
      if (!client) return null;

      // Fetch diet plans
      const { data: dietPlans } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("client_id", selectedClient)
        .eq("dietitian_id", professional.id)
        .order("created_at", { ascending: false });

      // Fetch workout plans
      const { data: workoutPlans } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("client_id", selectedClient)
        .eq("trainer_id", professional.id)
        .order("created_at", { ascending: false });

      // Fetch progress history
      const { data: progressHistory } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("user_id", selectedClient)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch shared data
      const { data: sharedData } = await supabase
        .from("shared_data")
        .select("*")
        .eq("client_id", selectedClient)
        .eq("professional_id", professional.id)
        .order("created_at", { ascending: false });

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", selectedClient)
        .eq("professional_id", professional.id)
        .order("booking_date", { ascending: false });

      return {
        client,
        dietPlans: dietPlans || [],
        workoutPlans: workoutPlans || [],
        progressHistory: progressHistory || [],
        sharedData: sharedData || [],
        bookings: bookings || []
      };
    },
    enabled: !!selectedClient && !!professional?.id && !!clients
  });

  // Filter clients based on search term
  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreatePlan = (clientId: string, type: 'diet' | 'workout') => {
    navigate(`/pro/plans/create/${type}?client=${clientId}`);
  };

  const handleSendMessage = (clientId: string) => {
    navigate(`/chat/${clientId}`);
  };

  if (!professional) {
    return (
      <ProfessionalLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Caricamento...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">I Miei Clienti</h1>
            <p className="text-gray-600 mt-1">
              Gestisci i tuoi clienti e i loro piani
            </p>
          </div>
          <Button onClick={() => navigate("/pro/clients/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Cliente
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Clienti ({filteredClients.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cerca clienti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {clientsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Caricamento clienti...
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Nessun cliente trovato
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedClient === client.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedClient(client.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={client.avatar_url} />
                            <AvatarFallback>
                              {client.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {client.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {client.active_diet_plans > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {client.active_diet_plans} Dieta
                                </Badge>
                              )}
                              {client.active_workout_plans > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {client.active_workout_plans} Workout
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Detail */}
          <div className="lg:col-span-2">
            {selectedClient && clientDetail ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={clientDetail.client.avatar_url} />
                        <AvatarFallback>
                          {clientDetail.client.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{clientDetail.client.name}</h3>
                        <p className="text-sm text-gray-500">{clientDetail.client.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(clientDetail.client.id)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/pro/calendar?client=${clientDetail.client.id}`)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Prenota
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Panoramica</TabsTrigger>
                      <TabsTrigger value="plans">Piani</TabsTrigger>
                      <TabsTrigger value="progress">Progressi</TabsTrigger>
                      <TabsTrigger value="data">Dati</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Obiettivi di Salute</h4>
                          <div className="flex flex-wrap gap-1">
                            {clientDetail.client.health_goals?.map((goal, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {goal}
                              </Badge>
                            )) || <span className="text-sm text-gray-500">Non specificati</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Livello Fitness</h4>
                          <Badge variant="secondary">
                            {clientDetail.client.fitness_level || "Non specificato"}
                          </Badge>
                        </div>
                      </div>
                      
                      {clientDetail.client.medical_conditions && clientDetail.client.medical_conditions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Condizioni Mediche</h4>
                          <div className="flex flex-wrap gap-1">
                            {clientDetail.client.medical_conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-red-600">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {clientDetail.dietPlans.length + clientDetail.workoutPlans.length}
                          </p>
                          <p className="text-sm text-gray-500">Piani Totali</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {clientDetail.progressHistory.length}
                          </p>
                          <p className="text-sm text-gray-500">Check-in Progressi</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {clientDetail.bookings.length}
                          </p>
                          <p className="text-sm text-gray-500">Appuntamenti</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="plans" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Piani Attivi</h4>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleCreatePlan(clientDetail.client.id, 'diet')}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Piano Dieta
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCreatePlan(clientDetail.client.id, 'workout')}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Piano Allenamento
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {clientDetail.dietPlans.map((plan) => (
                          <div key={plan.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{plan.name}</p>
                                <p className="text-xs text-gray-500">
                                  Piano Dieta • {format(new Date(plan.created_at), 'dd MMM yyyy', { locale: it })}
                                </p>
                              </div>
                              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                {plan.status}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {clientDetail.workoutPlans.map((plan) => (
                          <div key={plan.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{plan.name}</p>
                                <p className="text-xs text-gray-500">
                                  Piano Allenamento • {format(new Date(plan.created_at), 'dd MMM yyyy', { locale: it })}
                                </p>
                              </div>
                              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                {plan.status}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {clientDetail.dietPlans.length === 0 && clientDetail.workoutPlans.length === 0 && (
                          <p className="text-center text-gray-500 py-4">
                            Nessun piano creato per questo cliente
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-4">
                      <h4 className="font-medium">Storico Progressi</h4>
                      <div className="space-y-3">
                        {clientDetail.progressHistory.map((progress) => (
                          <div key={progress.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  Check-in del {format(new Date(progress.created_at), 'dd MMM yyyy', { locale: it })}
                                </p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  {progress.weight && <span>Peso: {progress.weight}kg</span>}
                                  {progress.energy_level && <span>Energia: {progress.energy_level}/10</span>}
                                  {progress.mood && <span>Umore: {progress.mood}</span>}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {clientDetail.progressHistory.length === 0 && (
                          <p className="text-center text-gray-500 py-4">
                            Nessun progresso registrato
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-4">
                      <h4 className="font-medium">Dati Condivisi</h4>
                      <div className="space-y-3">
                        {clientDetail.sharedData.map((data) => (
                          <div key={data.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{data.category}</p>
                                <p className="text-xs text-gray-500">
                                  {data.data_type} • {format(new Date(data.created_at), 'dd MMM yyyy', { locale: it })}
                                </p>
                              </div>
                              <Badge variant="outline">{data.visibility}</Badge>
                            </div>
                          </div>
                        ))}
                        {clientDetail.sharedData.length === 0 && (
                          <p className="text-center text-gray-500 py-4">
                            Nessun dato condiviso
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Seleziona un Cliente
                  </h3>
                  <p className="text-gray-500">
                    Scegli un cliente dalla lista per visualizzare i dettagli
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProfessionalLayout>
  );
}
