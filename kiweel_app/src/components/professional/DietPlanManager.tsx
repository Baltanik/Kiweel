import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  Plus,
  Minus,
  Save,
  Users,
  Calendar,
  Target,
  Utensils,
  Clock,
  X
} from "lucide-react";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  description?: string;
}

interface DayPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface DietPlan {
  name: string;
  description: string;
  client_id: string;
  meals_per_day: number;
  target_calories: number;
  target_protein_percent: number;
  target_carbs_percent: number;
  target_fat_percent: number;
  start_date: string;
  end_date: string;
  weekly_plan: DayPlan[];
  notes?: string;
  share_with_professionals: string[];
}

const DAYS_OF_WEEK = [
  'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
];

const DEFAULT_MEAL_TIMES = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '13:00', '20:00'],
  4: ['08:00', '13:00', '16:00', '20:00'],
  5: ['08:00', '11:00', '13:00', '16:00', '20:00'],
  6: ['08:00', '11:00', '13:00', '16:00', '19:00', '21:00']
};

export function DietPlanManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client');

  const [professional, setProfessional] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const [dietPlan, setDietPlan] = useState<DietPlan>({
    name: '',
    description: '',
    client_id: preselectedClientId || '',
    meals_per_day: 3,
    target_calories: 2000,
    target_protein_percent: 25,
    target_carbs_percent: 50,
    target_fat_percent: 25,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weekly_plan: [],
    notes: '',
    share_with_professionals: []
  });

  // Initialize weekly plan
  useEffect(() => {
    const initializeWeeklyPlan = () => {
      const weeklyPlan: DayPlan[] = DAYS_OF_WEEK.map(day => ({
        day,
        meals: Array.from({ length: dietPlan.meals_per_day }, (_, index) => ({
          id: `${day}-meal-${index}`,
          name: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          time: DEFAULT_MEAL_TIMES[dietPlan.meals_per_day as keyof typeof DEFAULT_MEAL_TIMES]?.[index] || '12:00',
          description: ''
        })),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      }));

      setDietPlan(prev => ({ ...prev, weekly_plan: weeklyPlan }));
    };

    initializeWeeklyPlan();
  }, [dietPlan.meals_per_day]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch professional profile
        const { data: proData } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (proData) {
          setProfessional(proData);

          // Fetch clients
          const { data: dietClients } = await supabase
            .from("diet_plans")
            .select(`
              client_id,
              users!diet_plans_client_id_fkey(id, name, email)
            `)
            .eq("dietitian_id", proData.id);

          const { data: workoutClients } = await supabase
            .from("workout_plans")
            .select(`
              client_id,
              users!workout_plans_client_id_fkey(id, name, email)
            `)
            .eq("trainer_id", proData.id);

          // Combine and deduplicate clients
          const clientMap = new Map();
          dietClients?.forEach(item => {
            if (item.users) clientMap.set(item.client_id, item.users);
          });
          workoutClients?.forEach(item => {
            if (item.users) clientMap.set(item.client_id, item.users);
          });

          setClients(Array.from(clientMap.values()));

          // Fetch other professionals for sharing
          const { data: allProfessionals } = await supabase
            .from("professionals")
            .select("id, title, users!professionals_user_id_fkey(name)")
            .neq("id", proData.id);

          setProfessionals(allProfessionals || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Errore nel caricamento dei dati");
      }
    };

    fetchData();
  }, [user]);

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: any) => {
    setDietPlan(prev => {
      const newWeeklyPlan = [...prev.weekly_plan];
      newWeeklyPlan[dayIndex].meals[mealIndex] = {
        ...newWeeklyPlan[dayIndex].meals[mealIndex],
        [field]: value
      };

      // Recalculate day totals
      const dayPlan = newWeeklyPlan[dayIndex];
      dayPlan.totalCalories = dayPlan.meals.reduce((sum, meal) => sum + meal.calories, 0);
      dayPlan.totalProtein = dayPlan.meals.reduce((sum, meal) => sum + meal.protein, 0);
      dayPlan.totalCarbs = dayPlan.meals.reduce((sum, meal) => sum + meal.carbs, 0);
      dayPlan.totalFat = dayPlan.meals.reduce((sum, meal) => sum + meal.fat, 0);

      return { ...prev, weekly_plan: newWeeklyPlan };
    });
  };

  const copyDayPlan = (fromDay: number, toDay: number) => {
    setDietPlan(prev => {
      const newWeeklyPlan = [...prev.weekly_plan];
      const sourceDayPlan = newWeeklyPlan[fromDay];
      
      newWeeklyPlan[toDay] = {
        ...sourceDayPlan,
        day: DAYS_OF_WEEK[toDay],
        meals: sourceDayPlan.meals.map((meal, index) => ({
          ...meal,
          id: `${DAYS_OF_WEEK[toDay]}-meal-${index}`
        }))
      };

      return { ...prev, weekly_plan: newWeeklyPlan };
    });

    toast.success(`Piano di ${DAYS_OF_WEEK[fromDay]} copiato in ${DAYS_OF_WEEK[toDay]}`);
  };

  const handleSave = async () => {
    if (!professional || !dietPlan.client_id || !dietPlan.name) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);

    try {
      // Create diet plan
      const { data: newPlan, error: planError } = await supabase
        .from("diet_plans")
        .insert({
          name: dietPlan.name,
          description: dietPlan.description,
          client_id: dietPlan.client_id,
          dietitian_id: professional.id,
          meals_per_day: dietPlan.meals_per_day,
          target_calories: dietPlan.target_calories,
          target_protein_percent: dietPlan.target_protein_percent,
          target_carbs_percent: dietPlan.target_carbs_percent,
          target_fat_percent: dietPlan.target_fat_percent,
          start_date: dietPlan.start_date,
          end_date: dietPlan.end_date,
          weekly_plan: dietPlan.weekly_plan,
          notes: dietPlan.notes,
          status: 'active'
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create shared_data entry
      const { error: sharedError } = await supabase
        .from("shared_data")
        .insert({
          client_id: dietPlan.client_id,
          professional_id: professional.id,
          data_type: 'diet_plan',
          category: 'Piano Alimentare',
          content: {
            plan_id: newPlan.id,
            name: dietPlan.name,
            description: dietPlan.description,
            target_calories: dietPlan.target_calories,
            meals_per_day: dietPlan.meals_per_day,
            duration_days: Math.ceil((new Date(dietPlan.end_date).getTime() - new Date(dietPlan.start_date).getTime()) / (1000 * 60 * 60 * 24))
          },
          visibility: 'shared'
        });

      if (sharedError) throw sharedError;

      // Share with other professionals if selected
      if (dietPlan.share_with_professionals.length > 0) {
        const sharePromises = dietPlan.share_with_professionals.map(proId =>
          supabase.from("shared_data").insert({
            client_id: dietPlan.client_id,
            professional_id: proId,
            data_type: 'diet_plan',
            category: 'Piano Alimentare Condiviso',
            content: {
              plan_id: newPlan.id,
              name: dietPlan.name,
              shared_by: professional.id,
              shared_by_name: user?.user_metadata?.name
            },
            visibility: 'shared'
          })
        );

        await Promise.all(sharePromises);
      }

      toast.success("Piano dieta creato con successo!");
      navigate("/pro/clients");

    } catch (error) {
      console.error("Error saving diet plan:", error);
      toast.error("Errore nel salvataggio del piano dieta");
    } finally {
      setLoading(false);
    }
  };

  const currentDayPlan = dietPlan.weekly_plan[activeDay];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Crea Piano Dieta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Piano *</Label>
              <Input
                id="name"
                value={dietPlan.name}
                onChange={(e) => setDietPlan(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Piano Dieta Dimagrimento"
              />
            </div>
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Select
                value={dietPlan.client_id}
                onValueChange={(value) => setDietPlan(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={dietPlan.description}
              onChange={(e) => setDietPlan(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrizione del piano alimentare..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="meals_per_day">Pasti al Giorno</Label>
              <Select
                value={dietPlan.meals_per_day.toString()}
                onValueChange={(value) => setDietPlan(prev => ({ ...prev, meals_per_day: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target_calories">Calorie Target</Label>
              <Input
                id="target_calories"
                type="number"
                value={dietPlan.target_calories}
                onChange={(e) => setDietPlan(prev => ({ ...prev, target_calories: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                value={dietPlan.start_date}
                onChange={(e) => setDietPlan(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                type="date"
                value={dietPlan.end_date}
                onChange={(e) => setDietPlan(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="protein_percent">Proteine %</Label>
              <Input
                id="protein_percent"
                type="number"
                min="0"
                max="100"
                value={dietPlan.target_protein_percent}
                onChange={(e) => setDietPlan(prev => ({ ...prev, target_protein_percent: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="carbs_percent">Carboidrati %</Label>
              <Input
                id="carbs_percent"
                type="number"
                min="0"
                max="100"
                value={dietPlan.target_carbs_percent}
                onChange={(e) => setDietPlan(prev => ({ ...prev, target_carbs_percent: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="fat_percent">Grassi %</Label>
              <Input
                id="fat_percent"
                type="number"
                min="0"
                max="100"
                value={dietPlan.target_fat_percent}
                onChange={(e) => setDietPlan(prev => ({ ...prev, target_fat_percent: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Piano Settimanale
            </div>
            <div className="flex space-x-2">
              {activeDay > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyDayPlan(activeDay - 1, activeDay)}
                >
                  Copia da {DAYS_OF_WEEK[activeDay - 1]}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Day Tabs */}
          <div className="flex space-x-1 mb-6 overflow-x-auto">
            {DAYS_OF_WEEK.map((day, index) => (
              <Button
                key={day}
                variant={activeDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDay(index)}
                className="whitespace-nowrap"
              >
                {day}
              </Button>
            ))}
          </div>

          {/* Current Day Plan */}
          {currentDayPlan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{currentDayPlan.day}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Calorie: {currentDayPlan.totalCalories}</span>
                  <span>P: {currentDayPlan.totalProtein}g</span>
                  <span>C: {currentDayPlan.totalCarbs}g</span>
                  <span>G: {currentDayPlan.totalFat}g</span>
                </div>
              </div>

              <div className="space-y-4">
                {currentDayPlan.meals.map((meal, mealIndex) => (
                  <Card key={meal.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <Label>Nome Pasto</Label>
                        <Input
                          value={meal.name}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'name', e.target.value)}
                          placeholder="es. Colazione"
                        />
                      </div>
                      <div>
                        <Label>Orario</Label>
                        <Input
                          type="time"
                          value={meal.time}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'time', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Calorie</Label>
                        <Input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'calories', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Proteine (g)</Label>
                        <Input
                          type="number"
                          value={meal.protein}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'protein', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Carb (g)</Label>
                        <Input
                          type="number"
                          value={meal.carbs}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'carbs', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Grassi (g)</Label>
                        <Input
                          type="number"
                          value={meal.fat}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'fat', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Descrizione</Label>
                        <Input
                          value={meal.description || ''}
                          onChange={(e) => updateMeal(activeDay, mealIndex, 'description', e.target.value)}
                          placeholder="Dettagli del pasto..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Condivisione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Condividi con altri professionisti</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {professionals.map((pro) => (
                <Badge
                  key={pro.id}
                  variant={dietPlan.share_with_professionals.includes(pro.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setDietPlan(prev => ({
                      ...prev,
                      share_with_professionals: prev.share_with_professionals.includes(pro.id)
                        ? prev.share_with_professionals.filter(id => id !== pro.id)
                        : [...prev.share_with_professionals, pro.id]
                    }));
                  }}
                >
                  {pro.users?.name} ({pro.title})
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Note Aggiuntive</Label>
            <Textarea
              id="notes"
              value={dietPlan.notes}
              onChange={(e) => setDietPlan(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note per il cliente o altri professionisti..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate("/pro/clients")}>
          Annulla
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salva Piano Dieta
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
