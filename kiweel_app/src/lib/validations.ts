import { z } from 'zod';

// Post validation schema
export const postSchema = z.object({
  content: z.string()
    .trim()
    .min(1, "Il contenuto non può essere vuoto")
    .max(2000, "Il contenuto deve essere massimo 2000 caratteri"),
  post_category: z.enum(['showcase', 'tip', 'achievement', 'milestone', 'transformation'], {
    errorMap: () => ({ message: "Categoria post non valida" })
  }).optional(),
  // Legacy support
  post_type: z.enum(['work_showcase', 'tip', 'offer', 'announcement'], {
    errorMap: () => ({ message: "Tipo di post non valido" })
  }).optional(),
  image_url: z.string().url("URL immagine non valido").optional().nullable()
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, "Il messaggio non può essere vuoto")
    .max(1000, "Il messaggio deve essere massimo 1000 caratteri")
});

// Booking validation schema
export const bookingSchema = z.object({
  service_id: z.string().uuid("ID servizio non valido"),
  booking_date: z.string().min(1, "Data prenotazione obbligatoria"),
  booking_time: z.string().min(1, "Ora prenotazione obbligatoria"),
  notes: z.string()
    .trim()
    .max(500, "Le note devono essere massimo 500 caratteri")
    .optional()
    .nullable()
});

// Client profile validation schema
export const clientProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Il nome deve essere massimo 100 caratteri"),
  city: z.string()
    .trim()
    .max(100, "La città deve essere massimo 100 caratteri")
    .optional()
});

// Professional profile validation schema
export const professionalProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Il nome deve essere massimo 100 caratteri"),
  bio: z.string()
    .trim()
    .max(500, "La biografia deve essere massimo 500 caratteri")
    .optional(),
  title: z.string()
    .trim()
    .min(1, "Il titolo è obbligatorio")
    .max(100, "Il titolo deve essere massimo 100 caratteri"),
  address: z.string()
    .trim()
    .max(200, "L'indirizzo deve essere massimo 200 caratteri")
    .optional(),
  city: z.string()
    .trim()
    .min(1, "La città è obbligatoria")
    .max(100, "La città deve essere massimo 100 caratteri"),
  cap: z.string()
    .trim()
    .min(5, "Il CAP deve essere di 5 cifre")
    .max(5, "Il CAP deve essere di 5 cifre")
    .regex(/^\d{5}$/, "Il CAP deve contenere solo numeri"),
  phone: z.string()
    .trim()
    .max(20, "Il telefono deve essere massimo 20 caratteri")
    .optional()
});

// Service validation schema
export const serviceSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Il nome del servizio è obbligatorio")
    .max(100, "Il nome deve essere massimo 100 caratteri"),
  price: z.number()
    .positive("Il prezzo deve essere maggiore di zero")
    .max(999999, "Il prezzo massimo è 999,999"),
  duration_minutes: z.number()
    .positive("La durata deve essere maggiore di zero")
    .max(1440, "La durata massima è 1440 minuti (24 ore)")
    .optional()
    .nullable(),
  description: z.string()
    .trim()
    .max(500, "La descrizione deve essere massimo 500 caratteri")
    .optional()
    .nullable()
});