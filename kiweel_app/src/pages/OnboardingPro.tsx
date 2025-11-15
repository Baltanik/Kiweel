import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle2, Briefcase } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
// Logo removed - using text branding
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { professionalProfileSchema, serviceSchema } from "@/lib/validations";
import { PROFESSIONAL_CATEGORIES, type ProfessionType } from "@/lib/constants";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPro() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    profession_type: "" as ProfessionType | "",
    specializations: [] as string[],
    certifications: [] as string[],
    health_focus: [] as string[],
    name: "",
    phone: "",
    address: "",
    city: "",
    cap: "",
    latitude: 0,
    longitude: 0,
    title: "",
    bio: "",
    services: [{ name: "", price: "", duration: "" }],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price: "", duration: "" }],
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, services: newServices };
    });
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index),
      }));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.profession_type || !formData.name || !formData.phone || !formData.address) {
        toast.error("Compila tutti i campi obbligatori");
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.title) {
        toast.error("Inserisci il titolo professionale");
        return;
      }
    }

    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Errore: utente non trovato");
      return;
    }

    setLoading(true);

    try {
      // Validate professional profile data
      const validatedProfile = professionalProfileSchema.parse({
        name: formData.name,
        bio: formData.bio || undefined,
        title: formData.title,
        address: formData.address || undefined,
        city: formData.city,
        cap: formData.cap,
        phone: formData.phone || undefined
      });

      // Validate services
      const validatedServices = formData.services
        .filter((s) => s.name && s.price)
        .map((service) => 
          serviceSchema.parse({
            name: service.name,
            price: parseFloat(service.price),
            duration_minutes: service.duration ? parseInt(service.duration) : null,
            description: null
          })
        );

      // Update user profile (without role)
      const { error: userError } = await supabase
        .from("users")
        .update({
          name: validatedProfile.name,
          phone: validatedProfile.phone,
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Assign professional role using secure edge function
      const { data: session } = await supabase.auth.getSession();
      const { error: roleError } = await supabase.functions.invoke('assign-role', {
        body: { role: 'pro' },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`
        }
      });

      if (roleError) {
        console.error("Role assignment error:", roleError);
        throw new Error("Errore nell'assegnazione del ruolo");
      }

      // Create professional profile
      const { data: professional, error: proError } = await supabase
        .from("professionals")
        .insert({
          user_id: user.id,
          profession_type: formData.profession_type as any,
          specializations: formData.specializations.length > 0 ? formData.specializations : null,
          certifications: formData.certifications.length > 0 ? formData.certifications : null,
          health_focus: formData.health_focus.length > 0 ? formData.health_focus : null,
          title: validatedProfile.title,
          bio: validatedProfile.bio || null,
          address: validatedProfile.address || null,
          city: validatedProfile.city,
          cap: validatedProfile.cap,
          latitude: formData.latitude,
          longitude: formData.longitude,
          verified: false,
        })
        .select()
        .single();

      if (proError) throw proError;

      // Create services with validated data
      if (validatedServices.length > 0) {
        const servicesData = validatedServices.map((service) => ({
          pro_id: professional.id,
          name: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes,
          description: service.description
        }));

        const { error: servicesError } = await supabase
          .from("services")
          .insert(servicesData);

        if (servicesError) throw servicesError;
      }

      toast.success("Profilo professionale creato!");
      navigate("/pro/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.message || "Errore durante la creazione del profilo");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all ${
            s === step ? "w-8 bg-primary" : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">Kiweel</span>
          </div>
        </div>
        {renderStepIndicator()}

        {step === 1 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dati Professionali</h2>
                <p className="text-sm text-muted-foreground">Informazioni sulla tua attività</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profession_type">Tipo di Professione *</Label>
                <Select 
                  value={formData.profession_type} 
                  onValueChange={(val) => handleInputChange("profession_type", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona la tua professione wellness" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specializations */}
              <div className="space-y-2">
                <Label>Specializzazioni (opzionale)</Label>
                <Input
                  placeholder="es. Nutrizione sportiva, Dieta chetogenica..."
                  value={formData.specializations.join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                    setFormData({ ...formData, specializations: values });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Separa con virgole
                </p>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Certificazioni (opzionale)</Label>
                <Input
                  placeholder="es. NASM-CPT, ISSA Nutrition..."
                  value={formData.certifications.join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                    setFormData({ ...formData, certifications: values });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Separa con virgole
                </p>
              </div>

              {/* Health Focus */}
              <div className="space-y-2">
                <Label>Focus di Salute (opzionale)</Label>
                <Input
                  placeholder="es. Perdita peso, Recupero infortuni..."
                  value={formData.health_focus.join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                    setFormData({ ...formData, health_focus: values });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Separa con virgole
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Mario Rossi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+39 123 456 7890"
                />
              </div>

              <AddressAutocomplete
                value={formData.address}
                onChange={(data) => {
                  setFormData((prev) => ({
                    ...prev,
                    address: data.address,
                    city: data.city,
                    cap: data.cap,
                    latitude: data.latitude,
                    longitude: data.longitude,
                  }));
                }}
                placeholder="Via Roma 1, Milano"
              />

              {formData.city && formData.cap && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  📍 {formData.city} - {formData.cap}
                </div>
              )}

              <Button onClick={handleNext} className="w-full">
                Continua <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Profilo Pubblico</h2>
              <p className="text-sm text-muted-foreground">Come apparirai ai clienti</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo Professionale *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="es. Parrucchiere Esperto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia (opzionale)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Raccontaci di te e della tua esperienza..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continua <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Listino Prezzi</h2>
              <p className="text-sm text-muted-foreground">Aggiungi i tuoi servizi (opzionale, puoi farlo dopo)</p>
            </div>

            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <Card key={index} className="p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Nome Servizio</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        placeholder="es. Taglio + Piega"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Prezzo (€)</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(index, "price", e.target.value)}
                          placeholder="50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Durata (min)</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(index, "duration", e.target.value)}
                          placeholder="60"
                        />
                      </div>
                    </div>

                    {formData.services.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="w-full text-destructive"
                      >
                        Rimuovi
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              <Button variant="outline" onClick={addService} className="w-full">
                + Aggiungi Servizio
              </Button>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continua <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-6">
            <div className="text-center space-y-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Riepilogo</h2>
                <p className="text-sm text-muted-foreground">Controlla i tuoi dati prima di confermare</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Dati Professionali</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Professione:</strong> {PROFESSIONAL_CATEGORIES.find((c) => c.id === formData.profession_type)?.label || formData.profession_type}<br />
                  {formData.specializations.length > 0 && (
                    <>
                      <strong>Specializzazioni:</strong> {formData.specializations.join(", ")}<br />
                    </>
                  )}
                  {formData.certifications.length > 0 && (
                    <>
                      <strong>Certificazioni:</strong> {formData.certifications.join(", ")}<br />
                    </>
                  )}
                  {formData.health_focus.length > 0 && (
                    <>
                      <strong>Focus Salute:</strong> {formData.health_focus.join(", ")}<br />
                    </>
                  )}
                  <strong>Nome:</strong> {formData.name}<br />
                  <strong>Telefono:</strong> {formData.phone}<br />
                  <strong>Città:</strong> {formData.city} ({formData.cap})
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Profilo</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Titolo:</strong> {formData.title}<br />
                  {formData.bio && (
                    <>
                      <strong>Bio:</strong> {formData.bio}
                    </>
                  )}
                </p>
              </div>

              {formData.services[0].name && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Servizi</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {formData.services.filter((s) => s.name).map((service, idx) => (
                      <li key={idx}>
                        {service.name} - €{service.price} {service.duration && `(${service.duration} min)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Creazione..." : "Completa Registrazione"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
