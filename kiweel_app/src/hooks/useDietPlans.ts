import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DietPlan = Database["public"]["Tables"]["diet_plans"]["Row"];

interface UseDietPlansOptions {
  clientId?: string;
  dietitianId?: string;
  status?: "active" | "completed" | "paused";
}

export function useDietPlans(options: UseDietPlansOptions = {}) {
  const { clientId, dietitianId, status } = options;
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId && !dietitianId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    const fetchData = async () => {
      try {
        let query = supabase
          .from("diet_plans")
          .select(`
            *,
            professionals!diet_plans_dietitian_id_fkey(
              id,
              title,
              profession_type,
              users(name, avatar_url)
            )
          `);

        if (clientId) {
          query = query.eq("client_id", clientId);
        }

        if (dietitianId) {
          query = query.eq("dietitian_id", dietitianId);
        }

        if (status) {
          query = query.eq("status", status as any);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (mounted) {
          setDietPlans(data || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch diet plans"));
          setLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`diet_plans:${clientId || dietitianId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "diet_plans",
          filter: clientId ? `client_id=eq.${clientId}` : dietitianId ? `dietitian_id=eq.${dietitianId}` : undefined,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            setDietPlans((prev) => [payload.new as DietPlan, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDietPlans((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as DietPlan) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setDietPlans((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clientId, dietitianId, status]);

  return { dietPlans, loading, error };
}


