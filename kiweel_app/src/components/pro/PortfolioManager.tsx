import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PortfolioManagerProps {
  proId: string;
}

export default function PortfolioManager({ proId }: PortfolioManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images = [], refetch } = useQuery({
    queryKey: ["portfolio", proId],
    queryFn: async () => {
      const { data } = await supabase
        .from("portfolio_images")
        .select("*")
        .eq("pro_id", proId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!proId,
  });

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${proId}/portfolio/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("post-images").upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("portfolio_images").insert({
        pro_id: proId,
        image_url: publicUrl,
      });

      if (insertError) throw insertError;

      toast.success("Immagine aggiunta al portfolio!");
      refetch();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Errore nel caricamento dell'immagine");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("portfolio_images").delete().eq("id", deleteId);

      if (error) throw error;

      toast.success("Immagine eliminata");
      refetch();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Errore nell'eliminazione");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Il tuo portfolio</h3>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
              disabled={isUploading}
            />
            <Button
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isUploading ? "Caricamento..." : "Nuova immagine"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Presentati con impatto! Carica qui le tue foto migliori.</p>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nessuna immagine nel portfolio</p>
          <p className="text-sm text-muted-foreground mt-2">Carica le tue prime foto per mostrare i tuoi lavori</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              {/* Blurred background image */}
              <img
                src={image.image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "blur(3px)", transform: "scale(2)" }}
                aria-hidden="true"
              />

              {/* Main image */}
              <img
                src={image.image_url}
                alt="Portfolio"
                className="absolute inset-0 w-full h-full object-contain cursor-pointer z-10 p-1"
                onClick={() => setSelectedImage(image.image_url)}
              />

              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(image.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina immagine</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa immagine dal portfolio?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
