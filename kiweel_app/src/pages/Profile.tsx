import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogIn, User as UserIcon, Settings, Bell, Shield, LogOut, Briefcase, Edit, Trophy, TrendingUp, ChevronRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id || '')
        .single();
      return data?.role;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Disconnesso con successo");
    navigate("/");
  };

  return (
    <MobileLayout fixedHeader={true}>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Profilo</h1>
        
        {!isLoggedIn ? (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarFallback>
                    <UserIcon className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">Accedi a Kiweel</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accedi per gestire le tue prenotazioni e messaggi
                  </p>
                </div>
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Accedi
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">
                      {user?.user_metadata?.name || "Utente"}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                </div>
              </Card>

              {/* Sezioni principali */}
              <div className="space-y-4">
                {/* Missioni, Progresso e Calendario */}
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3">
                    <button 
                      onClick={() => navigate("/missions")}
                      className="flex flex-col items-center gap-1 w-full text-center"
                    >
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <div>
                        <div className="font-semibold text-xs">Missioni</div>
                        <div className="text-xs text-muted-foreground">Badge</div>
                      </div>
                    </button>
                  </Card>
                  <Card className="p-3">
                    <button 
                      onClick={() => navigate("/progress")}
                      className="flex flex-col items-center gap-1 w-full text-center"
                    >
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                      <div>
                        <div className="font-semibold text-xs">Progresso</div>
                        <div className="text-xs text-muted-foreground">Stats</div>
                      </div>
                    </button>
                  </Card>
                  <Card className="p-3">
                    <button 
                      onClick={() => navigate("/calendar")}
                      className="flex flex-col items-center gap-1 w-full text-center"
                    >
                      <Calendar className="w-6 h-6 text-green-500" />
                      <div>
                        <div className="font-semibold text-xs">Calendario</div>
                        <div className="text-xs text-muted-foreground">Appuntamenti</div>
                      </div>
                    </button>
                  </Card>
                </div>

                {/* Menu opzioni */}
                <div className="space-y-2">
                  {userRole === "pro" && (
                    <Card className="p-4">
                      <button 
                        onClick={() => navigate("/pro/dashboard")}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-primary" />
                          <span className="font-medium text-primary">Dashboard Professionista</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </Card>
                  )}
                  <Card className="p-4">
                    <button 
                      onClick={() => navigate("/settings")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                        <span>Impostazioni</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </Card>
                  <Card className="p-4">
                    <button className="flex items-center justify-between w-full text-left">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <span>Notifiche</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </Card>
                  <Card className="p-4">
                    <button className="flex items-center justify-between w-full text-left">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                        <span>Privacy</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </Card>
                  <Card className="p-4">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full text-left text-destructive"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Disconnetti</span>
                    </button>
                  </Card>
                </div>
              </div>
            </>
          )}

        <ProfileEditDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
        />
      </div>
    </MobileLayout>
  );
}
