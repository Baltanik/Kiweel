import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId }: BookingNotificationRequest = await req.json();
    console.log("Processing booking notification for:", bookingId);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details with all related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        services (
          name,
          price
        ),
        professionals!bookings_pro_id_fkey (
          id,
          title,
          users!professionals_user_id_fkey (
            name,
            email
          )
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      throw new Error("Booking not found");
    }

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", booking.client_id)
      .single();

    if (clientError || !client) {
      console.error("Error fetching client:", clientError);
      throw new Error("Client not found");
    }

    const professionalEmail = booking.professionals?.users?.email;
    const professionalName = booking.professionals?.users?.name;
    const clientName = client.name;
    const clientEmail = client.email;
    const serviceName = booking.services?.name || "Servizio";
    const bookingDate = new Date(booking.booking_date).toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const bookingTime = booking.booking_time;
    const price = booking.price;

    console.log("Sending emails to:", { professionalEmail, clientEmail });

    // Send email to professional
    if (professionalEmail) {
      const proEmailResponse = await resend.emails.send({
        from: "Rewido <info@rewido.it>",
        to: [professionalEmail],
        bcc: ["info@rewido.it"],
        subject: `Nuova prenotazione da ${clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Nuova Prenotazione 🎉</h1>
            <p>Ciao ${professionalName},</p>
            <p>Hai ricevuto una nuova richiesta di prenotazione!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Dettagli Prenotazione:</h3>
              <p><strong>Cliente:</strong> ${clientName}</p>
              <p><strong>Email Cliente:</strong> ${clientEmail}</p>
              <p><strong>Servizio:</strong> ${serviceName}</p>
              <p><strong>Data:</strong> ${bookingDate}</p>
              <p><strong>Ora:</strong> ${bookingTime}</p>
              <p><strong>Prezzo:</strong> €${price}</p>
              ${booking.notes ? `<p><strong>Note:</strong> ${booking.notes}</p>` : ""}
            </div>

            <p style="color: #666; font-size: 14px;">
              La prenotazione è in stato <strong>PENDING</strong>. 
              Ricordati di confermarla accedendo alla tua dashboard.
            </p>

            <p>A presto,<br>Il team Rewido</p>
          </div>
        `,
      });

      console.log("Professional email sent:", proEmailResponse);
    }

    // Send confirmation email to client
    const clientEmailResponse = await resend.emails.send({
      from: "Rewido <info@rewido.it>",
      to: [clientEmail],
      bcc: ["info@rewido.it"],
      subject: `Prenotazione confermata con ${professionalName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Prenotazione Inviata ✅</h1>
          <p>Ciao ${clientName},</p>
          <p>La tua prenotazione è stata inviata con successo a <strong>${professionalName}</strong>!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Riepilogo Prenotazione:</h3>
            <p><strong>Professionista:</strong> ${professionalName}</p>
            <p><strong>Servizio:</strong> ${serviceName}</p>
            <p><strong>Data:</strong> ${bookingDate}</p>
            <p><strong>Ora:</strong> ${bookingTime}</p>
            <p><strong>Prezzo:</strong> €${price}</p>
            ${booking.notes ? `<p><strong>Note:</strong> ${booking.notes}</p>` : ""}
          </div>

          <p style="color: #666; font-size: 14px;">
            Il professionista confermerà la tua prenotazione a breve. 
            Riceverai un'email di conferma non appena sarà accettata.
          </p>

          <p>Grazie per aver scelto Rewido!<br>Il team Rewido</p>
        </div>
      `,
    });

    console.log("Client email sent:", clientEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        professionalEmailSent: !!professionalEmail,
        clientEmailSent: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
