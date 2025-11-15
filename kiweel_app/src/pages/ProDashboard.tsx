import { MobileLayout } from "@/components/layout/MobileLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, MessageSquare, Calendar, DollarSign, Image, FileText, Plus, ArrowLeft } from "lucide-react";
import StatsWidget from "@/components/pro/StatsWidget";
import { Button } from "@/components/ui/button";
import BookingCalendar from "@/components/pro/BookingCalendar";
import ServiceEditor from "@/components/pro/ServiceEditor";
import { CreatePostModal } from "@/components/rewall/CreatePostModal";
import PortfolioManager from "@/components/pro/PortfolioManager";
import PostsManager from "@/components/pro/PostsManager";
import { useState } from "react";

export default function ProDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { data: professional } = useQuery({
    queryKey: ["professional", user?.id || ''],
    queryFn: async () => {
      const { data } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user?.id || '')
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["proStats", professional?.id],
    queryFn: async () => {
      const [messages, bookings] = await Promise.all([
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user?.id || ''),
        supabase
          .from("bookings")
          .select("*")
          .eq("pro_id", professional?.id || ''),
      ]);

      const totalRevenue = bookings.data?.reduce((sum, b) => sum + Number(b.price), 0) || 0;

      return {
        leads: messages.count || 0,
        messages: messages.count || 0,
        bookings: bookings.data?.length || 0,
        revenue: totalRevenue,
      };
    },
    enabled: !!professional?.id,
  });

  const { data: _conversations } = useQuery({
    queryKey: ["proMessages", user?.id || ''],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .eq("receiver_id", user?.id || '')
        .order("created_at", { ascending: false });

      const uniqueConversations = data?.reduce((acc: any[], msg: any) => {
        if (!acc.find((c) => c.sender.id === msg.sender.id)) {
          acc.push(msg);
        }
        return acc;
      }, []);

      return uniqueConversations || [];
    },
    enabled: !!user,
  });

  const { data: _myPosts, refetch: refetchPosts } = useQuery({
    queryKey: ["myPosts", professional?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("professional_posts" as any)
        .select("*")
        .eq("pro_id", professional?.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data as any[] || [];
    },
    enabled: !!professional?.id,
  });

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Devi effettuare l'accesso</p>
        </div>
      </MobileLayout>
    );
  }

  if (!professional) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen px-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Non hai un profilo professionale
            </p>
            <Button onClick={() => navigate("/pro/signup")}>
              Crea Profilo Professionista
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Dashboard Pro</h1>
        </div>
      </div>

      <div className="pb-20">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Prenotazioni
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Servizi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatsWidget
                title="Lead"
                value={stats?.leads || 0}
                icon={MessageSquare}
              />
              <StatsWidget
                title="Messaggi"
                value={stats?.messages || 0}
                icon={MessageSquare}
              />
              <StatsWidget
                title="Prenotazioni"
                value={stats?.bookings || 0}
                icon={Calendar}
              />
              <StatsWidget
                title="Revenue"
                value={`€${stats?.revenue || 0}`}
                icon={DollarSign}
              />
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="p-4">
            <PortfolioManager proId={professional.id} />
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed" className="p-4">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">I tuoi feed</h2>
                <Button size="sm" onClick={() => setIsPostModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Post
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Dai voce alla tua attività: consiglia, pubblica offerte e novità! Fatti riconoscere!
              </p>
            </div>
            <PostsManager proId={professional.id} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="p-4">
            <BookingCalendar professionalId={professional.id} />
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="p-4">
            <ServiceEditor professionalId={professional.id} />
          </TabsContent>
        </Tabs>

        {/* Create Post Modal */}
        {professional && (
          <CreatePostModal
            open={isPostModalOpen}
            onOpenChange={setIsPostModalOpen}
            proId={professional.id}
            onPostCreated={() => {
              refetchPosts();
            }}
          />
        )}
      </div>
    </MobileLayout>
  );
}
