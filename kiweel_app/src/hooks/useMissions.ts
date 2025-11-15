import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Mission = Database["public"]["Tables"]["missions"]["Row"];

interface UseMissionsOptions {
  clientId?: string;
  status?: "active" | "completed" | "expired";
  missionType?: "daily" | "weekly" | "milestone";
}

export function useMissions(options: UseMissionsOptions = {}) {
  const { clientId, status, missionType } = options;
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    const fetchData = async () => {
      try {
        let query = supabase
          .from("missions")
          .select("*")
          .eq("client_id", clientId);

        if (status) {
          query = query.eq("status", status);
        }

        if (missionType) {
          query = query.eq("mission_type", missionType);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (mounted) {
          setMissions(data || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch missions"));
          setLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`missions:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "missions",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            setMissions((prev) => [payload.new as Mission, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setMissions((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Mission) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setMissions((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clientId, status, missionType]);

  return { missions, loading, error };
}


