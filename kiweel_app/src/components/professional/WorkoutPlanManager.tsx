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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  Plus,
  Save,
  Users,
  Calendar,
  Dumbbell,
  Copy,
  Trash2
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_time: number;
  notes?: string;
  muscle_groups?: string[];
}

interface WorkoutDay {
  day: number;
  name: string;
  exercises: Exercise[];
  total_duration: number;
  focus_areas: string[];
}

interface WorkoutPlan {
  name: string;
  description: string;
  client_id: string;
  program_type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  duration_days: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  start_date: string;
  end_date: string;
  workout_days: WorkoutDay[];
  rest_days: number[];
  notes?: string;
  share_with_professionals: string[];
}

const PROGRAM_TYPES = [
  { value: 'strength', label: 'Forza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flessibilità' },
  { value: 'mixed', label: 'Misto' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzato' }
];

const MUSCLE_GROUPS = [
  'Petto', 'Schiena', 'Spalle', 'Bicipiti', 'Tricipiti', 
  'Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Addominali', 'Core'
];

const FOCUS_AREAS = [
  'Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Stretching'
];

export function WorkoutPlanManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client');

  const [professional, setProfessional] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>({
    name: '',
    description: '',
    client_id: preselectedClientId || '',
    program_type: 'mixed',
    duration_days: 28,
    difficulty_level: 'intermediate',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    workout_days: [],
    rest_days: [7, 14, 21], // Default rest days
    notes: '',
    share_with_professionals: []
  });

  // Initialize workout days
  useEffect(() => {
    const initializeWorkoutDays = () => {
      const workoutDays: WorkoutDay[] = [];
      const totalDays = workoutPlan.duration_days;
      const workoutFrequency = Math.floor(totalDays / 7) * 3; // 3 workouts per week

      for (let i = 0; i < workoutFrequency; i++) {
        workoutDays.push({
          day: i + 1,
          name: `Allenamento ${i + 1}`,
          exercises: [],
          total_duration: 0,
          focus_areas: []
        });
      }

      setWorkoutPlan(prev => ({ ...prev, workout_days: workoutDays }));
    };

    if (workoutPlan.duration_days > 0 && workoutPlan.workout_days.length === 0) {
      initializeWorkoutDays();
    }
  }, [workoutPlan.duration_days]);

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

  const addExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      sets: 3,
      reps: '10-12',
      weight: '',
      rest_time: 60,
      notes: '',
      muscle_groups: []
    };

    setWorkoutPlan(prev => {
      const newWorkoutDays = [...prev.workout_days];
      newWorkoutDays[dayIndex].exercises.push(newExercise);
      return { ...prev, workout_days: newWorkoutDays };
    });
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setWorkoutPlan(prev => {
      const newWorkoutDays = [...prev.workout_days];
      newWorkoutDays[dayIndex].exercises.splice(exerciseIndex, 1);
      return { ...prev, workout_days: newWorkoutDays };
    });
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    setWorkoutPlan(prev => {
      const newWorkoutDays = [...prev.workout_days];
      newWorkoutDays[dayIndex].exercises[exerciseIndex] = {
        ...newWorkoutDays[dayIndex].exercises[exerciseIndex],
        [field]: value
      };

      // Recalculate total duration
      const exercises = newWorkoutDays[dayIndex].exercises;
      const totalDuration = exercises.reduce((sum, exercise) => {
        const setsTime = exercise.sets * 30; // Assume 30 seconds per set
        const restTime = (exercise.sets - 1) * exercise.rest_time;
        return sum + setsTime + restTime;
      }, 0);

      newWorkoutDays[dayIndex].total_duration = Math.round(totalDuration / 60); // Convert to minutes

      return { ...prev, workout_days: newWorkoutDays };
    });
  };

  const updateWorkoutDay = (dayIndex: number, field: keyof WorkoutDay, value: any) => {
    setWorkoutPlan(prev => {
      const newWorkoutDays = [...prev.workout_days];
      newWorkoutDays[dayIndex] = {
        ...newWorkoutDays[dayIndex],
        [field]: value
      };
      return { ...prev, workout_days: newWorkoutDays };
    });
  };

  const copyWorkoutDay = (fromDay: number, toDay: number) => {
    setWorkoutPlan(prev => {
      const newWorkoutDays = [...prev.workout_days];
      const sourceDay = newWorkoutDays[fromDay];
      
      newWorkoutDays[toDay] = {
        ...sourceDay,
        day: toDay + 1,
        name: `Allenamento ${toDay + 1}`,
        exercises: sourceDay.exercises.map(exercise => ({
          ...exercise,
          id: `exercise-${Date.now()}-${Math.random()}`
        }))
      };

      return { ...prev, workout_days: newWorkoutDays };
    });

    toast.success(`Allenamento ${fromDay + 1} copiato in Allenamento ${toDay + 1}`);
  };

  const handleSave = async () => {
    if (!professional || !workoutPlan.client_id || !workoutPlan.name) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);

    try {
      // Create workout plan
      const { data: newPlan, error: planError } = await supabase
        .from("workout_plans")
        .insert({
          name: workoutPlan.name,
          description: workoutPlan.description,
          client_id: workoutPlan.client_id,
          trainer_id: professional.id,
          program_type: workoutPlan.program_type,
          duration_days: workoutPlan.duration_days,
          difficulty_level: workoutPlan.difficulty_level,
          start_date: workoutPlan.start_date,
          end_date: workoutPlan.end_date,
          exercises: workoutPlan.workout_days,
          notes: workoutPlan.notes,
          status: 'active'
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create shared_data entry
      const { error: sharedError } = await supabase
        .from("shared_data")
        .insert({
          client_id: workoutPlan.client_id,
          professional_id: professional.id,
          data_type: 'workout_plan',
          category: 'Piano Allenamento',
          content: {
            plan_id: newPlan.id,
            name: workoutPlan.name,
            description: workoutPlan.description,
            program_type: workoutPlan.program_type,
            duration_days: workoutPlan.duration_days,
            difficulty_level: workoutPlan.difficulty_level,
            total_workouts: workoutPlan.workout_days.length
          },
          visibility: 'shared'
        });

      if (sharedError) throw sharedError;

      // Share with other professionals if selected
      if (workoutPlan.share_with_professionals.length > 0) {
        const sharePromises = workoutPlan.share_with_professionals.map(proId =>
          supabase.from("shared_data").insert({
            client_id: workoutPlan.client_id,
            professional_id: proId,
            data_type: 'workout_plan',
            category: 'Piano Allenamento Condiviso',
            content: {
              plan_id: newPlan.id,
              name: workoutPlan.name,
              shared_by: professional.id,
              shared_by_name: user?.user_metadata?.name
            },
            visibility: 'shared'
          })
        );

        await Promise.all(sharePromises);
      }

      toast.success("Piano allenamento creato con successo!");
      navigate("/pro/clients");

    } catch (error) {
      console.error("Error saving workout plan:", error);
      toast.error("Errore nel salvataggio del piano allenamento");
    } finally {
      setLoading(false);
    }
  };

  const currentWorkoutDay = workoutPlan.workout_days[activeDay];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dumbbell className="mr-2 h-5 w-5" />
            Crea Piano Allenamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Piano *</Label>
              <Input
                id="name"
                value={workoutPlan.name}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Piano Forza 4 Settimane"
              />
            </div>
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Select
                value={workoutPlan.client_id}
                onValueChange={(value) => setWorkoutPlan(prev => ({ ...prev, client_id: value }))}
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
              value={workoutPlan.description}
              onChange={(e) => setWorkoutPlan(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrizione del piano di allenamento..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="program_type">Tipo Programma</Label>
              <Select
                value={workoutPlan.program_type}
                onValueChange={(value: any) => setWorkoutPlan(prev => ({ ...prev, program_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty_level">Livello</Label>
              <Select
                value={workoutPlan.difficulty_level}
                onValueChange={(value: any) => setWorkoutPlan(prev => ({ ...prev, difficulty_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration_days">Durata (giorni)</Label>
              <Input
                id="duration_days"
                type="number"
                min="7"
                max="365"
                value={workoutPlan.duration_days}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 28 }))}
              />
            </div>
            <div>
              <Label>Allenamenti Totali</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                {workoutPlan.workout_days.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                value={workoutPlan.start_date}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                type="date"
                value={workoutPlan.end_date}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Allenamenti
            </div>
            <div className="flex space-x-2">
              {activeDay > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyWorkoutDay(activeDay - 1, activeDay)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copia Precedente
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Workout Day Tabs */}
          <div className="flex space-x-1 mb-6 overflow-x-auto">
            {workoutPlan.workout_days.map((day, index) => (
              <Button
                key={day.day}
                variant={activeDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDay(index)}
                className="whitespace-nowrap"
              >
                Allenamento {day.day}
              </Button>
            ))}
          </div>

          {/* Current Workout Day */}
          {currentWorkoutDay && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workout_name">Nome Allenamento</Label>
                  <Input
                    id="workout_name"
                    value={currentWorkoutDay.name}
                    onChange={(e) => updateWorkoutDay(activeDay, 'name', e.target.value)}
                    placeholder="es. Upper Body Strength"
                  />
                </div>
                <div>
                  <Label htmlFor="focus_areas">Aree Focus</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {FOCUS_AREAS.map(area => (
                      <Badge
                        key={area}
                        variant={currentWorkoutDay.focus_areas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const newFocusAreas = currentWorkoutDay.focus_areas.includes(area)
                            ? currentWorkoutDay.focus_areas.filter(a => a !== area)
                            : [...currentWorkoutDay.focus_areas, area];
                          updateWorkoutDay(activeDay, 'focus_areas', newFocusAreas);
                        }}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-medium">Esercizi</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Durata stimata: {currentWorkoutDay.total_duration} min</span>
                  <Button size="sm" onClick={() => addExercise(activeDay)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Esercizio
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {currentWorkoutDay.exercises.map((exercise, exerciseIndex) => (
                  <Card key={exercise.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Esercizio {exerciseIndex + 1}</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(activeDay, exerciseIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label>Nome Esercizio</Label>
                        <Input
                          value={exercise.name}
                          onChange={(e) => updateExercise(activeDay, exerciseIndex, 'name', e.target.value)}
                          placeholder="es. Panca Piana"
                        />
                      </div>
                      <div>
                        <Label>Serie</Label>
                        <Input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(activeDay, exerciseIndex, 'sets', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label>Ripetizioni</Label>
                        <Input
                          value={exercise.reps}
                          onChange={(e) => updateExercise(activeDay, exerciseIndex, 'reps', e.target.value)}
                          placeholder="es. 8-12"
                        />
                      </div>
                      <div>
                        <Label>Peso</Label>
                        <Input
                          value={exercise.weight || ''}
                          onChange={(e) => updateExercise(activeDay, exerciseIndex, 'weight', e.target.value)}
                          placeholder="es. 60kg"
                        />
                      </div>
                      <div>
                        <Label>Riposo (sec)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={exercise.rest_time}
                          onChange={(e) => updateExercise(activeDay, exerciseIndex, 'rest_time', parseInt(e.target.value) || 60)}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Gruppi Muscolari</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {MUSCLE_GROUPS.map(muscle => (
                          <Badge
                            key={muscle}
                            variant={(exercise.muscle_groups || []).includes(muscle) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => {
                              const currentMuscles = exercise.muscle_groups || [];
                              const newMuscles = currentMuscles.includes(muscle)
                                ? currentMuscles.filter(m => m !== muscle)
                                : [...currentMuscles, muscle];
                              updateExercise(activeDay, exerciseIndex, 'muscle_groups', newMuscles);
                            }}
                          >
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Note</Label>
                      <Textarea
                        value={exercise.notes || ''}
                        onChange={(e) => updateExercise(activeDay, exerciseIndex, 'notes', e.target.value)}
                        placeholder="Note tecniche, consigli, variazioni..."
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}

                {currentWorkoutDay.exercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun esercizio aggiunto</p>
                    <Button className="mt-2" onClick={() => addExercise(activeDay)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi Primo Esercizio
                    </Button>
                  </div>
                )}
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
                  variant={workoutPlan.share_with_professionals.includes(pro.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setWorkoutPlan(prev => ({
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
              value={workoutPlan.notes}
              onChange={(e) => setWorkoutPlan(prev => ({ ...prev, notes: e.target.value }))}
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
              Salva Piano Allenamento
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
