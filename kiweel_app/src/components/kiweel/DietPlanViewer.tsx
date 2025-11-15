import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Apple, Clock, CheckCircle2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

interface DietPlan {
  id: string;
  name: string;
  description: string;
  macros_target: {
    protein_percent: number;
    carbs_percent: number;
    fat_percent: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  dietitian: {
    title: string;
    users: {
      name: string;
    };
  };
}

interface Meal {
  meal_type: string;
  name: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  time?: string;
  completed?: boolean;
}

export function DietPlanViewer() {
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (user) {
      fetchDietPlan();
    }
  }, [user]);

  useEffect(() => {
    if (dietPlan) {
      fetchTodayMeals();
    }
  }, [dietPlan, selectedDate]);

  const fetchDietPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("diet_plans")
        .select(
          `
          *,
          dietitian:professionals!diet_plans_dietitian_id_fkey(
            title,
            users(name)
          )
        `
        )
        .eq("client_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setDietPlan(data as any);
      }
    } catch (error: any) {
      console.error("Error fetching diet plan:", error);
      toast.error("Errore nel caricamento del piano alimentare");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMeals = async () => {
    if (!dietPlan) return;

    // Per ora simuliamo i pasti - in futuro verranno da una tabella meals o da diet_plans.meals_json
    const meals: Meal[] = [
      {
        meal_type: "colazione",
        name: "Colazione",
        calories: 400,
        macros: { protein: 20, carbs: 50, fat: 10 },
        time: "08:00",
        completed: false,
      },
      {
        meal_type: "spuntino",
        name: "Spuntino Mattutino",
        calories: 150,
        macros: { protein: 5, carbs: 20, fat: 5 },
        time: "10:30",
        completed: false,
      },
      {
        meal_type: "pranzo",
        name: "Pranzo",
        calories: 600,
        macros: { protein: 40, carbs: 60, fat: 20 },
        time: "13:00",
        completed: false,
      },
      {
        meal_type: "spuntino",
        name: "Spuntino Pomeridiano",
        calories: 150,
        macros: { protein: 5, carbs: 20, fat: 5 },
        time: "16:00",
        completed: false,
      },
      {
        meal_type: "cena",
        name: "Cena",
        calories: 500,
        macros: { protein: 35, carbs: 50, fat: 15 },
        time: "20:00",
        completed: false,
      },
    ];

    setTodayMeals(meals);
  };

  const toggleMealCompleted = async (mealType: string) => {
    // TODO: Implementare salvataggio completamento pasto
    setTodayMeals((prev) =>
      prev.map((meal) => (meal.meal_type === mealType ? { ...meal, completed: !meal.completed } : meal))
    );
    toast.success("Pasto aggiornato!");
  };

  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return "colazione";
    if (hour >= 10 && hour < 12) return "spuntino";
    if (hour >= 12 && hour < 15) return "pranzo";
    if (hour >= 15 && hour < 18) return "spuntino";
    if (hour >= 18 && hour < 22) return "cena";
    return null;
  };

  const currentMealType = getCurrentMeal();
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMacros = todayMeals.reduce(
    (acc, meal) => ({
      protein: acc.protein + (meal.macros?.protein || 0),
      carbs: acc.carbs + (meal.macros?.carbs || 0),
      fat: acc.fat + (meal.macros?.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <Card className="p-8 text-center">
        <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun piano alimentare attivo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Contatta un KIWEERIST dietologo per creare un piano personalizzato
        </p>
        <Button onClick={() => window.location.href = "/discover"}>Trova Dietologo</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{dietPlan.name}</h2>
            {dietPlan.description && <p className="text-sm text-gray-600">{dietPlan.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Creato da {dietPlan.dietitian?.users?.name || "KIWEERIST"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dietPlan.status === "active" ? "Attivo" : dietPlan.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Macros Target */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-600">Proteine</div>
            <div className="text-lg font-bold text-blue-600">{dietPlan.macros_target.protein_percent}%</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-600">Carboidrati</div>
            <div className="text-lg font-bold text-green-600">{dietPlan.macros_target.carbs_percent}%</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-600">Grassi</div>
            <div className="text-lg font-bold text-orange-600">{dietPlan.macros_target.fat_percent}%</div>
          </div>
        </div>
      </Card>

      {/* Date Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="text-gray-500" size={20} />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Today's Summary */}
      <Card className="p-4">
        <h3 className="font-bold text-gray-800 mb-3">Riepilogo Giornaliero</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Calorie Totali</span>
            <span className="font-semibold">{totalCalories} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Proteine</span>
            <span className="font-semibold">{totalMacros.protein}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Carboidrati</span>
            <span className="font-semibold">{totalMacros.carbs}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Grassi</span>
            <span className="font-semibold">{totalMacros.fat}g</span>
          </div>
        </div>
      </Card>

      {/* Today's Meals */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800">Pasti del Giorno</h3>
        {todayMeals.map((meal, index) => {
          const isCurrent = meal.meal_type === currentMealType;
          const mealLabels: Record<string, string> = {
            colazione: "Colazione",
            spuntino: "Spuntino",
            pranzo: "Pranzo",
            cena: "Cena",
          };

          return (
            <Card
              key={index}
              className={`p-4 border-2 transition-all ${
                isCurrent ? "border-green-500 bg-green-50" : meal.completed ? "border-gray-200 bg-gray-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-800">{mealLabels[meal.meal_type] || meal.name}</h4>
                    {isCurrent && <Badge className="bg-green-500 text-white text-xs">Prossimo</Badge>}
                    {meal.completed && <CheckCircle2 className="text-green-500" size={16} />}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{meal.name}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {meal.time && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {meal.time}
                      </span>
                    )}
                    <span>{meal.calories} kcal</span>
                  </div>
                  {meal.macros && (
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="text-blue-600">P: {meal.macros.protein}g</span>
                      <span className="text-green-600">C: {meal.macros.carbs}g</span>
                      <span className="text-orange-600">G: {meal.macros.fat}g</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={meal.completed ? "outline" : "default"}
                  onClick={() => toggleMealCompleted(meal.meal_type)}
                  className="ml-2"
                >
                  {meal.completed ? "Fatto" : "Completa"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Meal Button */}
      <Button variant="outline" className="w-full" onClick={() => toast.info("Funzionalità in arrivo!")}>
        <Plus size={16} className="mr-2" />
        Aggiungi Pasto Personalizzato
      </Button>
    </div>
  );
}


