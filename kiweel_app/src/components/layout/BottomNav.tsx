import { useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Map, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      activeColor: "text-green-600",
    },
    {
      id: "mykiweel",
      label: "myKiweel",
      icon: FileText,
      path: "/mykiweel",
      activeColor: "text-blue-600",
    },
    {
      id: "specialisti",
      label: "Specialisti",
      icon: Map,
      path: "/discover",
      activeColor: "text-purple-600",
    },
    {
      id: "kiboard",
      label: "Kiboard",
      icon: MessageSquare,
      path: "/feed",
      activeColor: "text-orange-600",
    },
    {
      id: "profilo",
      label: "Profilo",
      icon: User,
      path: "/profile",
      activeColor: "text-gray-600",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    if (path === "/discover") {
      return location.pathname === "/discover" || location.pathname === "/home";
    }
    if (path === "/feed") {
      return location.pathname === "/feed" || location.pathname === "/rewall";
    }
    return location.pathname === path;
  };

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'hsl(var(--nav-background))',
    borderTop: '1px solid hsl(var(--nav-border))',
    zIndex: 50,
    
    // Safe area handling for React Native
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  };

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    height: 64, // Using spacing.tabBar
  };

  return (
    <div style={navStyle}>
      <div style={containerStyle}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? item.activeColor : "text-gray-400"
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}