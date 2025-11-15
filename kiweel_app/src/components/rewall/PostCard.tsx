import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { POST_CATEGORIES } from "@/lib/constants";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url: string | null;
    post_category?: string;
    post_type?: string; // Legacy support
    likes_count: number;
    created_at: string;
    professionals: {
      id: string;
      title: string;
      city: string;
      users: {
        name: string | null;
        avatar_url: string | null;
      };
    };
  };
  isLiked: boolean;
  onLikeToggle: () => void;
}

export function PostCard({ post, isLiked, onLikeToggle }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Devi effettuare il login per mettere mi piace");
      return;
    }

    setIsLiking(true);
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from("post_interactions" as any)
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .eq("interaction_type", "like");

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from("post_interactions" as any)
          .insert({
            post_id: post.id,
            user_id: user.id,
            interaction_type: "like",
          } as any);

        if (error) throw error;
      }
      onLikeToggle();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Errore nel mettere mi piace");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post di ${post.professionals.users.name}`,
          text: post.content,
          url: window.location.origin + `/professional/${post.professionals.id}`,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.origin + `/professional/${post.professionals.id}`
        );
        toast.success("Link copiato negli appunti");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/professional/${post.professionals.id}`);
  };

  // Get category info - support both post_category (new) and post_type (legacy)
  const categoryId = post.post_category || post.post_type || "showcase";
  const categoryInfo = POST_CATEGORIES.find((cat) => cat.id === categoryId) || POST_CATEGORIES[0];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "ora";
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.professionals.users.avatar_url || undefined} />
          <AvatarFallback>
            {post.professionals.users.name?.charAt(0).toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {post.professionals.users.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {post.professionals.title} · {post.professionals.city}
          </p>
        </div>
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.label}</span>
        </Badge>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative aspect-square w-full">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-2 group"
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-foreground group-hover:text-red-500"
            }`}
          />
          <span className="text-sm font-medium">{post.likes_count}</span>
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 group">
          <Share2 className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm">
          <span className="font-semibold mr-2">{post.professionals.users.name}</span>
          {post.content}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDate(post.created_at)}
        </p>
      </div>
    </Card>
  );
}
