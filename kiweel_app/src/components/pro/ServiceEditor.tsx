import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ServiceEditorProps {
  professionalId: string;
}

export default function ServiceEditor({ professionalId }: ServiceEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_minutes: "",
    description: "",
  });

  const { data: services, refetch } = useQuery({
    queryKey: ["services", professionalId],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("pro_id", professionalId)
        .order("created_at", { ascending: true });
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      pro_id: professionalId,
      name: formData.name,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes) || null,
      description: formData.description || null,
    };

    if (editingService) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingService.id);

      if (error) {
        toast.error("Errore nell'aggiornamento del servizio");
        return;
      }
      toast.success("Servizio aggiornato");
    } else {
      const { error } = await supabase.from("services").insert(payload);

      if (error) {
        toast.error("Errore nella creazione del servizio");
        return;
      }
      toast.success("Servizio creato");
    }

    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({ name: "", price: "", duration_minutes: "", description: "" });
    refetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      toast.error("Errore nell'eliminazione del servizio");
      return;
    }
    toast.success("Servizio eliminato");
    refetch();
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      duration_minutes: service.duration_minutes?.toString() || "",
      description: service.description || "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({ name: "", price: "", duration_minutes: "", description: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Listino Prezzi</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Servizio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Modifica Servizio" : "Nuovo Servizio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Servizio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Prezzo (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Durata (minuti)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingService ? "Aggiorna" : "Crea"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services?.length === 0 ? (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            Nessun servizio nel listino
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {services?.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    €{service.price}
                    {service.duration_minutes &&
                      ` • ${service.duration_minutes} min`}
                  </p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(service)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
