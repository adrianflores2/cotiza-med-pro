
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('AuthProvider: Initial session:', session?.user?.email || 'No session');
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('AuthProvider: Unexpected error getting session:', error);
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'No user');
        
        try {
          if (session?.user) {
            setUser(session.user);
            await fetchUserRole(session.user.id);
          } else {
            setUser(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('AuthProvider: Error handling auth state change:', error);
        }
        
        setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching user role for:', userId);
      
      // First, check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('AuthProvider: Error fetching user data:', userError);
        return;
      }

      if (!userData) {
        console.log('AuthProvider: User not found in users table');
        setUserRole('coordinador'); // Default role
        return;
      }

      // Then fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (roleError) {
        console.error('AuthProvider: Error fetching user role:', roleError);
        setUserRole('coordinador'); // Default role
        return;
      }

      const role = roleData?.role || 'coordinador';
      console.log('AuthProvider: User role:', role);
      setUserRole(role);
      
    } catch (error) {
      console.error('AuthProvider: Unexpected error fetching user role:', error);
      setUserRole('coordinador'); // Default role
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        throw error;
      }

      console.log('AuthProvider: Sign in successful for:', email);
      // The auth state change listener will handle setting the user and role
      
    } catch (error) {
      console.error('AuthProvider: Unexpected error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Error signing out:', error);
      }
    } catch (error) {
      console.error('AuthProvider: Unexpected error signing out:', error);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
