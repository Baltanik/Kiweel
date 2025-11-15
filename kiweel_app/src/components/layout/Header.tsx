import { useNavigate } from "react-router-dom";

interface HeaderProps {
  fixed?: boolean;
}

export function Header({ fixed = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`w-full border-b bg-nav-background ${fixed ? 'sticky top-0 z-50 bg-nav-background/95 backdrop-blur supports-[backdrop-filter]:bg-nav-background/60' : ''}`}>
      <div className="container flex h-14 items-center px-4">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <span className="text-2xl font-bold text-primary">Kiweel</span>
        </button>
      </div>
    </header>
  );
}
