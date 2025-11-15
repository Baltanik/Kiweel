import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, HelpCircle, FileText, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Menu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: userData } = useQuery({
    queryKey: ["userData", user?.id || ''],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user?.id || '')
        .single();
      return data;
    },
    enabled: !!user,
  });

  return (
    <MobileLayout>
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
          <h1 className="text-2xl font-bold">Menu</h1>
        </div>

        <div className="p-4 space-y-4">
          {userData?.role === "pro" ? (
            <Card className="p-6">
              <div className="text-center space-y-3">
                <Briefcase className="w-12 h-12 mx-auto text-primary" />
                <h2 className="font-semibold text-lg">Area Professionista</h2>
                <p className="text-sm text-muted-foreground">
                  Gestisci il tuo profilo e le prenotazioni
                </p>
                <Button className="w-full" onClick={() => navigate("/pro/dashboard")}>
                  Vai alla Dashboard
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center space-y-3">
                <Briefcase className="w-12 h-12 mx-auto text-primary" />
                <h2 className="font-semibold text-lg">Sei un professionista?</h2>
                <p className="text-sm text-muted-foreground">
                  Unisciti a Kiweel e raggiungi nuovi clienti
                </p>
                <Button className="w-full" onClick={() => navigate("/signup")}>
                  Registrati come Pro
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <Card className="p-4">
              <button className="flex items-center gap-3 w-full text-left">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>Centro Assistenza</span>
              </button>
            </Card>
            <Card className="p-4">
              <button className="flex items-center gap-3 w-full text-left">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span>Termini e Condizioni</span>
              </button>
            </Card>
            <Card className="p-4">
              <button className="flex items-center gap-3 w-full text-left">
                <Info className="w-5 h-5 text-muted-foreground" />
                <span>Info su Kiweel</span>
              </button>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
