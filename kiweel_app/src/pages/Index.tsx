import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, getUserRole } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      // Se sta ancora caricando, aspetta
      if (loading) return;

      // Se non è loggato, vai al login
      if (!user) {
        navigate("/auth");
        return;
      }

      // Se è loggato, determina il ruolo e reindirizza
      try {
        const role = await getUserRole();
        
        if (role === 'pro') {
          navigate("/pro/dashboard");
        } else {
          // Default: client dashboard (Kiweel Dashboard)
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error getting user role:", error);
        // Fallback: vai alla dashboard client
        navigate("/dashboard");
      }
    };

    handleRedirect();
  }, [user, loading, navigate, getUserRole]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Kiweel</h1>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Fallback loading (non dovrebbe mai essere mostrato)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Kiweel</h1>
        <p className="text-gray-600">Il tuo ecosistema wellness personale</p>
      </div>
    </div>
  );
}