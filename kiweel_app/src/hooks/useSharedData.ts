import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SharedData = Database["public"]["Tables"]["shared_data"]["Row"];

interface UseSharedDataOptions {
  clientId?: string;
  professionalId?: string;
  dataType?: string;
}

export function useSharedData(options: UseSharedDataOptions = {}) {
  const { clientId, professionalId, dataType } = options;
  const [sharedData, setSharedData] = useState<SharedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId && !professionalId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    const fetchData = async () => {
      try {
        let query = supabase
          .from("shared_data")
          .select(`
            *,
            professionals!shared_data_professional_id_fkey(
              id,
              title,
              profession_type,
              users(name, avatar_url)
            )
          `);

        if (clientId) {
          query = query.eq("client_id", clientId);
        }

        if (professionalId) {
          query = query.eq("professional_id", professionalId);
        }

        if (dataType) {
          query = query.eq("data_type", dataType as any);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (mounted) {
          setSharedData(data || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch shared data"));
          setLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`shared_data:${clientId || professionalId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shared_data",
          filter: clientId ? `client_id=eq.${clientId}` : professionalId ? `professional_id=eq.${professionalId}` : undefined,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            setSharedData((prev) => [payload.new as SharedData, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSharedData((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as SharedData) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setSharedData((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clientId, professionalId, dataType]);

  return { sharedData, loading, error };
}


