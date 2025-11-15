import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import { Calendar, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TokenService } from "@/integrations/tokens/tokenService";
// Date formatting helper
const formatDate = (dateString: string, formatStr: string) => {
  const date = new Date(dateString);
  if (formatStr === "yyyy-MM-dd") {
    return date.toISOString().split("T")[0];
  }
  if (formatStr === "dd/MM") {
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  }
  return date.toLocaleDateString("it-IT");
};

interface ProgressEntry {
  id?: string;
  tracking_date: string;
  weight?: number | null;
  measurements?: any;
  energy_level?: number | null;
  mood?: string | null;
  notes?: string | null;
}

interface FormData {
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  energy_level?: number;
  mood?: number;
  notes?: string;
}

export function ProgressTracker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    date: formatDate(new Date().toISOString(), "yyyy-MM-dd"),
    weight: undefined,
    chest: undefined,
    waist: undefined,
    hips: undefined,
    energy_level: 5,
    mood: 5,
    notes: "",
  });
  const [history, setHistory] = useState<ProgressEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("client_id", user.id)
        .order("tracking_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching progress history:", error);
      toast.error("Errore nel caricamento dello storico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("progress_tracking").upsert({
        client_id: user.id,
        tracking_date: formData.date,
        weight: formData.weight || null,
        measurements: {
          chest: formData.chest || 0,
          waist: formData.waist || 0,
          hips: formData.hips || 0,
        },
        energy_level: formData.energy_level || null,
        mood: formData.mood ? String(formData.mood) : null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      // Award tokens for logging progress (first time today)
      const today = formatDate(new Date().toISOString(), "yyyy-MM-dd");
      const hasLoggedToday = history.some((entry) => entry.tracking_date === today);
      
      if (!hasLoggedToday) {
        try {
          await TokenService.awardTokensForAction(user.id, "DAILY_CHECK_IN");
          toast.success("Progress salvato! +5 tokens 🎉");
        } catch (tokenError) {
          console.error("Error awarding tokens:", tokenError);
          toast.success("Progress salvato con successo!");
        }
      } else {
        toast.success("Progress salvato con successo!");
      }

      setShowForm(false);
      setFormData({
        date: formatDate(new Date().toISOString(), "yyyy-MM-dd"),
        weight: undefined,
        chest: undefined,
        waist: undefined,
        hips: undefined,
        energy_level: 5,
        mood: 5,
        notes: "",
      });
      fetchHistory();
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error(error.message || "Errore nel salvataggio");
    } finally {
      setLoading(false);
    }
  };

  const weightData = history.filter((h) => h.weight).map((h) => ({
    date: h.tracking_date,
    value: h.weight!,
  }));

  const energyData = history.filter((h) => h.energy_level).map((h) => ({
    date: h.tracking_date,
    value: h.energy_level!,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-green-500" size={24} />
            Tracciamento Progressi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Monitora il tuo percorso wellness</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "Annulla" : "+ Nuovo"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="energy">Livello Energia (1-10)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[formData.energy_level || 5]}
                    onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="text-center text-sm font-semibold text-gray-700">{formData.energy_level || 5}/10</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest">Torace (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.5"
                  placeholder="100"
                  value={formData.chest || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, chest: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist">Vita (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.5"
                  placeholder="80"
                  value={formData.waist || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, waist: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hips">Fianchi (cm)</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.5"
                  placeholder="95"
                  value={formData.hips || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, hips: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Umore (1-10)</Label>
              <div className="space-y-2">
                <Slider
                  value={[formData.mood || 5]}
                  onValueChange={([value]) => setFormData({ ...formData, mood: value })}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="text-center text-sm font-semibold text-gray-700">{formData.mood || 5}/10</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                placeholder="Come ti senti oggi? Note aggiuntive..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva Progress"}
            </Button>
          </form>
        </Card>
      )}

      {/* Charts */}
      {history.length > 0 && (
        <div className="space-y-4">
          {/* Weight Chart */}
          {weightData.length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={20} />
                Andamento Peso
              </h3>
              <div className="h-48 flex items-end justify-between gap-1">
                {weightData.slice(0, 7).reverse().map((point, index) => {
                  const maxWeight = Math.max(...weightData.map((d) => d.value));
                  const minWeight = Math.min(...weightData.map((d) => d.value));
                  const range = maxWeight - minWeight || 1;
                  const height = ((point.value - minWeight) / range) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-xs text-gray-600 font-semibold">{point.value}kg</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(point.date, "dd/MM")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Energy Level Chart */}
          {energyData.length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-green-500" size={20} />
                Livello Energia
              </h3>
              <div className="h-48 flex items-end justify-between gap-1">
                {energyData.slice(0, 7).reverse().map((point, index) => {
                  const height = (point.value / 10) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-green-500 rounded-t transition-all"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-xs text-gray-600 font-semibold">{point.value}/10</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(point.date, "dd/MM")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* History Timeline */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-purple-500" size={20} />
              Storico Recente
            </h3>
            <div className="space-y-3">
              {history.slice(0, 10).map((entry) => (
                <div key={entry.id || entry.tracking_date} className="border-l-2 border-purple-300 pl-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800">
                      {new Date(entry.tracking_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {entry.weight && (
                      <span className="text-sm text-blue-600 font-semibold">{entry.weight}kg</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {entry.energy_level && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        Energia: {entry.energy_level}/10
                      </span>
                    )}
                    {entry.mood && (
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        Umore: {entry.mood}/10
                      </span>
                    )}
                    {entry.measurements?.chest && <span>Torace: {entry.measurements.chest}cm</span>}
                    {entry.measurements?.waist && <span>Vita: {entry.measurements.waist}cm</span>}
                    {entry.measurements?.hips && <span>Fianchi: {entry.measurements.hips}cm</span>}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{entry.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {history.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun progresso registrato</h3>
          <p className="text-sm text-gray-600 mb-4">Inizia a tracciare i tuoi progressi per vedere i risultati!</p>
          <Button onClick={() => setShowForm(true)}>Registra Primo Progress</Button>
        </Card>
      )}
    </div>
  );
}

