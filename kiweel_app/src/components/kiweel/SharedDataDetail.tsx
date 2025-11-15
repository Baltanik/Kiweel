import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  FileText,
  User,
  Calendar,
  Eye,
  Download,
  Share2,
  Lock,
  Unlock,
  Clock,
  X
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface SharedDataDetailProps {
  sharedDataId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SharedDataItem {
  id: string;
  data_type: string;
  category: string;
  content: any;
  visibility: 'private' | 'shared';
  created_at: string;
  updated_at: string;
  professional: {
    id: string;
    title: string;
    profession_type: string;
    users: {
      name: string;
      avatar_url?: string;
    };
  };
  client: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface AccessLog {
  id: string;
  accessed_by: string;
  accessed_at: string;
  action: string;
  user: {
    name: string;
    avatar_url?: string;
  };
}

export function SharedDataDetail({ sharedDataId, isOpen, onClose }: SharedDataDetailProps) {
  const { user } = useAuth();
  const [sharedData, setSharedData] = useState<SharedDataItem | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (isOpen && sharedDataId) {
      fetchSharedDataDetail();
      fetchAccessLogs();
    }
  }, [isOpen, sharedDataId]);

  const fetchSharedDataDetail = async () => {
    if (!sharedDataId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shared_data")
        .select(`
          *,
          professional:professionals!shared_data_professional_id_fkey(
            id,
            title,
            profession_type,
            users!professionals_user_id_fkey(name, avatar_url)
          ),
          client:users!shared_data_client_id_fkey(
            id,
            name,
            avatar_url
          )
        `)
        .eq("id", sharedDataId)
        .single();

      if (error) throw error;

      setSharedData(data as any);
      
      // Check if current user is the owner (professional who created it)
      setIsOwner(data.professional?.users?.id === user?.id);

      // Log access
      if (user) {
        await logAccess('view');
      }

    } catch (error) {
      console.error("Error fetching shared data detail:", error);
      toast.error("Errore nel caricamento dei dettagli");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessLogs = async () => {
    if (!sharedDataId) return;

    try {
      const { data, error } = await supabase
        .from("shared_data_access_log")
        .select(`
          *,
          user:users!shared_data_access_log_accessed_by_fkey(name, avatar_url)
        `)
        .eq("shared_data_id", sharedDataId)
        .order("accessed_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setAccessLogs(data as any || []);

    } catch (error) {
      console.error("Error fetching access logs:", error);
    }
  };

  const logAccess = async (action: string) => {
    if (!user || !sharedDataId) return;

    try {
      await supabase
        .from("shared_data_access_log")
        .insert({
          shared_data_id: sharedDataId,
          accessed_by: user.id,
          action,
          accessed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error("Error logging access:", error);
    }
  };

  const toggleVisibility = async () => {
    if (!sharedData || !isOwner) return;

    const newVisibility = sharedData.visibility === 'private' ? 'shared' : 'private';

    try {
      const { error } = await supabase
        .from("shared_data")
        .update({ visibility: newVisibility })
        .eq("id", sharedDataId);

      if (error) throw error;

      setSharedData(prev => prev ? { ...prev, visibility: newVisibility } : null);
      await logAccess(`visibility_changed_to_${newVisibility}`);
      
      toast.success(`Visibilità cambiata a ${newVisibility === 'private' ? 'privato' : 'condiviso'}`);

    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Errore nell'aggiornare la visibilità");
    }
  };

  const downloadData = async () => {
    if (!sharedData) return;

    try {
      const dataToDownload = {
        category: sharedData.category,
        data_type: sharedData.data_type,
        content: sharedData.content,
        created_at: sharedData.created_at,
        professional: sharedData.professional?.users?.name,
        client: sharedData.client?.name
      };

      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sharedData.category.replace(/\s+/g, '_')}_${format(new Date(sharedData.created_at), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logAccess('download');
      toast.success("Dati scaricati con successo");

    } catch (error) {
      console.error("Error downloading data:", error);
      toast.error("Errore nel download");
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'diet_plan': return '🍎';
      case 'workout_plan': return '💪';
      case 'diagnosis': return '🩺';
      case 'prescription': return '💊';
      case 'progress': return '📈';
      default: return '📄';
    }
  };

  const getDataTypeLabel = (dataType: string) => {
    const labels: Record<string, string> = {
      diet_plan: 'Piano Dieta',
      workout_plan: 'Piano Allenamento',
      diagnosis: 'Diagnosi',
      prescription: 'Prescrizione',
      progress: 'Progresso'
    };
    return labels[dataType] || dataType;
  };

  const renderContent = () => {
    if (!sharedData?.content) return null;

    const content = sharedData.content;

    // Render based on data type
    switch (sharedData.data_type) {
      case 'diet_plan':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Nome Piano</h4>
                <p className="text-sm">{content.name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Calorie Target</h4>
                <p className="text-sm">{content.target_calories || 'N/A'} kcal</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700">Descrizione</h4>
              <p className="text-sm text-gray-600">{content.description || 'Nessuna descrizione'}</p>
            </div>
            {content.meals_per_day && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Pasti al Giorno</h4>
                <p className="text-sm">{content.meals_per_day}</p>
              </div>
            )}
          </div>
        );

      case 'workout_plan':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Nome Piano</h4>
                <p className="text-sm">{content.name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Tipo Programma</h4>
                <p className="text-sm">{content.program_type || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700">Descrizione</h4>
              <p className="text-sm text-gray-600">{content.description || 'Nessuna descrizione'}</p>
            </div>
            {content.duration_days && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Durata</h4>
                <p className="text-sm">{content.duration_days} giorni</p>
              </div>
            )}
            {content.total_workouts && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Allenamenti Totali</h4>
                <p className="text-sm">{content.total_workouts}</p>
              </div>
            )}
          </div>
        );

      case 'diagnosis':
      case 'prescription':
      case 'progress':
        return (
          <div className="space-y-4">
            {Object.entries(content).map(([key, value]) => (
              <div key={key}>
                <h4 className="font-medium text-sm text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <p className="text-sm text-gray-600">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{sharedData && getDataTypeIcon(sharedData.data_type)}</span>
              <span>{sharedData?.category || 'Dettagli Dati Condivisi'}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        ) : sharedData ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {getDataTypeLabel(sharedData.data_type)}
                  </Badge>
                  <Badge variant={sharedData.visibility === 'private' ? 'secondary' : 'default'}>
                    {sharedData.visibility === 'private' ? 'Privato' : 'Condiviso'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Creato il {format(new Date(sharedData.created_at), 'dd MMM yyyy HH:mm', { locale: it })}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={downloadData}>
                  <Download className="mr-2 h-4 w-4" />
                  Scarica
                </Button>
                {isOwner && (
                  <Button variant="outline" size="sm" onClick={toggleVisibility}>
                    {sharedData.visibility === 'private' ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Rendi Condiviso
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Rendi Privato
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Professional & Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Professionista
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sharedData.professional?.users?.avatar_url} />
                      <AvatarFallback>
                        {sharedData.professional?.users?.name?.charAt(0)?.toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{sharedData.professional?.users?.name}</p>
                      <p className="text-xs text-gray-500">
                        {sharedData.professional?.profession_type} • {sharedData.professional?.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sharedData.client?.avatar_url} />
                      <AvatarFallback>
                        {sharedData.client?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{sharedData.client?.name}</p>
                      <p className="text-xs text-gray-500">Cliente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Contenuto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>

            {/* Access Log */}
            {accessLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Log Accessi ({accessLogs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {accessLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={log.user?.avatar_url} />
                            <AvatarFallback>
                              {log.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{log.user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {log.action.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(log.accessed_at), 'dd MMM HH:mm', { locale: it })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Dati non trovati</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
