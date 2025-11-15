import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { BookingManager } from "@/components/professional/BookingManager";
import { supabase } from "@/integrations/supabase/client";

export default function BookingManagement() {
  const { user } = useAuth();
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setProfessional(data);
      } catch (error) {
        console.error("Error fetching professional:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [user]);

  if (loading) {
    return (
      <ProfessionalLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Caricamento...</p>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  if (!professional) {
    return (
      <ProfessionalLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Profilo professionale non trovato</p>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout>
      <div className="p-6">
        <BookingManager professionalId={professional.id} />
      </div>
    </ProfessionalLayout>
  );
}
