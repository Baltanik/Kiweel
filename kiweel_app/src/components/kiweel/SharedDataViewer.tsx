import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, User, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { SHARED_DATA_TYPES } from "@/lib/constants";
import { SharedDataDetail } from "./SharedDataDetail";

interface SharedData {
  id: string;
  data_type: string;
  category: string;
  content: any;
  created_at: string;
  professional: {
    title: string;
    profession_type: string;
    users: {
      name: string;
      avatar_url?: string;
    };
  };
  visibility: string;
}

export function SharedDataViewer() {
  const { user } = useAuth();
  const [sharedData, setSharedData] = useState<SharedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDataId, setSelectedDataId] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchSharedData();
    }
  }, [user, filterType]);

  const fetchSharedData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("shared_data")
        .select(
          `
          *,
          professional:professionals!shared_data_professional_id_fkey(
            title,
            profession_type,
            users(name, avatar_url)
          )
        `
        )
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("data_type", filterType as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSharedData((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching shared data:", error);
      toast.error("Errore nel caricamento dei dati condivisi");
    } finally {
      setLoading(false);
    }
  };

  const getDataTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      diet_plan: "Piano Alimentare",
      workout_plan: "Piano Allenamento",
      diagnosis: "Diagnosi",
      progress: "Progresso",
      prescription: "Prescrizione",
    };
    return labels[type] || type;
  };

  const getDataTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      diet_plan: "🥗",
      workout_plan: "💪",
      diagnosis: "📋",
      progress: "📊",
      prescription: "💊",
    };
    return icons[type] || "📄";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleViewDetails = (data: SharedData) => {
    setSelectedDataId(data.id);
    setDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailModalOpen(false);
    setSelectedDataId("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-green-500" size={24} />
            Dati Condivisi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dati condivisi dai tuoi KIWEERIST
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtra per tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            {Object.entries(SHARED_DATA_TYPES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {getDataTypeLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shared Data List */}
      {sharedData.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun dato condiviso</h3>
          <p className="text-sm text-gray-600 mb-4">
            I tuoi KIWEERIST possono condividere piani alimentari, allenamenti e altre informazioni qui
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sharedData.map((data) => (
            <Card
              key={data.id}
              className="p-4 border border-gray-200 hover:border-green-300 transition-all cursor-pointer"
              onClick={() => handleViewDetails(data)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getDataTypeIcon(data.data_type)}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{getDataTypeLabel(data.data_type)}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User size={12} />
                        <span>{data.professional?.users?.name || "KIWEERIST"}</span>
                        <span className="text-gray-400">•</span>
                        <span>{data.professional?.title || ""}</span>
                      </div>
                    </div>
                  </div>

                  {data.category && (
                    <Badge variant="outline" className="text-xs mb-2">
                      {data.category}
                    </Badge>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(data.created_at)}
                    </span>
                    {data.visibility === "shared" && (
                      <Badge variant="outline" className="text-xs">
                        Condiviso
                      </Badge>
                    )}
                  </div>

                  {/* Preview content */}
                  {data.content && typeof data.content === "object" && (
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {data.content.name || data.content.title || JSON.stringify(data.content).substring(0, 100)}
                    </div>
                  )}
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
              </div>
            </Card>
          ))}
        </div>
      )}


      {/* Detail Modal */}
      <SharedDataDetail
        sharedDataId={selectedDataId}
        isOpen={detailModalOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}


