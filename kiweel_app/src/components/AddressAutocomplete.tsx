import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface AddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  relevance?: number;
}

interface AddressData {
  address: string;
  city: string;
  cap: string;
  latitude: number;
  longitude: number;
}

interface Props {
  value: string;
  onChange: (data: AddressData) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Sync internal state with external value prop
  useEffect(() => {
    setQuery(value);
    setHasUserTyped(false);
    // Reset suggestions when value changes externally
    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  useEffect(() => {
    if (!hasUserTyped || query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      await searchAddress(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, hasUserTyped]);

  const searchAddress = async (searchQuery: string) => {
    setIsLoading(true);

    console.log("🔍 SEARCHING:", searchQuery);

    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || "";

      if (!MAPBOX_TOKEN) {
        toast.error("Token Mapbox non configurato");
        return;
      }

      // Estrai città dalla query (ultima parola di 4+ caratteri)
      const cityMatch = searchQuery.match(/\s+([a-zA-Z]{4,})$/i);
      const targetCity = cityMatch ? cityMatch[1].toLowerCase() : null;

      console.log("🎯 Target city:", targetCity);

      // Query 1: Originale
      const url1 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=IT&language=it&types=address,place,postcode,locality&autocomplete=true&limit=5&access_token=${MAPBOX_TOKEN}`;

      const response1 = await fetch(url1);
      const data1 = await response1.json();

      console.log("✅ RESPONSE 1:", data1.features?.length || 0, "results");

      // Query 2: Con "andrea" davanti
      const queryWithAndrea = searchQuery.replace(/^(via|v\.)\s+/i, "$1 andrea ");
      const url2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(queryWithAndrea)}.json?country=IT&language=it&types=address,place,postcode,locality&autocomplete=true&limit=5&access_token=${MAPBOX_TOKEN}`;

      const response2 = await fetch(url2);
      const data2 = await response2.json();

      console.log("✅ RESPONSE 2:", data2.features?.length || 0, "results");

      // Combina risultati
      const allFeatures = [...(data1.features || []), ...(data2.features || [])];

      // Rimuovi duplicati
      const uniqueFeatures = allFeatures.filter(
        (feature, index, self) => index === self.findIndex((f) => f.id === feature.id),
      );

      console.log("🎯 TOTALE UNICI:", uniqueFeatures.length);

      // SMART SORTING: boost risultati che contengono la città target
      const sortedFeatures = uniqueFeatures.sort((a, b) => {
        if (!targetCity) {
          // Se non c'è città target, ordina solo per relevance
          return (b.relevance || 0) - (a.relevance || 0);
        }

        const aHasCity = a.place_name.toLowerCase().includes(targetCity);
        const bHasCity = b.place_name.toLowerCase().includes(targetCity);

        // Se solo A contiene la città, A viene prima
        if (aHasCity && !bHasCity) return -1;
        // Se solo B contiene la città, B viene prima
        if (!aHasCity && bHasCity) return 1;

        // Se entrambi hanno o non hanno la città, ordina per relevance
        return (b.relevance || 0) - (a.relevance || 0);
      });

      console.log("🚀 DOPO SORTING (primi 5):");
      sortedFeatures.slice(0, 5).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.place_name}`);
      });

      setSuggestions(sortedFeatures);
      setShowSuggestions(true);
    } catch (error) {
      console.error("❌ ERROR:", error);
      toast.error("Errore nella ricerca dell'indirizzo");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAddress = (suggestion: AddressSuggestion) => {
    console.log("🎯 SELEZIONATO:", suggestion.place_name);

    const [longitude, latitude] = suggestion.center;

    let city = "";
    let cap = "";

    if (suggestion.context) {
      const placeContext = suggestion.context.find((c) => c.id.startsWith("place"));
      const postcodeContext = suggestion.context.find((c) => c.id.startsWith("postcode"));

      city = placeContext?.text || "";
      cap = postcodeContext?.text || "";
    }

    if (!city) {
      const parts = suggestion.place_name.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        city = parts[parts.length - 2] || "";
      }
    }

    const addressData: AddressData = {
      address: suggestion.place_name,
      city,
      cap,
      latitude,
      longitude,
    };

    setQuery(suggestion.place_name);
    onChange(addressData);
    setSuggestions([]);
    setShowSuggestions(false);
    setHasUserTyped(false);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="address">Indirizzo Completo *</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          id="address"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasUserTyped(true);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (hasUserTyped && suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder || "Via Roma 1, Milano"}
          className="pl-10"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => selectAddress(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{suggestion.text}</p>
                  <p className="text-xs text-muted-foreground truncate">{suggestion.place_name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{isLoading ? "Ricerca in corso..." : "Digita almeno 3 caratteri"}</p>
    </div>
  );
}
