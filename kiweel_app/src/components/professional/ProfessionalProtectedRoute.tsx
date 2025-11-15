import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProfessionalProtectedRouteProps {
  children: React.ReactNode;
}

export function ProfessionalProtectedRoute({ children }: ProfessionalProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has professional role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error checking user role:", roleError);
          setUserRole(null);
        } else {
          setUserRole(roleData?.role || null);
        }
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  // Show loading spinner while checking authentication and role
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to client dashboard if user is a client
  if (userRole === "client") {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to auth if user doesn't have professional role
  if (userRole !== "pro") {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated and has professional role
  return <>{children}</>;
}
