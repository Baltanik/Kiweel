import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { toast } from "@/components/ui/sonner";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropDialog } from "./ImageCropDialog";
import { PROFESSIONAL_CATEGORIES } from "@/lib/constants";

interface ProfileEditorProps {
  proId: string;
}

export default function ProfileEditor({}: ProfileEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [cropImage, setCropImage] = useState<{ url: string; type: "avatar" | "hero" } | null>(null);
  const [formData, setFormData] = useState({
    profession_type: "",
    name: "",
    phone: "",
    address: "",
    cap: "",
    city: "",
    latitude: null as number | null,
    longitude: null as number | null,
    title: "",
    bio: "",
    email: "",
    avatar_url: "",
    hero_image_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      const [{ data: userData }, { data: proData }] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).single(),
        supabase.from("professionals").select("*").eq("user_id", user.id).single(),
      ]);

      if (userData && proData) {
        setFormData({
          profession_type: proData.profession_type || "",
          name: userData.name || "",
          phone: userData.phone || "",
          address: proData.address || "",
          cap: proData.cap || "",
          city: proData.city || "",
          latitude: proData.latitude,
          longitude: proData.longitude,
          title: proData.title || "",
          bio: proData.bio || "",
          email: userData.email || "",
          avatar_url: userData.avatar_url || "",
          hero_image_url: proData.hero_image_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (data: {
    address: string;
    city: string;
    cap: string;
    latitude: number;
    longitude: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      address: data.address,
      city: data.city,
      cap: data.cap,
      latitude: data.latitude,
      longitude: data.longitude,
    }));
  };

  const handleImageSelect = (file: File, type: "avatar" | "hero") => {
    const url = URL.createObjectURL(file);
    setCropImage({ url, type });
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropImage || !user?.id) return;

    const type = cropImage.type;
    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingHero;
    setUploading(true);

    try {
      const fileExt = "jpg";
      const fileName = `${user.id}/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      handleInputChange(type === "avatar" ? "avatar_url" : "hero_image_url", publicUrl);
      toast.success(`${type === "avatar" ? "Avatar" : "Immagine hero"} caricata!`);
      
      // Update UI immediately
      if (type === "avatar") {
        await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", user.id);
      } else {
        await supabase.from("professionals").update({ hero_image_url: publicUrl }).eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Errore nel caricamento");
    } finally {
      setUploading(false);
      setCropImage(null);
      URL.revokeObjectURL(cropImage.url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setLoading(true);

    try {
      if (!formData.name || !formData.phone || !formData.profession_type || !formData.title) {
        toast.error("Compila tutti i campi obbligatori");
        return;
      }

      const [userUpdate, proUpdate] = await Promise.all([
        supabase
          .from("users")
          .update({
            name: formData.name,
            phone: formData.phone,
            avatar_url: formData.avatar_url,
          })
          .eq("id", user.id),
        supabase
          .from("professionals")
          .update({
            profession_type: formData.profession_type as any,
            address: formData.address,
            cap: formData.cap,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            title: formData.title,
            bio: formData.bio,
            hero_image_url: formData.hero_image_url,
          })
          .eq("user_id", user.id),
      ]);

      if (userUpdate.error) throw userUpdate.error;
      if (proUpdate.error) throw proUpdate.error;

      toast.success("Profilo aggiornato con successo!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar & Hero Images */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Immagini Profilo</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Avatar */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" disabled={uploadingAvatar} asChild>
                <label className="cursor-pointer">
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Carica
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file, "avatar");
                    }}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="space-y-2">
            <Label>Immagine Hero</Label>
            <div className="flex flex-col gap-3">
              {formData.hero_image_url ? (
                <img
                  src={formData.hero_image_url}
                  alt="Hero"
                  className="w-full h-24 object-cover rounded"
                />
              ) : (
                <div className="w-full h-24 rounded border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                  Nessuna immagine hero
                </div>
              )}
              <Button size="sm" variant="outline" disabled={uploadingHero} asChild>
                <label className="cursor-pointer">
                  {uploadingHero ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Carica
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file, "hero");
                    }}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Basic Info */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Informazioni Base</h3>
        
        <div className="space-y-2">
          <Label>Email (non modificabile)</Label>
          <Input value={formData.email} disabled />
        </div>

        <div className="space-y-2">
          <Label>Professione *</Label>
          <Select value={formData.profession_type} onValueChange={(v) => handleInputChange("profession_type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona professione" />
            </SelectTrigger>
            <SelectContent>
              {PROFESSIONAL_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nome Completo *</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Mario Rossi"
          />
        </div>

        <div className="space-y-2">
          <Label>Telefono *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+39 123 456 7890"
          />
        </div>

        <div className="space-y-2">
          <Label>Indirizzo</Label>
          <AddressAutocomplete
            value={formData.address}
            onChange={handleAddressChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Titolo Professionale *</Label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="es. Idraulico esperto con 10 anni di esperienza"
          />
        </div>

        <div className="space-y-2">
          <Label>Biografia</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Raccontaci di te e della tua esperienza..."
            rows={4}
          />
        </div>
      </Card>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvataggio...
          </>
        ) : (
          "Salva Modifiche"
        )}
      </Button>

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
    </form>
  );
}
