
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getSession } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Define the shape of our user object
type AuthUser = {
  id: string;
  email: string;
  name?: string;
} | null;

// Define the shape of the context
type AuthContextType = {
  user: AuthUser;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  session: Session | null;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isLoading: false,
  session: null,
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        console.log("Session:", session);
        
        if (session) {
          const authUser = session.user;
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name as string,
          });
          setSession(session);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data);
        
        if (data.session) {
          const authUser = data.session.user;
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name as string,
          });
          setSession(data.session);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: authUser, session: authSession } = await supabaseSignIn(email, password);
      console.log("Login result:", { authUser, authSession });
      
      if (authUser) {
        toast({
          title: "Logged in successfully",
          description: `Welcome${authUser.user_metadata?.name ? ` ${authUser.user_metadata.name}` : ''}!`,
        });
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "There was a problem logging you in.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const { user: authUser, session: authSession } = await supabaseSignUp(email, password, name);
      console.log("Signup result:", { authUser, authSession });
      
      if (authUser) {
        toast({
          title: "Account created successfully",
          description: "You can now sign in with your credentials.",
        });
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "There was a problem creating your account.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabaseSignOut();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "There was a problem logging you out.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, isLoading, session }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
