import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { MapPin, User as UserIcon, Heart, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
// Logo removed - using text branding
import { clientProfileSchema } from "@/lib/validations";
import { HEALTH_GOALS, FITNESS_LEVELS, type FitnessLevel } from "@/lib/constants";

export default function OnboardingClient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    enableLocation: false,
    health_goals: [] as string[],
    fitness_level: "" as FitnessLevel | "",
    medical_conditions: "",
    allergies: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Errore: utente non trovato");
      return;
    }

    setLoading(true);

    try {
      // Validate input
      const validatedData = clientProfileSchema.parse({
        name: formData.name,
        city: formData.city || undefined
      });

      // Update user profile with wellness data
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: validatedData.name,
          health_goals: formData.health_goals,
          fitness_level: formData.fitness_level || null,
          medical_conditions: formData.medical_conditions ? [formData.medical_conditions] : null,
          allergies: formData.allergies ? [formData.allergies] : null,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Assign role using secure edge function
      const { data: session } = await supabase.auth.getSession();
      const { error: roleError } = await supabase.functions.invoke('assign-role', {
        body: { role: 'client' },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`
        }
      });

      if (roleError) {
        console.error("Role assignment error:", roleError);
        throw new Error("Errore nell'assegnazione del ruolo");
      }

      // Request geolocation if enabled
      if (formData.enableLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Location enabled:", position.coords);
              toast.success("Geolocalizzazione attivata!");
            },
            (error) => {
              console.error("Geolocation error:", error);
              toast.error("Impossibile ottenere la posizione");
            }
          );
        }
      }

      toast.success("Profilo completato!");
      navigate("/");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.message || "Errore durante la configurazione");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-primary">Kiweel</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <UserIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Benvenuto su Kiweel!</h1>
          <p className="text-muted-foreground">
            Completa il tuo profilo wellness per iniziare il tuo percorso
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mario Rossi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Città (opzionale)</Label>
              <Input
                id="city"
                type="text"
                placeholder="Milano"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Ci aiuta a mostrarti KIWEERIST nella tua zona
              </p>
            </div>

            {/* Health Goals */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Obiettivi di Benessere (seleziona tutti quelli che ti interessano)
              </Label>
              <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg">
                {HEALTH_GOALS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${goal}`}
                      checked={formData.health_goals.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            health_goals: [...formData.health_goals, goal],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            health_goals: formData.health_goals.filter((g) => g !== goal),
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`goal-${goal}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Livello di Fitness
              </Label>
              <Select
                value={formData.fitness_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, fitness_level: value as FitnessLevel })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il tuo livello" />
                </SelectTrigger>
                <SelectContent>
                  {FITNESS_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label htmlFor="medical_conditions">Condizioni Mediche (opzionale)</Label>
              <Input
                id="medical_conditions"
                type="text"
                placeholder="es. Ipertensione, Diabete..."
                value={formData.medical_conditions}
                onChange={(e) =>
                  setFormData({ ...formData, medical_conditions: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Informazioni importanti per i tuoi KIWEERIST
              </p>
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergie (opzionale)</Label>
              <Input
                id="allergies"
                type="text"
                placeholder="es. Noci, Latte, Polline..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="location"
                checked={formData.enableLocation}
                onChange={(e) => setFormData({ ...formData, enableLocation: e.target.checked })}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="location" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4 text-primary" />
                  Attiva geolocalizzazione
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Per trovare professionisti vicini a te
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvataggio..." : "Inizia a Cercare"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
