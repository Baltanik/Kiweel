import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { type ProfessionType } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signUpAsClient: (email: string, password: string, name: string, health_goals?: string[]) => Promise<{ error: any }>;
  signUpAsProfessional: (
    email: string,
    password: string,
    name: string,
    profession_type: ProfessionType,
    specializations?: string[]
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getUserRole: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signUpAsClient = async (
    email: string,
    password: string,
    name: string,
    health_goals: string[] = []
  ) => {
    // Sign up in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'client',
        },
      },
    });

    if (authError) return { error: authError };

    if (authData.user) {
      // Wait for trigger to create user, then update with wellness fields
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          health_goals,
          role: 'client',
        })
        .eq('id', authData.user.id);

      if (updateError) return { error: updateError };

      // Create user_role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'client',
        });

      if (roleError) return { error: roleError };
    }

    return { error: null };
  };

  const signUpAsProfessional = async (
    email: string,
    password: string,
    name: string,
    _profession_type: ProfessionType,
    _specializations: string[] = []
  ) => {
    // Sign up in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'pro',
        },
      },
    });

    if (authError) return { error: authError };

    if (authData.user) {
      // Wait for trigger to create user, then update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'pro',
        })
        .eq('id', authData.user.id);

      if (updateError) return { error: updateError };

      // Create user_role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'pro',
        });

      if (roleError) return { error: roleError };

      // Professional profile will be created in onboarding
      // We don't create it here because we need more info (city, address, etc.)
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const getUserRole = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('role', { ascending: true })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data?.role || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signUpAsClient,
      signUpAsProfessional,
      signOut, 
      getUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
