
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
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth: State change detected:', event);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
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
      
      // First, log the current user ID to verify we're checking the right one
      console.log('Auth: Verifying admin status for user:', userId);
      
      // Use the has_role RPC function to check if the user has admin role
      const { data, error } = await supabase
        .rpc('has_role', { _role: 'admin' });

      if (error) {
        console.error('Auth: Error checking admin role:', error);
        console.error('Auth: Error code:', error.code);
        console.error('Auth: Error message:', error.message);
        console.error('Auth: Error details:', error.details);
        
        toast({
          title: "Error",
          description: "Failed to check admin permissions: " + error.message,
          variant: "destructive"
        });
        setIsAdmin(false);
      } else {
        console.log('Auth: Admin role check result:', data);
        setIsAdmin(data === true);
        
        if (data === true) {
          console.log('Auth: User confirmed as admin');
        } else {
          console.log('Auth: User is not an admin');
          // Check if there are any roles for this user
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);
            
          if (roleError) {
            console.error('Auth: Error fetching user roles:', roleError);
          } else {
            console.log('Auth: User roles found:', roleData);
            if (roleData.length === 0) {
              console.log('Auth: No roles found for this user, needs to be assigned in Supabase');
            }
          }
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
