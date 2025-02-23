
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

  const checkAdminRole = async (userId: string | undefined) => {
    console.log('🔍 Checking admin role for user:', userId);
    
    if (!userId) {
      console.log('❌ No user ID provided');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      // Call the has_role function directly with the user ID and 'admin' role
      const { data, error } = await supabase
        .rpc('has_role', { _role: 'admin' });

      if (error) {
        console.error('❌ Error checking admin role:', error);
        toast({
          title: "Error",
          description: "Failed to check admin permissions",
          variant: "destructive"
        });
        setIsAdmin(false);
      } else {
        console.log('✅ Admin role check result:', data);
        setIsAdmin(data ?? false);
      }
    } catch (error) {
      console.error('❌ Error checking admin role:', error);
      setIsAdmin(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    console.log('🔄 Auth context initialized');
    
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📍 Current session:', session?.user?.email);
      setUser(session?.user ?? null);
      checkAdminRole(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      checkAdminRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

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
