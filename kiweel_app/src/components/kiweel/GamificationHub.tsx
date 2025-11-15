import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Coins, Target, CheckCircle2, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { TOKEN_REWARDS } from "@/lib/constants";
import { TokenService } from "@/integrations/tokens/tokenService";
import { useMissions } from "@/hooks/useMissions";

export function GamificationHub() {
  const { user } = useAuth();
  const [kiweelTokens, setKiweelTokens] = useState(0);
  const { missions, loading } = useMissions({ clientId: user?.id, status: "active" });

  useEffect(() => {
    if (user) {
      fetchTokens();
    }
  }, [user]);

  const fetchTokens = async () => {
    if (!user) return;

    try {
      const balance = await TokenService.getBalance(user.id);
      setKiweelTokens(balance);
    } catch (error: any) {
      console.error("Error fetching tokens:", error);
    }
  };

  const completeMission = async (missionId: string) => {
    if (!user) return;

    try {
      // Get mission details
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return;

      // Update mission status
      const { error: missionError } = await supabase
        .from("missions")
        .update({ status: "completed" })
        .eq("id", missionId);

      if (missionError) throw missionError;

      // Award tokens using TokenService
      const newBalance = await TokenService.awardTokens(
        user.id,
        mission.token_reward ?? 0,
        `Missione completata: ${mission.title ?? 'missione'}`
      );

      setKiweelTokens(newBalance);
      toast.success(`Missione completata! +${mission.token_reward} tokens! 🎉`);
    } catch (error: any) {
      console.error("Error completing mission:", error);
      toast.error("Errore nel completamento della missione");
    }
  };

  const getMissionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: "Giornaliera",
      weekly: "Settimanale",
      milestone: "Traguardo",
    };
    return labels[type] || type;
  };

  const getMissionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      daily: "bg-blue-100 text-blue-700",
      weekly: "bg-purple-100 text-purple-700",
      milestone: "bg-yellow-100 text-yellow-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
  };

  const isExpired = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const activeMissions = missions.filter((m) => m.status === "active" && !isExpired(m.expires_at ?? undefined));
  const completedMissions = missions.filter((m) => m.status === "completed");

  return (
    <div className="space-y-4">
      {/* Tokens Display */}
      <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Coins className="text-yellow-500" size={28} />
              {kiweelTokens}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Kiweel Tokens</p>
          </div>
          <div className="text-right">
            <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">
              <Trophy size={16} className="mr-1" />
              Balance
            </Badge>
          </div>
        </div>
      </Card>

      {/* Active Missions */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="text-blue-500" size={20} />
          Missioni Attive
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        ) : activeMissions.length === 0 ? (
          <Card className="p-6 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Nessuna missione attiva al momento</p>
            <p className="text-xs text-gray-500 mt-1">Completa azioni per sbloccare nuove missioni!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeMissions.map((mission) => {
              const progress = ((mission.current_progress ?? 0) / mission.target_value) * 100;
              const canComplete = (mission.current_progress ?? 0) >= mission.target_value;

              return (
                <Card key={mission.id} className="p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">{mission.title}</h4>
                        <Badge className={`text-xs ${getMissionTypeColor(mission.mission_type)}`}>
                          {getMissionTypeLabel(mission.mission_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {mission.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Scade: {formatDate(mission.expires_at)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Coins size={12} className="text-yellow-500" />
                          +{mission.token_reward} tokens
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        Progresso: {mission.current_progress ?? 0} / {mission.target_value}
                      </span>
                      <span className="font-semibold text-gray-800">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Complete Button */}
                  {canComplete && (
                    <Button
                      className="w-full mt-3 bg-green-500 hover:bg-green-600"
                      onClick={() => completeMission(mission.id)}
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      Completa Missione
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Missioni Completate
          </h3>
          <div className="space-y-2">
            {completedMissions.slice(0, 5).map((mission) => (
              <Card key={mission.id} className="p-3 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={16} />
                    <span className="font-semibold text-gray-800 text-sm">{mission.title}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    +{mission.token_reward} tokens
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Token Rewards Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Zap className="text-blue-500" size={18} />
          Come Guadagnare Tokens
        </h3>
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Check-in giornaliero</span>
            <span className="font-semibold">+{TOKEN_REWARDS.DAILY_CHECK_IN} tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Post pubblicato</span>
            <span className="font-semibold">+{TOKEN_REWARDS.POST_PUBLISHED} tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Commento pubblicato</span>
            <span className="font-semibold">+{TOKEN_REWARDS.COMMENT_POSTED} tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Prenotazione completata</span>
            <span className="font-semibold">+{TOKEN_REWARDS.BOOKING_COMPLETED} tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Workout completato</span>
            <span className="font-semibold">+{TOKEN_REWARDS.WORKOUT_COMPLETED} tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Missione completata</span>
            <span className="font-semibold">+{TOKEN_REWARDS.MISSION_COMPLETED} tokens</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

