import { toast } from "@/components/ui/sonner";

// Compatibility wrapper per mantenere la stessa API
export const useToast = () => ({
  toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
    if (options.variant === "destructive") {
      toast.error(options.title || "Errore", {
        description: options.description,
      });
    } else {
      toast.success(options.title || "Successo", {
        description: options.description,
      });
    }
  }
});

export { toast };