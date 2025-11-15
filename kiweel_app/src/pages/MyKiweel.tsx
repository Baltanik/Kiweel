import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Apple, 
  FileText, 
  Calendar,
  Clock,
  User,
  ChevronRight,
  Play,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useDietPlans } from "@/hooks/useDietPlans";
import { useSharedData } from "@/hooks/useSharedData";
import { useNavigate } from "react-router-dom";

export default function MyKiweel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("allenamento");

  // Real-time data hooks
  const { workoutPlans, loading: workoutLoading } = useWorkoutPlans({ 
    clientId: user?.id 
  });
  const { dietPlans, loading: dietLoading } = useDietPlans({ 
    clientId: user?.id 
  });
  const { sharedData, loading: sharedLoading } = useSharedData({ 
    clientId: user?.id 
  });

  // Filter active plans
  const activeWorkoutPlans = workoutPlans.filter(plan => plan.status === 'active');
  const activeDietPlans = dietPlans.filter(plan => plan.status === 'active');
  
  // Group shared data by type for Dossier
  const dossierData = {
    diagnoses: sharedData.filter(d => d.data_type === 'diagnosis'),
    prescriptions: sharedData.filter(d => d.data_type === 'prescription'),
    progress: sharedData.filter(d => d.data_type === 'progress'),
    other: sharedData.filter(d => !['diagnosis', 'prescription', 'progress'].includes(d.data_type))
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDataTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      diagnosis: "🩺",
      prescription: "💊", 
      progress: "📊",
      diet_plan: "🥗",
      workout_plan: "💪",
    };
    return icons[type] || "📄";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <MobileLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">myKiweel</h1>
          <p className="text-green-100">I tuoi contenuti professionali</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="allenamento" className="flex items-center gap-2">
              <Dumbbell size={16} />
              <span className="hidden sm:inline">Allenamento</span>
            </TabsTrigger>
            <TabsTrigger value="dieta" className="flex items-center gap-2">
              <Apple size={16} />
              <span className="hidden sm:inline">Dieta</span>
            </TabsTrigger>
            <TabsTrigger value="dossier" className="flex items-center gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Dossier</span>
            </TabsTrigger>
          </TabsList>

          {/* ALLENAMENTO TAB */}
          <TabsContent value="allenamento" className="space-y-4">
            {workoutLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Caricamento...</p>
              </div>
            ) : activeWorkoutPlans.length > 0 ? (
              <div className="space-y-3">
                {activeWorkoutPlans.map((plan: any) => (
                  <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {plan.description || "Scheda di allenamento personalizzata"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {plan.duration_days} giorni
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            Trainer
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => navigate("/workout")}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Play size={14} className="mr-1" />
                          Inizia
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="bg-gray-100 rounded-full h-2 mb-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: "45%" }} // TODO: Calculate real progress
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso: 45%</span>
                      <span>Ultimo: 2 giorni fa</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Dumbbell className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="font-semibold mb-2">Nessuna scheda attiva</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Trova un Personal Trainer per iniziare il tuo percorso
                </p>
                <Button onClick={() => navigate("/discover")}>
                  Trova Specialisti
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* DIETA TAB */}
          <TabsContent value="dieta" className="space-y-4">
            {dietLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Caricamento...</p>
              </div>
            ) : activeDietPlans.length > 0 ? (
              <div className="space-y-3">
                {activeDietPlans.map((plan: any) => (
                  <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {plan.description || "Piano alimentare personalizzato"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {plan.meals_per_day} pasti/giorno
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            Dietista
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => navigate("/diet")}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Apple size={14} className="mr-1" />
                          Vedi Piano
                        </Button>
                      </div>
                    </div>

                    {/* Macros target */}
                    {plan.macros_target && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="text-xs text-muted-foreground">Proteine</div>
                          <div className="font-semibold text-blue-600">
                            {plan.macros_target.protein}%
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <div className="text-xs text-muted-foreground">Carbo</div>
                          <div className="font-semibold text-green-600">
                            {plan.macros_target.carbs}%
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded text-center">
                          <div className="text-xs text-muted-foreground">Grassi</div>
                          <div className="font-semibold text-yellow-600">
                            {plan.macros_target.fat}%
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Apple className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="font-semibold mb-2">Nessun piano alimentare</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Trova un Dietista per creare il tuo piano personalizzato
                </p>
                <Button onClick={() => navigate("/discover")}>
                  Trova Specialisti
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* DOSSIER TAB */}
          <TabsContent value="dossier" className="space-y-4">
            {sharedLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Caricamento...</p>
              </div>
            ) : sharedData.length > 0 ? (
              <div className="space-y-4">
                {/* Diagnoses */}
                {dossierData.diagnoses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">🩺</span>
                      Diagnosi e Valutazioni
                    </h3>
                    <div className="space-y-2">
                      {dossierData.diagnoses.map((item: any) => (
                        <Card key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {item.category || "Valutazione"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.shared_at)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Condiviso da professionista
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {dossierData.prescriptions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">💊</span>
                      Prescrizioni
                    </h3>
                    <div className="space-y-2">
                      {dossierData.prescriptions.map((item: any) => (
                        <Card key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {item.category || "Prescrizione"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.shared_at)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Condiviso da professionista
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Reports */}
                {dossierData.progress.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      Report Progressi
                    </h3>
                    <div className="space-y-2">
                      {dossierData.progress.map((item: any) => (
                        <Card key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {item.category || "Report Progressi"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.shared_at)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Analisi dei tuoi progressi
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other documents */}
                {dossierData.other.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText size={18} />
                      Altri Documenti
                    </h3>
                    <div className="space-y-2">
                      {dossierData.other.map((item: any) => (
                        <Card key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getDataTypeIcon(item.data_type)}</span>
                                <span className="font-medium text-sm">
                                  {item.category || item.data_type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.shared_at)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Documento condiviso
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="font-semibold mb-2">Nessun documento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I tuoi professionisti condivideranno qui diagnosi, referti e documenti
                </p>
                <Button onClick={() => navigate("/discover")}>
                  Trova Specialisti
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
