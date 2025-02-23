
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
      return false;
    }

    try {
      console.log('🔄 Calling has_role RPC for user:', userId);
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
        return false;
      }

      console.log('✅ Admin role check result:', data);
      setIsAdmin(data ?? false);
      return data ?? false;
    } catch (error) {
      console.error('❌ Error checking admin role:', error);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    console.log('🔄 Auth context initialized');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📍 Current session:', session?.user?.email);
        
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await checkAdminRole(session.user.id);
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete');
          setIsLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      console.log('🔄 Setting up auth listener...');
      return supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setIsLoading(true);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await checkAdminRole(session.user.id);
          } else {
            setIsAdmin(false);
          }
          
          console.log('✅ Auth state update complete');
          setIsLoading(false);
        }
      });
    };

    initializeAuth();
    const { data: { subscription } } = setupAuthListener();

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('🔄 Auth context state updated:', {
      userEmail: user?.email,
      isAdmin,
      isLoading
    });
  }, [user, isAdmin, isLoading]);

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
