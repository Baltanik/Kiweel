import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  Plus,
  Clock,
  ShoppingCart,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { it } from "date-fns/locale";

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions?: string;
  completed: boolean;
}

interface DayPlan {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface MealPlannerProps {
  dietPlan?: any;
}


export function MealPlanner({ dietPlan }: MealPlannerProps) {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMeal, setNewMeal] = useState({
    name: '',
    time: '12:00',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: [] as string[],
    instructions: ''
  });

  useEffect(() => {
    initializeWeekPlan();
  }, [currentWeek, dietPlan]);

  const initializeWeekPlan = async () => {
    if (!user) return;

    setLoading(true);
    const weekDays: DayPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeek, i);
      const dateString = format(date, 'yyyy-MM-dd');

      // Try to load existing meals for this day
      const { data: existingMeals } = await supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateString);

      let dayMeals: Meal[] = [];

      if (existingMeals && existingMeals.length > 0) {
        // Use existing meals
        dayMeals = existingMeals.map(meal => ({
          id: meal.id,
          name: meal.name,
          time: meal.time,
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          ingredients: meal.ingredients || [],
          instructions: meal.instructions || undefined,
          completed: meal.completed || false
        }));
      } else if (dietPlan?.weekly_plan) {
        // Use diet plan template
        const dayOfWeek = i; // 0 = Monday
        const planDay = dietPlan.weekly_plan[dayOfWeek];
        
        if (planDay?.meals) {
          dayMeals = planDay.meals.map((meal: any, index: number) => ({
            id: `template-${dateString}-${index}`,
            name: meal.name || `Pasto ${index + 1}`,
            time: meal.time || '12:00',
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fat: meal.fat || 0,
            ingredients: meal.ingredients || [],
            instructions: meal.description,
            completed: false
          }));
        }
      }

      // Calculate totals
      const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const totalFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);

      weekDays.push({
        date: dateString,
        meals: dayMeals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat
      });
    }

    setWeekPlan(weekDays);
    setLoading(false);
  };

  const addMeal = async (dayIndex: number) => {
    if (!user || !newMeal.name) {
      toast.error("Inserisci almeno il nome del pasto");
      return;
    }

    const dayPlan = weekPlan[dayIndex];
    const mealId = `meal-${Date.now()}`;

    const meal: Meal = {
      id: mealId,
      name: newMeal.name,
      time: newMeal.time,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbs: newMeal.carbs,
      fat: newMeal.fat,
      ingredients: newMeal.ingredients,
      instructions: newMeal.instructions,
      completed: false
    };

    try {
      // Save to database
      const { error } = await supabase
        .from("user_meals")
        .insert({
          user_id: user.id,
          date: dayPlan.date,
          name: meal.name,
          time: meal.time,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          completed: false
        });

      if (error) throw error;

      // Update local state
      const updatedWeekPlan = [...weekPlan];
      updatedWeekPlan[dayIndex].meals.push(meal);
      
      // Recalculate totals
      const dayMeals = updatedWeekPlan[dayIndex].meals;
      updatedWeekPlan[dayIndex].totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      updatedWeekPlan[dayIndex].totalProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
      updatedWeekPlan[dayIndex].totalCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
      updatedWeekPlan[dayIndex].totalFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

      setWeekPlan(updatedWeekPlan);
      setIsAddMealOpen(false);
      resetNewMeal();
      toast.success("Pasto aggiunto con successo!");

    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error("Errore nell'aggiungere il pasto");
    }
  };

  const completeMeal = async (dayIndex: number, mealIndex: number) => {
    const meal = weekPlan[dayIndex].meals[mealIndex];
    
    try {
      // Update in database if it's a saved meal
      if (!meal.id.startsWith('template-')) {
        const { error } = await supabase
          .from("user_meals")
          .update({ completed: !meal.completed })
          .eq("id", meal.id);

        if (error) throw error;
      }

      // Update local state
      const updatedWeekPlan = [...weekPlan];
      updatedWeekPlan[dayIndex].meals[mealIndex].completed = !meal.completed;
      setWeekPlan(updatedWeekPlan);

      toast.success(meal.completed ? "Pasto rimosso dai completati" : "Pasto completato!");

    } catch (error) {
      console.error("Error updating meal:", error);
      toast.error("Errore nell'aggiornare il pasto");
    }
  };

  const deleteMeal = async (dayIndex: number, mealIndex: number) => {
    const meal = weekPlan[dayIndex].meals[mealIndex];
    
    try {
      // Delete from database if it's a saved meal
      if (!meal.id.startsWith('template-')) {
        const { error } = await supabase
          .from("user_meals")
          .delete()
          .eq("id", meal.id);

        if (error) throw error;
      }

      // Update local state
      const updatedWeekPlan = [...weekPlan];
      updatedWeekPlan[dayIndex].meals.splice(mealIndex, 1);
      
      // Recalculate totals
      const dayMeals = updatedWeekPlan[dayIndex].meals;
      updatedWeekPlan[dayIndex].totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      updatedWeekPlan[dayIndex].totalProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
      updatedWeekPlan[dayIndex].totalCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
      updatedWeekPlan[dayIndex].totalFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

      setWeekPlan(updatedWeekPlan);
      toast.success("Pasto eliminato");

    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Errore nell'eliminare il pasto");
    }
  };

  const generateShoppingList = () => {
    const allIngredients: string[] = [];
    
    weekPlan.forEach(day => {
      day.meals.forEach(meal => {
        if (!meal.completed) {
          allIngredients.push(...meal.ingredients);
        }
      });
    });

    // Remove duplicates and sort
    const uniqueIngredients = [...new Set(allIngredients)].sort();
    setShoppingList(uniqueIngredients);
  };

  const resetNewMeal = () => {
    setNewMeal({
      name: '',
      time: '12:00',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: [],
      instructions: ''
    });
  };

  const addIngredient = (ingredient: string) => {
    if (ingredient.trim() && !newMeal.ingredients.includes(ingredient.trim())) {
      setNewMeal(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredient.trim()]
      }));
    }
  };

  const removeIngredient = (index: number) => {
    setNewMeal(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento piano settimanale...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pianificazione Pasti</h2>
          <p className="text-gray-600">
            Settimana del {format(currentWeek, 'dd MMM', { locale: it })} - {format(addDays(currentWeek, 6), 'dd MMM yyyy', { locale: it })}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            ← Settimana Prec.
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            Settimana Succ. →
          </Button>
          <Button onClick={generateShoppingList}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Lista Spesa
          </Button>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekPlan.map((day, dayIndex) => {
          const date = addDays(currentWeek, dayIndex);
          const isToday = isSameDay(date, new Date());
          
          return (
            <Card key={day.date} className={`${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-2">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">
                    {format(date, 'EEE', { locale: it })}
                  </div>
                  <div className="text-lg font-bold">
                    {format(date, 'dd', { locale: it })}
                  </div>
                  {isToday && (
                    <Badge variant="secondary" className="text-xs">Oggi</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Daily Summary */}
                <div className="text-xs text-center bg-gray-50 rounded p-2">
                  <div>{day.totalCalories} kcal</div>
                  <div className="text-gray-500">
                    P: {day.totalProtein}g | C: {day.totalCarbs}g | G: {day.totalFat}g
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-1">
                  {day.meals.map((meal, mealIndex) => (
                    <div
                      key={meal.id}
                      className={`text-xs p-2 rounded border ${
                        meal.completed 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium truncate">{meal.name}</div>
                          <div className="text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {meal.time}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => completeMeal(dayIndex, mealIndex)}
                          >
                            <CheckCircle2 className={`h-3 w-3 ${meal.completed ? 'text-green-600' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => deleteMeal(dayIndex, mealIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-gray-500 mt-1">
                        {meal.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Meal Button */}
                <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setSelectedDay(day)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Aggiungi Pasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        Aggiungi Pasto - {selectedDay && format(new Date(selectedDay.date), 'dd MMM yyyy', { locale: it })}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meal-name">Nome Pasto</Label>
                          <Input
                            id="meal-name"
                            value={newMeal.name}
                            onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="es. Colazione"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meal-time">Orario</Label>
                          <Input
                            id="meal-time"
                            type="time"
                            value={newMeal.time}
                            onChange={(e) => setNewMeal(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="calories">Calorie</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={newMeal.calories}
                            onChange={(e) => setNewMeal(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="protein">Proteine (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            value={newMeal.protein}
                            onChange={(e) => setNewMeal(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="carbs">Carboidrati (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            value={newMeal.carbs}
                            onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Grassi (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            value={newMeal.fat}
                            onChange={(e) => setNewMeal(prev => ({ ...prev, fat: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Ingredienti</Label>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {newMeal.ingredients.map((ingredient, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ingredient}
                              <button
                                onClick={() => removeIngredient(index)}
                                className="ml-1 text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Aggiungi ingrediente e premi Invio"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addIngredient(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>

                      <div>
                        <Label htmlFor="instructions">Istruzioni</Label>
                        <Textarea
                          id="instructions"
                          value={newMeal.instructions}
                          onChange={(e) => setNewMeal(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Istruzioni di preparazione..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddMealOpen(false)}>
                          Annulla
                        </Button>
                        <Button onClick={() => selectedDay && addMeal(weekPlan.indexOf(selectedDay))}>
                          Aggiungi Pasto
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shopping List Modal */}
      {shoppingList.length > 0 && (
        <Dialog open={shoppingList.length > 0} onOpenChange={() => setShoppingList([])}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lista della Spesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {shoppingList.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>{ingredient}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShoppingList([])}>Chiudi</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
