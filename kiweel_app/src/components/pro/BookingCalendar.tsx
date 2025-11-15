import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BookingCalendarProps {
  professionalId: string;
}

export default function BookingCalendar({ professionalId }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: bookings } = useQuery({
    queryKey: ["bookings", professionalId],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select(`
          *,
          client:users!bookings_client_id_fkey(*),
          service:services(*)
        `)
        .eq("pro_id", professionalId)
        .order("booking_date", { ascending: true });
      return data;
    },
  });

  const selectedBookings = bookings?.filter(
    (b) =>
      selectedDate &&
      format(new Date(b.booking_date), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={it}
          className="rounded-md border"
        />
      </Card>

      {selectedDate && (
        <div className="space-y-3">
          <h3 className="font-semibold">
            Prenotazioni del {format(selectedDate, "d MMMM yyyy", { locale: it })}
          </h3>
          {selectedBookings?.length === 0 ? (
            <Card className="p-4">
              <p className="text-muted-foreground text-center">
                Nessuna prenotazione
              </p>
            </Card>
          ) : (
            selectedBookings?.map((booking: any) => (
              <Card key={booking.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{booking.booking_time}</p>
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
                    <p className="text-sm text-muted-foreground">
                      Cliente: {booking.client?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Servizio: {booking.service?.name}
                    </p>
                    <p className="text-sm font-medium">€{booking.price}</p>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
