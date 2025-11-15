import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"];

interface UseWorkoutPlansOptions {
  clientId?: string;
  trainerId?: string;
  status?: "active" | "completed" | "paused";
}

export function useWorkoutPlans(options: UseWorkoutPlansOptions = {}) {
  const { clientId, trainerId, status } = options;
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId && !trainerId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    const fetchData = async () => {
      try {
        let query = supabase
          .from("workout_plans")
          .select(`
            *,
            professionals!workout_plans_trainer_id_fkey(
              id,
              title,
              profession_type,
              users(name, avatar_url)
            )
          `);

        if (clientId) {
          query = query.eq("client_id", clientId);
        }

        if (trainerId) {
          query = query.eq("trainer_id", trainerId);
        }

        if (status) {
          query = query.eq("status", status as any);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (mounted) {
          setWorkoutPlans(data || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch workout plans"));
          setLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`workout_plans:${clientId || trainerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_plans",
          filter: clientId ? `client_id=eq.${clientId}` : trainerId ? `trainer_id=eq.${trainerId}` : undefined,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            setWorkoutPlans((prev) => [payload.new as WorkoutPlan, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setWorkoutPlans((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as WorkoutPlan) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setWorkoutPlans((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clientId, trainerId, status]);

  return { workoutPlans, loading, error };
}


