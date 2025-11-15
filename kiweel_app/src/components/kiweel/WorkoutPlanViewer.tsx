import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, Clock, CheckCircle2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { TokenService } from "@/integrations/tokens/tokenService";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  program_type: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  trainer: {
    title: string;
    users: {
      name: string;
    };
  };
}

interface Exercise {
  id?: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  rest_seconds?: number;
  notes?: string;
}

interface WorkoutSession {
  id?: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
  duration_minutes?: number;
}

export function WorkoutPlanViewer() {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);

  useEffect(() => {
    if (user) {
      fetchWorkoutPlan();
    }
  }, [user]);

  useEffect(() => {
    if (workoutPlan) {
      fetchTodayWorkout();
    }
  }, [workoutPlan]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const fetchWorkoutPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("workout_plans")
        .select(
          `
          *,
          trainer:professionals!workout_plans_trainer_id_fkey(
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
        setWorkoutPlan(data as any);
      }
    } catch (error: any) {
      console.error("Error fetching workout plan:", error);
      toast.error("Errore nel caricamento del piano di allenamento");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayWorkout = async () => {
    if (!workoutPlan) return;

    // Per ora simuliamo gli esercizi - in futuro verranno da workout_plans.exercises_json
    const exercises: Exercise[] = [
      {
        name: "Squat",
        sets: 4,
        reps: 12,
        weight: 60,
        rest_seconds: 90,
        notes: "Mantieni la schiena dritta",
      },
      {
        name: "Bench Press",
        sets: 4,
        reps: 10,
        weight: 70,
        rest_seconds: 120,
        notes: "Controlla la discesa",
      },
      {
        name: "Deadlift",
        sets: 3,
        reps: 8,
        weight: 100,
        rest_seconds: 180,
        notes: "Forma corretta fondamentale",
      },
      {
        name: "Pull-ups",
        sets: 3,
        reps: 10,
        rest_seconds: 90,
        notes: "Controlla la fase eccentrica",
      },
    ];

    setTodayWorkout({
      date: new Date().toISOString().split("T")[0],
      exercises,
      completed: false,
    });
  };

  const startWorkout = () => {
    setIsActive(true);
    setCurrentExerciseIndex(0);
    toast.success("Allenamento iniziato!");
  };

  const completeExercise = (exerciseIndex: number) => {
    if (!todayWorkout) return;

    const updatedExercises = [...todayWorkout.exercises];
    const exercise = updatedExercises[exerciseIndex];

    // Start rest timer
    if (exercise.rest_seconds) {
      setRestTimer(exercise.rest_seconds);
    }

    // Move to next exercise if not last
    if (exerciseIndex < updatedExercises.length - 1) {
      setTimeout(() => {
        setCurrentExerciseIndex(exerciseIndex + 1);
        setRestTimer(0);
      }, exercise.rest_seconds ? exercise.rest_seconds * 1000 : 0);
    } else {
      // Workout completed
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    if (!todayWorkout || !user || !workoutPlan) return;

    setIsActive(false);
    setCurrentExerciseIndex(0);

    try {
      // Save workout completion in progress_tracking
        const { error: progressError } = await supabase
          .from("progress_tracking")
          .insert({
            client_id: user.id,
          workout_completed: true,
          workout_type: workoutPlan.program_type,
          workout_duration: todayWorkout.duration_minutes || 60,
          notes: `Completato: ${workoutPlan.name}`,
          created_at: new Date().toISOString()
        });

      if (progressError) {
        console.error("Error saving workout progress:", progressError);
      }

        // Award tokens for workout completion
        try {
          await TokenService.awardTokensForAction(user.id, 'WORKOUT_COMPLETED');
        toast.success("Allenamento completato! 🎉 +20 tokens guadagnati!");
      } catch (tokenError) {
        console.error("Error awarding tokens:", tokenError);
        toast.success("Allenamento completato! 🎉");
      }

      // Update workout as completed
      setTodayWorkout(prev => prev ? { ...prev, completed: true } : null);

    } catch (error) {
      console.error("Error completing workout:", error);
      toast.error("Errore nel salvare l'allenamento completato");
    }
  };

  const getProgramTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      strength: "Forza",
      cardio: "Cardio",
      flexibility: "Flessibilità",
      mixed: "Misto",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <Card className="p-8 text-center">
        <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun piano di allenamento attivo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Contatta un KIWEERIST Personal Trainer per creare un piano personalizzato
        </p>
        <Button onClick={() => window.location.href = "/discover"}>Trova Personal Trainer</Button>
      </Card>
    );
  }

  const currentExercise = todayWorkout?.exercises[currentExerciseIndex];

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{workoutPlan.name}</h2>
            {workoutPlan.description && <p className="text-sm text-gray-600">{workoutPlan.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {getProgramTypeLabel(workoutPlan.program_type)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Creato da {workoutPlan.trainer?.users?.name || "KIWEERIST"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {workoutPlan.duration_days} giorni
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Workout Session */}
      {isActive && currentExercise && (
        <Card className="p-4 border-2 border-orange-500 bg-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Play className="text-orange-500" size={20} />
              Allenamento in Corso
            </h3>
            <Button size="sm" variant="outline" onClick={() => setIsActive(false)}>
              Pausa
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Esercizio {currentExerciseIndex + 1} di {todayWorkout?.exercises.length}</div>
              <h4 className="text-2xl font-bold text-gray-800">{currentExercise.name}</h4>
            </div>

            {currentExercise.sets && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-gray-600">Serie</div>
                  <div className="text-lg font-bold">{currentExercise.sets}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-gray-600">Ripetizioni</div>
                  <div className="text-lg font-bold">{currentExercise.reps}</div>
                </div>
                {currentExercise.weight && (
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-xs text-gray-600">Peso</div>
                    <div className="text-lg font-bold">{currentExercise.weight}kg</div>
                  </div>
                )}
              </div>
            )}

            {currentExercise.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{currentExercise.notes}</p>
              </div>
            )}

            {restTimer > 0 ? (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Tempo di recupero</div>
                <div className="text-4xl font-bold text-orange-600">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, "0")}</div>
              </div>
            ) : (
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => completeExercise(currentExerciseIndex)}
              >
                <CheckCircle2 size={16} className="mr-2" />
                Completa Esercizio
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Today's Workout */}
      {!isActive && todayWorkout && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} />
              Allenamento di Oggi
            </h3>
            {todayWorkout.completed ? (
              <Badge className="bg-green-500">Completato</Badge>
            ) : (
              <Button size="sm" onClick={startWorkout}>
                <Play size={16} className="mr-2" />
                Inizia
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {todayWorkout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{exercise.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-600">
                      {exercise.sets && <span>{exercise.sets} serie</span>}
                      {exercise.reps && <span>{exercise.reps} rip</span>}
                      {exercise.weight && <span>{exercise.weight}kg</span>}
                      {exercise.rest_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">{exercise.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Workout Summary */}
      {todayWorkout && (
        <Card className="p-4">
          <h3 className="font-bold text-gray-800 mb-3">Riepilogo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Esercizi totali</span>
              <span className="font-semibold">{todayWorkout.exercises.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Serie totali</span>
              <span className="font-semibold">
                {todayWorkout.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)}
              </span>
            </div>
            {todayWorkout.duration_minutes && (
              <div className="flex justify-between">
                <span className="text-gray-600">Durata stimata</span>
                <span className="font-semibold">{todayWorkout.duration_minutes} min</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}


