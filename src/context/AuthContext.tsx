
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getSession } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';

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
  signInWithProvider: (provider: 'google' | 'discord') => Promise<void>;
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
  signInWithProvider: async () => {},
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
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the current route should be protected
  const isProtectedRoute = () => {
    return ['/dashboard', '/profile'].includes(location.pathname);
  };

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
          
          // Redirect to sign in if on a protected route
          if (isProtectedRoute()) {
            navigate('/signin');
          }
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
        } else if (isProtectedRoute()) {
          // Redirect to sign in if on a protected route and not authenticated
          navigate('/signin');
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        
        // Redirect to sign in if on a protected route
        if (isProtectedRoute()) {
          navigate('/signin');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

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

  const signInWithProvider = async (provider: 'google' | 'discord') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      
      if (error) throw error;
      
      console.log("Provider auth initiated:", data);
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      toast({
        variant: "destructive",
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed`,
        description: error.message || `There was a problem logging you in with ${provider}.`,
      });
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
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      signup, 
      signInWithProvider,
      logout, 
      isLoading, 
      session 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
