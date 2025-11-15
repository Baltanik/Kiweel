import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, MapPin, Star, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BookingDialog from "@/components/booking/BookingDialog";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export default function ProfessionalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: professional, isLoading } = useQuery({
    queryKey: ["professional", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select(
          `
          *,
          users(name, avatar_url, phone),
          services(id, name, price, duration_minutes, description),
          portfolio_images(image_url),
          reviews(id, rating, comment, created_at, users(name))
        `,
        )
        .eq("id", id || '')
        .maybeSingle();

      if (error) throw error;
      
      // Salva le coordinate del professionista per mantenere il contesto geografico
      if (data?.latitude && data?.longitude) {
        localStorage.setItem('lastViewedLocation', JSON.stringify({
          lat: data.latitude,
          lng: data.longitude,
          city: data.city
        }));
      }
      
      return data;
    },
  });

  // Fetch professional posts
  const { data: posts } = useQuery({
    queryKey: ["professional-posts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_posts" as any)
        .select("*")
        .eq("pro_id", id)
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="space-y-4 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!professional) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Professionista non trovato</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border pointer-events-auto">
          <div className="flex items-center gap-3 p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-lg">Profilo</h1>
          </div>
        </div>

        {/* Hero Image */}
        {professional.hero_image_url && (
          <div className="relative h-64 bg-muted">
            <img src={professional.hero_image_url} alt={professional.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Profile Header */}
          <div className="flex gap-4 items-start">
            <Avatar className="w-20 h-20 border-4 border-background">
              <AvatarImage src={professional.users?.avatar_url || undefined} />
              <AvatarFallback className="text-xl">{professional.users?.name?.[0]?.toUpperCase() || "P"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2">
              <h2 className="font-bold text-2xl">{professional.users?.name}</h2>
              <p className="text-muted-foreground">{professional.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{professional.city}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{professional.rating?.toFixed(1) || "N/A"}</span>
              <span className="text-sm text-muted-foreground">({professional.total_reviews || 0})</span>
            </div>
            {professional.verified && <Badge variant="secondary">✓ Verificato</Badge>}
          </div>

          {/* Bio */}
          {professional.bio && <p className="text-sm text-muted-foreground leading-relaxed">{professional.bio}</p>}

          {/* Action Buttons */}
          <div
            className={`grid gap-3 ${professional.services && professional.services.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <Button variant="default" className="flex-1" onClick={() => setIsBookingOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Contatta
            </Button>
            {professional.services && professional.services.length > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setIsBookingOpen(true)}>
                Prenota
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="prezzi">Prezzi</TabsTrigger>
              <TabsTrigger value="recensioni">Recensioni</TabsTrigger>
            </TabsList>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-3">
              {professional.portfolio_images && professional.portfolio_images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {professional.portfolio_images.map((img: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative w-full overflow-hidden rounded-lg"
                      style={{ paddingBottom: "100%" }}
                    >
                      {/* Blurred background image */}
                      <img
                        src={img.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "blur(3px)", transform: "scale(2)" }}
                        aria-hidden="true"
                      />

                      {/* Main image */}
                      <img
                        src={img.image_url}
                        alt={`Portfolio ${idx + 1}`}
                        className="absolute inset-0 w-full h-full object-contain z-10 p-1 cursor-pointer"
                        onClick={() => setSelectedImage(img.image_url)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nessuna immagine nel portfolio</p>
                </Card>
              )}
            </TabsContent>

            {/* Feed Tab */}
            <TabsContent value="feed" className="space-y-4">
              {posts && posts.length > 0 ? (
                posts.map((post: any) => (
                  <Card key={post.id} className="overflow-hidden">
                    {post.image_url && (
                      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "100%" }}>
                        {/* Blurred background image */}
                        <img
                          src={post.image_url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ filter: "blur(3px)", transform: "scale(2)" }}
                          aria-hidden="true"
                        />

                        {/* Main image */}
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="absolute inset-0 w-full h-full object-contain p-1 z-10 cursor-pointer"
                          onClick={() => setSelectedImage(post.image_url)}
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{post.likes_count || 0}</span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nessun post pubblicato</p>
                </Card>
              )}
            </TabsContent>

            {/* Prezzi Tab */}
            <TabsContent value="prezzi" className="space-y-3">
              {professional.services && professional.services.length > 0 ? (
                professional.services.map((service: any) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                        {service.duration_minutes && (
                          <p className="text-xs text-muted-foreground mt-1">Durata: {service.duration_minutes} min</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">€{service.price}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nessun servizio disponibile</p>
                </Card>
              )}
            </TabsContent>

            {/* Recensioni Tab */}
            <TabsContent value="recensioni" className="space-y-4">
              {professional.reviews && professional.reviews.length > 0 ? (
                professional.reviews.map((review: any) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{review.users?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">{review.users?.name || "Anonimo"}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nessuna recensione ancora</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        professionalId={id!}
        services={professional.services || []}
      />

      {/* Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </MobileLayout>
  );
}
