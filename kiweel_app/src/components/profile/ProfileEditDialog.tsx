import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { ImageCropDialog } from "@/components/pro/ImageCropDialog";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "parrucchiere", label: "Parrucchiere" },
  { value: "dentista", label: "Dentista" },
  { value: "idraulico", label: "Idraulico" },
  { value: "elettricista", label: "Elettricista" },
  { value: "avvocato", label: "Avvocato" },
  { value: "fotografo", label: "Fotografo" },
  { value: "barbiere", label: "Barbiere" },
  { value: "estetista", label: "Estetista" },
  { value: "medico", label: "Medico" },
  { value: "altro", label: "Altro" },
];

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [proId, setProId] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<{ url: string; type: "avatar" | "hero" } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatar_url: "",
    hero_image_url: "",
    // Pro fields
    category: "",
    title: "",
    bio: "",
    address: "",
    city: "",
    cap: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (!open || !user?.id) {
      // Reset form quando il dialog si chiude
      if (!open) {
        setFormData({
          name: "",
          phone: "",
          avatar_url: "",
          hero_image_url: "",
          category: "",
          title: "",
          bio: "",
          address: "",
          city: "",
          cap: "",
          latitude: 0,
          longitude: 0,
        });
      }
      return;
    }

    const loadUserData = async () => {
      setLoadingData(true);
      try {
        // Carica dati utente
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, phone, avatar_url")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        // Controlla se è professionista
        const { data: proData, error: proError } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (proData && !proError) {
          setIsPro(true);
          setProId(proData.id);
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            avatar_url: userData.avatar_url || "",
            hero_image_url: proData.hero_image_url || "",
            category: proData.profession_type || "",
            title: proData.title || "",
            bio: proData.bio || "",
            address: proData.address || "",
            city: proData.city || "",
            cap: proData.cap || "",
            latitude: proData.latitude || 0,
            longitude: proData.longitude || 0,
          });
        } else {
          setIsPro(false);
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            avatar_url: userData.avatar_url || "",
            hero_image_url: "",
            category: "",
            title: "",
            bio: "",
            address: "",
            city: "",
            cap: "",
            latitude: 0,
            longitude: 0,
          });
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        toast.error("Errore nel caricamento dei dati");
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [open, user?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seleziona un'immagine valida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'immagine deve essere inferiore a 5MB");
      return;
    }

    // Create object URL for cropper
    const url = URL.createObjectURL(file);
    setCropImage({ url, type: "avatar" });
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seleziona un'immagine valida");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'immagine deve essere inferiore a 10MB");
      return;
    }

    // Create object URL for cropper
    const url = URL.createObjectURL(file);
    setCropImage({ url, type: "hero" });
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropImage) return;

    const type = cropImage.type;
    const isHero = type === "hero";
    
    if (isHero) {
      setUploadingHero(true);
    } else {
      setUploading(true);
    }

    try {
      const fileName = `${user?.id}-${type}-${Date.now()}.jpg`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (isHero) {
        setFormData({ ...formData, hero_image_url: publicUrl });
        toast.success("Immagine hero caricata");
      } else {
        setFormData({ ...formData, avatar_url: publicUrl });
        toast.success("Avatar caricato");
      }

      setCropImage(null);
      URL.revokeObjectURL(cropImage.url);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      if (isHero) {
        setUploadingHero(false);
      } else {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          avatar_url: formData.avatar_url,
        },
      });

      if (authError) throw authError;

      // Update users table
      const { error: dbError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
        })
        .eq("id", user?.id || '');

      if (dbError) throw dbError;

      // Se è pro, aggiorna anche professionals
      if (isPro && proId) {
        const { error: proError } = await supabase
          .from("professionals")
          .update({
            category: formData.category as any,
            title: formData.title,
            bio: formData.bio,
            address: formData.address,
            city: formData.city,
            cap: formData.cap,
            latitude: formData.latitude,
            longitude: formData.longitude,
            hero_image_url: formData.hero_image_url,
          })
          .eq("id", proId);

        if (proError) throw proError;
      }

      toast.success("Profilo aggiornato");
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Profilo</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hero Image for pro users */}
            {isPro && (
              <div>
                <div
                  className="relative w-full h-32 rounded overflow-hidden border border-dashed cursor-pointer"
                  onClick={() => document.getElementById("hero-upload")?.click()}
                >
                  {formData.hero_image_url ? (
                    <img
                      src={formData.hero_image_url}
                      alt="Hero"
                      className={`w-full h-full object-cover transition-opacity ${uploadingHero ? "opacity-50" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                      Nessuna immagine hero
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white gap-2 text-sm">
                    {uploadingHero ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        Aggiorna header
                      </>
                    )}
                  </div>
                </div>
                <input
                  id="hero-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroUpload}
                />
              </div>
            )}

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative inline-block cursor-pointer group rounded-full"
                onClick={() => document.getElementById("avatar-upload")?.click()}
              >
                <Avatar className={`w-24 h-24 ${uploading ? "opacity-50" : ""}`}>
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback>
                    {formData.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white gap-1 text-sm">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Modifica
                    </>
                  )}
                </div>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Il tuo nome"
                required
              />
            </div>

            {/* Telefono */}
            <div>
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+39 123 456 7890"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email} disabled />
            </div>

            {/* CAMPI PROFESSIONISTA */}
            {isPro && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4">Informazioni Professionali</h3>
                  
                  {/* Categoria */}
                  <div className="mb-4">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Titolo */}
                  <div className="mb-4">
                    <Label htmlFor="title">Titolo Professionale *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Es: Parrucchiere Esperto"
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Raccontaci qualcosa su di te..."
                      rows={3}
                    />
                  </div>

                  {/* Indirizzo */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <Label>Indirizzo Attività</Label>
                    </div>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={(result) => {
                        setFormData({
                          ...formData,
                          address: result.address,
                          city: result.city,
                          cap: result.cap,
                          latitude: result.latitude,
                          longitude: result.longitude,
                        });
                      }}
                    />
                  </div>

                  {/* Città e CAP */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Città</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Milano"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cap">CAP</Label>
                      <Input
                        id="cap"
                        value={formData.cap}
                        onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                        placeholder="20100"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Salva"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>

      {/* Image Crop Dialog */}
      {cropImage && (
        <ImageCropDialog
          open={!!cropImage}
          imageUrl={cropImage.url}
          aspectRatio={cropImage.type === "avatar" ? 1 : 16 / 9}
          onComplete={handleCropComplete}
          onCancel={() => {
            URL.revokeObjectURL(cropImage.url);
            setCropImage(null);
          }}
        />
      )}
    </Dialog>
  );
}
