import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Phone,
  Euro
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  created_at: string;
  client: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
    description?: string;
    duration_minutes: number;
  };
}

interface BookingManagerProps {
  professionalId: string;
}

export function BookingManager({ professionalId }: BookingManagerProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isCompletingBooking, setIsCompletingBooking] = useState(false);

  useEffect(() => {
    if (professionalId) {
      fetchBookings();
    }
  }, [professionalId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:users!bookings_client_id_fkey(
            id,
            name,
            email,
            avatar_url,
            phone
          ),
          service:services!bookings_service_id_fkey(
            id,
            name,
            description,
            duration_minutes
          )
        `)
        .eq("professional_id", professionalId)
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) throw error;

      setBookings(data as any || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Errore nel caricamento degli appuntamenti");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled", notes?: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: newStatus,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any, notes: notes || booking.notes }
            : booking
        )
      );

      const statusLabels = {
        confirmed: "confermato",
        completed: "completato",
        cancelled: "cancellato"
      };

      toast.success(`Appuntamento ${statusLabels[newStatus as keyof typeof statusLabels] || newStatus}!`);

      if (newStatus === 'completed') {
        toast.success("Il cliente riceverà automaticamente 50 tokens! 🎉");
      }

    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Errore nell'aggiornamento dell'appuntamento");
    }
  };

  const completeBooking = async () => {
    if (!selectedBooking) return;

    setIsCompletingBooking(true);
    try {
      await updateBookingStatus(selectedBooking.id, 'completed', completionNotes);
      setSelectedBooking(null);
      setCompletionNotes("");
    } finally {
      setIsCompletingBooking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'In Attesa',
      confirmed: 'Confermato',
      completed: 'Completato',
      cancelled: 'Cancellato'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const isUpcoming = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    return bookingDateTime >= new Date() && booking.status !== 'completed' && booking.status !== 'cancelled';
  };

  const isPast = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    return bookingDateTime < new Date() || booking.status === 'completed' || booking.status === 'cancelled';
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter(isPast);

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={booking.client?.avatar_url} />
              <AvatarFallback>
                {booking.client?.name?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{booking.client?.name}</h3>
                <Badge className={getStatusColor(booking.status)}>
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(booking.booking_date), 'EEEE dd MMMM yyyy', { locale: it })}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {booking.booking_time} ({booking.service?.duration_minutes || 60} min)
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {booking.service?.name}
                </div>
                <div className="flex items-center">
                  <Euro className="mr-2 h-4 w-4" />
                  €{booking.price}
                </div>
                {booking.client?.email && (
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {booking.client.email}
                  </div>
                )}
              </div>
              
              {booking.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Note:</strong> {booking.notes}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Conferma
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancella
                </Button>
              </>
            )}
            
            {booking.status === 'confirmed' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Completa Appuntamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Stai per completare l'appuntamento con <strong>{booking.client?.name}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Il cliente riceverà automaticamente <strong>50 tokens</strong> come ricompensa.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="completion-notes">Note di completamento (opzionale)</Label>
                      <Textarea
                        id="completion-notes"
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Aggiungi note sull'appuntamento completato..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedBooking(null);
                          setCompletionNotes("");
                        }}
                      >
                        Annulla
                      </Button>
                      <Button
                        onClick={completeBooking}
                        disabled={isCompletingBooking}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCompletingBooking ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Completamento...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Completa Appuntamento
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {booking.client?.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${booking.client.phone}`, '_self')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Chiama
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento appuntamenti...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestione Appuntamenti</h2>
        <p className="text-gray-600">
          Gestisci i tuoi appuntamenti e completa le sessioni con i clienti
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Prossimi ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Passati ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun appuntamento in programma
                </h3>
                <p className="text-gray-500">
                  I tuoi prossimi appuntamenti appariranno qui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {upcomingBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun appuntamento passato
                </h3>
                <p className="text-gray-500">
                  Gli appuntamenti completati appariranno qui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pastBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
