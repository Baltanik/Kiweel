import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, User, Download, ChevronRight, Eye } from "lucide-react";
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
  const [selectedData, setSelectedData] = useState<SharedData | null>(null);
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
      {selectedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{getDataTypeIcon(selectedData.data_type)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{getDataTypeLabel(selectedData.data_type)}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} />
                        <span>{selectedData.professional?.users?.name || "KIWEERIST"}</span>
                        <span className="text-gray-400">•</span>
                        <span>{selectedData.professional?.title || ""}</span>
                      </div>
                    </div>
                  </div>
                  {selectedData.category && (
                    <Badge variant="outline" className="mb-2">
                      {selectedData.category}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    Creato il {formatDate(selectedData.created_at)}
                  </span>
                </div>

                {/* Content Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedData.content && typeof selectedData.content === "object" ? (
                    <div className="space-y-3">
                      {selectedData.content.name && (
                        <div>
                          <span className="font-semibold text-gray-700">Nome: </span>
                          <span className="text-gray-800">{selectedData.content.name}</span>
                        </div>
                      )}
                      {selectedData.content.description && (
                        <div>
                          <span className="font-semibold text-gray-700">Descrizione: </span>
                          <span className="text-gray-800">{selectedData.content.description}</span>
                        </div>
                      )}
                      {selectedData.content.notes && (
                        <div>
                          <span className="font-semibold text-gray-700">Note: </span>
                          <span className="text-gray-800">{selectedData.content.notes}</span>
                        </div>
                      )}
                      {selectedData.data_type === "diet_plan" && selectedData.content.macros && (
                        <div>
                          <span className="font-semibold text-gray-700">Macros Target: </span>
                          <span className="text-gray-800">
                            P: {selectedData.content.macros.protein_percent}% | C:{" "}
                            {selectedData.content.macros.carbs_percent}% | G: {selectedData.content.macros.fat_percent}%
                          </span>
                        </div>
                      )}
                      {selectedData.data_type === "workout_plan" && selectedData.content.program_type && (
                        <div>
                          <span className="font-semibold text-gray-700">Tipo Programma: </span>
                          <span className="text-gray-800">{selectedData.content.program_type}</span>
                        </div>
                      )}
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify(selectedData.content, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-800">{String(selectedData.content)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => toast.info("Funzionalità in arrivo!")}>
                    <Download size={16} className="mr-2" />
                    Scarica
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleCloseDetails}>
                    Chiudi
                  </Button>
                </div>
              </div>
            </div>
          </Card>
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


