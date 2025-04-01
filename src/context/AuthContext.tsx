
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getUser } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

// Define the shape of our user object
type User = {
  email: string;
  name?: string;
} | null;

// Define the shape of the context
type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isLoading: false,
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuth = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // If checking fails, log user out
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    
    toast({
      title: "Logged in successfully",
      description: `Welcome${userData?.name ? ` ${userData.name}` : ''}!`,
    });
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging you out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
