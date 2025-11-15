import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Calendar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["clientBookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select(`
          *,
          professional:professionals!bookings_pro_id_fkey(*, user:users(id, name, avatar_url, phone)),
          service:services(*)
        `)
        .eq("client_id", user?.id || '')
        .order("booking_date", { ascending: true });
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <MobileLayout>
        <div className="min-h-screen">
          <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
            <h1 className="text-2xl font-bold">Calendario</h1>
          </div>
          <div className="p-4 text-center py-12">
            <p className="text-muted-foreground">Devi effettuare l'accesso</p>
            <Button className="mt-4" onClick={() => navigate("/auth")}>
              Accedi
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
          <h1 className="text-2xl font-bold">Calendario</h1>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Caricamento...</p>
            </div>
          ) : bookings?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessuna prenotazione</p>
              <p className="text-sm text-muted-foreground mt-2">
                Le tue prenotazioni appariranno qui
              </p>
            </div>
          ) : (
            bookings?.map((booking: any) => (
              <Card key={booking.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{booking.professional.user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.professional.title}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {booking.status === "confirmed" && "✅ Confermato"}
                    {booking.status === "pending" && "⏳ In attesa"}
                    {booking.status === "cancelled" && "❌ Annullato"}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Data:</span>{" "}
                    {format(new Date(booking.booking_date), "d MMMM yyyy", {
                      locale: it,
                    })}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Ora:</span>{" "}
                    {booking.booking_time}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Servizio:</span>{" "}
                    {booking.service?.name}
                  </p>
                  <p className="font-medium">€{booking.price}</p>
                  {booking.notes && (
                    <p className="text-muted-foreground mt-2">
                      Note: {booking.notes}
                    </p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
