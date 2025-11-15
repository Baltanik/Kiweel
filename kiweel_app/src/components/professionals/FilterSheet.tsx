import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PROFESSIONAL_CATEGORIES } from "@/lib/constants";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    distance: number;
    minRating: number;
    priceRange: [number, number];
    category: string | null;
  };
  onFiltersChange: (filters: any) => void;
}

const categories = PROFESSIONAL_CATEGORIES.map(cat => ({
  value: cat.id,
  label: cat.label,
}));

export function FilterSheet({ open, onOpenChange, filters, onFiltersChange }: FilterSheetProps) {
  const handleReset = () => {
    onFiltersChange({
      distance: 50,
      minRating: 0,
      priceRange: [0, 500],
      category: null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Filtri</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value === "all" ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutte le categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <Label>Distanza: {filters.distance} km</Label>
            <Slider
              value={[filters.distance]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, distance: value })
              }
              min={1}
              max={50}
              step={1}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating minimo: {filters.minRating > 0 ? filters.minRating : "Tutti"}</Label>
            <Slider
              value={[filters.minRating]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, minRating: value })
              }
              min={0}
              max={5}
              step={0.5}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>
              Prezzo: €{filters.priceRange[0]} - €{filters.priceRange[1]}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, priceRange: value as [number, number] })
              }
              min={0}
              max={500}
              step={10}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Applica
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
