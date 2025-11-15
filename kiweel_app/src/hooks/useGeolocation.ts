import { useState } from "react";
// import { useEffect, useRef } from "react"; // Non più necessari
// import { supabase } from "@/integrations/supabase/client"; // Non più necessario
// import { useAuth } from "@/contexts/AuthContext"; // Non più necessario

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

// HOOK DISABILITATO - tutte le variabili globali commentate
// let isLocationRequesting = false;
// let lastLocationAttempt = 0;
// const RETRY_DELAY = 15000;
// const CACHE_KEY = 'kiweel_geolocation_cache';
// const CACHE_DURATION = 15 * 60 * 1000;

// interface CachedLocation {
//   latitude: number;
//   longitude: number;
//   timestamp: number;
// }

export function useGeolocation() {
  // HOOK DISABILITATO - causava conflitti con MapView
  // Ora la geolocalizzazione è gestita direttamente in MapView come in Rewido
  const [location] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: "Hook disabilitato - usa MapView",
    loading: false,
  });

  // TUTTO IL CODICE DISABILITATO - non fa più richieste geolocation
  // useEffect(() => { ... }, [user]);

  return location;
}
