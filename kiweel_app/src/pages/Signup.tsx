import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Mail, ArrowLeft, Briefcase, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// Logo removed - using text branding

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"client" | "pro" | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUpAsClient, signUpAsProfessional } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: "client" | "pro") => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Inserisci email e password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    if (password.length < 6) {
      toast.error("La password deve essere di almeno 6 caratteri");
      return;
    }

    if (!selectedRole) {
      toast.error("Seleziona un tipo di account");
      return;
    }

    setLoading(true);
    
    let error;
    
    if (selectedRole === "client") {
      // For client, we'll collect name and health_goals in onboarding
      // So we just create basic account here
      const { error: signUpError } = await signUpAsClient(email, password, "", []);
      error = signUpError;
    } else {
      // For professional, we need profession_type in onboarding
      // So we just create basic account here
      const { error: signUpError } = await signUpAsProfessional(email, password, "", "PT", []);
      error = signUpError;
    }

    if (error) {
      toast.error(error.message || "Errore durante la registrazione");
      setLoading(false);
    } else {
      // Redirect to onboarding based on role
      const onboardingPath = selectedRole === "client" ? "/onboarding/client" : "/onboarding/pro";
      navigate(onboardingPath);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background p-4 pt-8">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Login
          </Button>

          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">Kiweel</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Crea il tuo Account</h1>
              <p className="text-muted-foreground">
                Scegli il tipo di account che desideri creare
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all"
              onClick={() => handleRoleSelect("client")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Sono un Kiweer</h2>
                  <p className="text-sm text-muted-foreground">
                    Cerca e prenota KIWEERIST nella tua zona
                  </p>
                </div>
                <Button className="w-full">
                  Continua come Kiweer
                </Button>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-all"
              onClick={() => handleRoleSelect("pro")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Sono un Kiweerist</h2>
                  <p className="text-sm text-muted-foreground">
                    Ricevi prenotazioni e gestisci la tua attività wellness
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  Continua come Kiweerist
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedRole(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Registrati come {selectedRole === "client" ? "Kiweer" : "Kiweerist"}
          </h1>
          <p className="text-muted-foreground">
            Crea il tuo account per iniziare
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimo 6 caratteri
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creazione account..." : "Crea Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/auth")}
              >
                Accedi
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
