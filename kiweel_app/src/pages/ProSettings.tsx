import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";

export default function ProSettings() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pro/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Impostazioni Kiweel</h1>
        </div>

        <Card className="p-6 space-y-4">
          <p className="text-muted-foreground">Impostazioni dell'applicazione in arrivo...</p>
          <div className="space-y-2">
            <p className="text-sm">• Notifiche</p>
            <p className="text-sm">• Privacy</p>
            <p className="text-sm">• Lingua</p>
            <p className="text-sm">• Tema</p>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
