import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "./MobileLayout";
import { Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TokenService } from "@/integrations/tokens/tokenService";
import { APP_NAME } from "@/lib/constants";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface KiweelLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  fixedHeader?: boolean;
}

export function KiweelLayout({ 
  children, 
  showNav = true, 
  showHeader = true, 
  fixedHeader = false 
}: KiweelLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);

  useEffect(() => {
    if (user && showHeader) {
      fetchTokenBalance();
    }
  }, [user, showHeader]);

  const fetchTokenBalance = async () => {
    if (!user) return;
    
    setLoadingTokens(true);
    try {
      const balance = await TokenService.getBalance(user.id);
      setTokenBalance(balance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
    } finally {
      setLoadingTokens(false);
    }
  };

  return (
    <MobileLayout showNav={showNav} showHeader={false} fixedHeader={fixedHeader}>
      {showHeader && (
        <header 
          className={`w-full border-b bg-gradient-to-r from-primary/95 to-secondary/95 text-white ${
            fixedHeader 
              ? 'sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-primary/80' 
              : ''
          }`}
        >
          <div className="container flex h-14 items-center justify-between px-4">
            <button 
              onClick={() => navigate("/")} 
              className="hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl font-bold text-white">{APP_NAME}</span>
            </button>
            
            {user && (
              <div className="flex items-center gap-3">
                {tokenBalance !== null && (
                  <button
                    onClick={() => navigate("/missions")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <Coins className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {loadingTokens ? "..." : tokenBalance}
                    </span>
                  </button>
                )}
                
                <div className="relative">
                  <NotificationCenter />
                </div>
              </div>
            )}
          </div>
        </header>
      )}
      
      {children}
    </MobileLayout>
  );
}


