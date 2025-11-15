import { useState, useEffect } from "react";
import { KiweelLayout } from "@/components/layout/KiweelLayout";
import { PostCard } from "@/components/rewall/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CreatePostModal } from "@/components/rewall/CreatePostModal";
import { Button } from "@/components/ui/button";

const POSTS_PER_PAGE = 10;

export default function Kiboard() {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [professional, setProfessional] = useState<any>(null);

  // Fetch user's professional profile if they are a pro
  useEffect(() => {
    if (!user) return;

    const fetchProfessional = async () => {
      const { data } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfessional(data);
    };

    fetchProfessional();
  }, [user]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["kiweel-feed-posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * POSTS_PER_PAGE;
      // Query posts directly instead of RPC function
      const { data, error } = await supabase
        .from("professional_posts")
        .select(`
          *,
          professionals!professional_posts_pro_id_fkey(
            id,
            title,
            city,
            users(name, avatar_url)
          )
        `)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (error) throw error;

      return (data || []).map((post: any) => ({
        ...post,
        professionals: post.professionals || {
          id: "",
          title: "",
          city: "",
          users: {
            name: null,
            avatar_url: null,
          },
        },
      }));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  // Fetch user's liked posts
  useEffect(() => {
    if (!user) return;

    const fetchLikedPosts = async () => {
      const { data } = await supabase
        .from("post_interactions" as any)
        .select("post_id")
        .eq("user_id", user.id)
        .eq("interaction_type", "like");

      if (data) {
        setLikedPosts(new Set(data.map((item: any) => item.post_id)));
      }
    };

    fetchLikedPosts();
  }, [user]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLikeToggle = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    refetch();
  };

  const allPosts = data?.pages.flat() || [];

  return (
    <KiweelLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Kiweel Feed</h1>
              <p className="text-sm text-muted-foreground">
                Scopri i contenuti dei tuoi KIWEERIST
              </p>
            </div>
            {professional && (
              <Button
                size="sm"
                onClick={() => setIsPostModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post
              </Button>
            )}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nessun post disponibile al momento
              </p>
            </div>
          ) : (
            <>
              {allPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isLiked={likedPosts.has(post.id)}
                  onLikeToggle={() => handleLikeToggle(post.id)}
                />
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {professional && (
        <CreatePostModal
          open={isPostModalOpen}
          onOpenChange={setIsPostModalOpen}
          proId={professional.id}
          onPostCreated={() => {
            refetch();
          }}
        />
      )}
    </KiweelLayout>
  );
}
