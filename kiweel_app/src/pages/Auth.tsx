import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
// Logo removed - using text branding instead

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Inserisci email e password");
      return;
    }

    setLoading(true);
    
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      // Ottieni i dati dell'utente per il messaggio di benvenuto
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();
        
        const userName = profile?.name || user.email?.split('@')[0] || 'Utente';
        toast.success(`Benvenuto, ${userName}!`);
      } else {
        toast.success("Benvenuto!");
      }
      navigate("/");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Inserisci la tua email");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setResetEmailSent(true);
      toast.success("Email di reset inviata! Controlla la tua casella.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pt-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">Kiweel</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {showForgotPassword ? "Recupera Password" : "Benvenuto"}
            </h1>
            <p className="text-muted-foreground">
              {showForgotPassword 
                ? "Ti invieremo un'email per reimpostare la password" 
                : "Accedi al tuo account wellness"
              }
            </p>
          </div>
        </div>

        {resetEmailSent ? (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Email Inviata!</h3>
                <p className="text-muted-foreground">
                  Abbiamo inviato un'email a <strong>{email}</strong> con le istruzioni 
                  per reimpostare la tua password.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Torna al Login
              </Button>
            </div>
          </Card>
        ) : showForgotPassword ? (
          <Card className="p-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="tua@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Invio..." : "Invia Email di Reset"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Annulla
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Password dimenticata?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Accesso..." : "Accedi"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Non hai un account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/signup")}
                >
                  Registrati
                </Button>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
