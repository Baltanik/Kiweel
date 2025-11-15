import { Star, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ProfessionalCardProps {
  professional: any & { distance_km?: number };
}

const categoryLabels: Record<string, string> = {
  parrucchiere: "Parrucchiere",
  dentista: "Dentista",
  idraulico: "Idraulico",
  elettricista: "Elettricista",
  avvocato: "Avvocato",
  fotografo: "Fotografo",
};

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const navigate = useNavigate();
  const minPrice = professional.services?.[0]?.price || 0;
  const lastPost = professional.professional_posts?.[0];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Hero Image */}
      {professional.hero_image_url && (
        <div className="relative h-32 w-full bg-muted">
          <img
            src={professional.hero_image_url}
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex gap-3 p-4">
        <Avatar className="w-16 h-16 flex-shrink-0">
          <AvatarImage src={professional.users?.avatar_url} />
          <AvatarFallback>
            {professional.users?.name?.[0]?.toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {professional.users?.name || professional.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {professional.title}
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {categoryLabels[professional.category]}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {professional.rating?.toFixed(1) || "N/A"}
              </span>
              <span className="text-muted-foreground">
                ({professional.total_reviews || 0})
              </span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {professional.city}
                {professional.distance_km && (
                  <span className="ml-1">• {professional.distance_km} km</span>
                )}
              </span>
            </div>
          </div>

          {lastPost && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
              "{lastPost.content}"
            </p>
          )}

          {minPrice > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Da €{minPrice.toFixed(2)}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/professional/${professional.id}`)}
            >
              Visualizza
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
