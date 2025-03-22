
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminRole: (userId?: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  checkAdminRole: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId?: string) => {
    try {
      const idToCheck = userId ?? user?.id;
      
      if (!idToCheck) {
        console.log('No user ID to check admin role for');
        setIsAdmin(false);
        return false;
      }

      console.log('Checking admin role for user:', idToCheck);
      const { data, error } = await supabase.rpc('has_role', { _role: 'admin' });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return false;
      }
      
      console.log('Admin role check result:', data);
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin role:', error);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    // Check current session
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', session ? 'Session exists' : 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Provide more debugging information
  console.log('AuthContext state:', { user: !!user, isAdmin, isLoading });

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, checkAdminRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
