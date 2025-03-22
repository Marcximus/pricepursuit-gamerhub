
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Auth: Session check completed', session ? 'User is logged in' : 'No active session');
      setUser(session?.user ?? null);
      checkAdminRole(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth: State change detected:', event);
      setUser(session?.user ?? null);
      checkAdminRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string | undefined) => {
    if (!userId) {
      console.log('Auth: No user ID provided, setting isAdmin to false');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Auth: Checking admin role for user ID:', userId);
      
      const { data, error } = await supabase
        .rpc('has_role', { _role: 'admin' });

      if (error) {
        console.error('Auth: Error checking admin role:', error);
        toast({
          title: "Error",
          description: "Failed to check admin permissions: " + error.message,
          variant: "destructive"
        });
        setIsAdmin(false);
      } else {
        console.log('Auth: Admin role check result:', data);
        setIsAdmin(data ?? false);
        
        if (data) {
          console.log('Auth: User confirmed as admin');
        } else {
          console.log('Auth: User is not an admin');
        }
      }
    } catch (error) {
      console.error('Auth: Exception during admin role check:', error);
      setIsAdmin(false);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading }}>
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
