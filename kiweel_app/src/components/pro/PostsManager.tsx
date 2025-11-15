import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
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

interface PostsManagerProps {
  proId: string;
}

const POST_TYPE_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  work_showcase: { label: "Lavoro", variant: "default" },
  tip: { label: "Consiglio", variant: "secondary" },
  offer: { label: "Offerta", variant: "destructive" },
  announcement: { label: "Annuncio", variant: "outline" },
};

export default function PostsManager({ proId }: PostsManagerProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["myPosts", proId],
    queryFn: async () => {
      const { data } = await supabase
        .from("professional_posts" as any)
        .select("*")
        .eq("pro_id", proId)
        .order("created_at", { ascending: false });
      return (data as any[]) || [];
    },
    enabled: !!proId,
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("professional_posts" as any)
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Post eliminato");
      refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Errore nell'eliminazione");
    } finally {
      setDeleteId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Nessun post pubblicato</p>
        <p className="text-sm text-muted-foreground mt-2">
          Clicca sul pulsante + in basso per creare il tuo primo post
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const typeInfo = POST_TYPE_LABELS[post.post_type] || POST_TYPE_LABELS.work_showcase;

        return (
          <Card key={post.id} className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(post.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm mb-3">{post.content}</p>

            {/* Image */}
            {post.image_url && (
              <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "100%" }}>
                {/* Blurred background image */}
                <img
                  src={post.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-200"
                  style={{ filter: "blur(3px)", transform: "scale(2)" }}
                  aria-hidden="true"
                />

                {/* Main image */}
                <img
                  src={post.image_url}
                  alt="Post"
                  className="absolute inset-0 w-full h-full object-contain p-1 z-10 cursor-pointer"
                  onClick={() => setSelectedImage(post.image_url)}
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count}</span>
                </div>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: it,
                  })}
                </span>
              </div>
              <Badge variant="outline">{post.visibility}</Badge>
            </div>
          </Card>
        );
      })}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina post</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo post? Non potrai recuperarlo.
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
