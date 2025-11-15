import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { bookingSchema } from "@/lib/validations";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  services: any[];
}

export default function BookingDialog({
  open,
  onOpenChange,
  professionalId,
  services,
}: BookingDialogProps) {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  // Fetch occupied slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchOccupiedSlots = async () => {
      setIsLoadingSlots(true);
      // @ts-ignore
      const { data, error } = await supabase.rpc("get_occupied_timeslots" as any, {
        _pro_id: professionalId,
        _booking_date: format(selectedDate, "yyyy-MM-dd"),
      }) as any;

      if (!error && data) {
        setOccupiedSlots(data.map((slot: any) => slot.booking_time));
      }
      setIsLoadingSlots(false);
    };

    fetchOccupiedSlots();
  }, [selectedDate, professionalId]);

  // Real-time updates for bookings
  useEffect(() => {
    if (!selectedDate) return;

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `pro_id=eq.${professionalId}`,
        },
        (payload: any) => {
          if (
            payload.new.booking_date === format(selectedDate, "yyyy-MM-dd")
          ) {
            setOccupiedSlots((prev) => [...prev, payload.new.booking_time]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, professionalId]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Devi effettuare l'accesso per prenotare");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const service = services.find((s) => s.id === selectedService);
    if (!service) {
      toast.error("Servizio non trovato");
      return;
    }

    setIsSubmitting(true);

    // Step 1: Check availability
    // @ts-ignore
    const { data: isAvailable, error: checkError } = await supabase.rpc(
      // @ts-ignore
      "is_timeslot_available" as any,
      {
        _pro_id: professionalId,
        _booking_date: format(selectedDate, "yyyy-MM-dd"),
        _booking_time: selectedTime,
      }
    ) as any;

    if (checkError || !isAvailable) {
      setIsSubmitting(false);
      toast.error("Slot non più disponibile. Seleziona un altro orario.");
      
      // Refresh occupied slots
      // @ts-ignore
      const { data: updatedSlots } = await supabase.rpc(
        // @ts-ignore
        "get_occupied_timeslots" as any,
        {
          _pro_id: professionalId,
          _booking_date: format(selectedDate, "yyyy-MM-dd"),
        }
      ) as any;
      if (updatedSlots) {
        setOccupiedSlots(updatedSlots.map((s: any) => s.booking_time));
      }
      return;
    }

    try {
      // Validate booking data
      const validatedData = bookingSchema.parse({
        service_id: selectedService,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        booking_time: selectedTime,
        notes: notes || null
      });

      // Step 2: Insert booking
      const { data: newBooking, error } = await supabase
        .from("bookings")
        .insert({
          client_id: user.id,
          pro_id: professionalId,
          service_id: validatedData.service_id,
          booking_date: validatedData.booking_date,
          booking_time: validatedData.booking_time,
          price: service.price,
          status: "pending",
          notes: validatedData.notes,
        })
        .select()
        .single();

      if (error) {
        setIsSubmitting(false);
        toast.error("Errore durante la prenotazione");
        console.error(error);
        return;
      }

      // Step 3: Send notification emails
      try {
        await supabase.functions.invoke("send-booking-notification", {
          body: { bookingId: newBooking.id },
        });
        console.log("Notification emails sent");
      } catch (emailError) {
        console.error("Error sending notification emails:", emailError);
        // Don't fail the booking if email fails
      }

      setIsSubmitting(false);
      toast.success("Prenotazione confermata!");
      onOpenChange(false);
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.errors) {
        error.errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error.message || "Errore durante la prenotazione");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Prenota Servizio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service">Servizio</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Seleziona servizio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - €{service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              locale={it}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Orario</Label>
            <Select 
              value={selectedTime} 
              onValueChange={setSelectedTime}
              disabled={!selectedDate || isLoadingSlots}
            >
              <SelectTrigger id="time">
                <SelectValue placeholder={
                  isLoadingSlots 
                    ? "Caricamento..." 
                    : "Seleziona orario"
                } />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => {
                  const isOccupied = occupiedSlots.includes(time);
                  return (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={isOccupied}
                      className={isOccupied ? "opacity-50" : ""}
                    >
                      <div className="flex items-center gap-2">
                        {isOccupied ? "🔴" : "🟢"} {time}
                        {isOccupied && " - Non disponibile"}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Aggiungi eventuali note per il professionista"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Prenotazione in corso..." : "Conferma Prenotazione"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
