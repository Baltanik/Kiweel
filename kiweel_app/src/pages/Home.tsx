import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Search, SlidersHorizontal, Map as MapIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfessionalCard } from "@/components/professionals/ProfessionalCard";
import { FilterSheet } from "@/components/professionals/FilterSheet";
import { MapView } from "@/components/map/MapView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
// import { useGeolocation } from "@/hooks/useGeolocation"; // DISABILITATO - causa conflitti

type ViewMode = "list" | "map";

export default function Specialisti() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    distance: 50,
    minRating: 0,
    priceRange: [0, 500] as [number, number],
    category: null as string | null,
  });

  // const { latitude, longitude, error: geoError } = useGeolocation(); // DISABILITATO

  // Query per ottenere suggerimenti
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data: pros } = await supabase
        .from("professionals")
        .select("id, title, city, category, users(name)")
        .or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .limit(10);

      return pros || [];
    },
    enabled: searchQuery.length >= 2,
  });

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["professionals", filters, searchQuery],
    queryFn: async () => {
      // Query standard con tutti i join necessari
      let query = supabase
        .from("professionals")
        .select(`
          *, 
          users(name, avatar_url), 
          services(name, price),
          professional_posts(content, created_at)
        `)
        .order("created_at", { referencedTable: "professional_posts", ascending: false })
        .limit(1, { referencedTable: "professional_posts" });

      if (filters.minRating > 0) {
        query = query.gte("rating", filters.minRating);
      }

      if (filters.category) {
        query = query.eq("category", filters.category as any);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("rating", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <MobileLayout fixedHeader={true}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="fixed top-14 left-0 right-0 z-40 bg-background">
          <div className="p-4 pb-3">
            <h1 className="text-2xl font-bold text-foreground mb-3">Trova Professionisti</h1>
            
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Cerca per nome, città o categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
                
                {/* Dropdown Suggerimenti */}
                {showSuggestions && suggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50">
                    <Command>
                      <CommandList>
                        <CommandEmpty>Nessun risultato</CommandEmpty>
                        <CommandGroup>
                          {suggestions.map((suggestion: any) => (
                            <CommandItem
                              key={suggestion.id}
                              value={suggestion.title}
                              onSelect={(value) => {
                                setSearchQuery(value);
                                setShowSuggestions(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{suggestion.title}</span>
                                <span className="text-sm text-muted-foreground">{suggestion.city}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              >
                {viewMode === "list" ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${viewMode === "map" ? "" : "overflow-auto mt-[140px] pb-20 md:pb-0"}`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Caricamento...</p>
            </div>
          ) : viewMode === "map" ? (
            <div className="fixed top-[140px] left-0 right-0 bottom-[64px] md:bottom-0">
              <MapView professionals={professionals || []} />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {professionals && professionals.length > 0 ? (
                professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">
                    Nessun professionista trovato
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Prova a modificare i filtri di ricerca
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </MobileLayout>
  );
}
