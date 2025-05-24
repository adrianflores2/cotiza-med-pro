
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

// Función para limpiar el estado de autenticación
const cleanupAuthState = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('AuthProvider: Error cleaning up auth state:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    let timeoutId: NodeJS.Timeout;

    // Configurar timeout para evitar carga indefinida
    const setupTimeout = () => {
      timeoutId = setTimeout(() => {
        console.log('AuthProvider: Timeout reached, stopping loading');
        setLoading(false);
      }, 10000); // 10 segundos máximo de carga
    };

    const clearAuthTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    setupTimeout();

    // Configurar listener de cambios de auth PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'No user');
        
        clearAuthTimeout();
        
        try {
          if (session?.user) {
            setUser(session.user);
            // Usar setTimeout para evitar deadlocks
            setTimeout(async () => {
              await fetchUserRole(session.user.id);
            }, 0);
          } else {
            setUser(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('AuthProvider: Error handling auth state change:', error);
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // LUEGO verificar sesión existente
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearAuthTimeout();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          // Limpiar estado corrupto
          cleanupAuthState();
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        console.log('AuthProvider: Initial session:', session?.user?.email || 'No session');
        
        if (session?.user) {
          setUser(session.user);
          setTimeout(async () => {
            await fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('AuthProvider: Unexpected error getting session:', error);
        clearAuthTimeout();
        cleanupAuthState();
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      clearAuthTimeout();
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching user role for:', userId);
      
      // Verificar si el usuario existe en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('AuthProvider: Error fetching user data:', userError);
        setUserRole('coordinador');
        return;
      }

      if (!userData) {
        console.log('AuthProvider: User not found in users table, setting default role');
        setUserRole('coordinador');
        return;
      }

      // Obtener rol del usuario
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (roleError) {
        console.error('AuthProvider: Error fetching user role:', roleError);
        setUserRole('coordinador');
        return;
      }

      const role = roleData?.role || 'coordinador';
      console.log('AuthProvider: User role set to:', role);
      setUserRole(role);
      
    } catch (error) {
      console.error('AuthProvider: Unexpected error fetching user role:', error);
      setUserRole('coordinador');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Starting sign in process for:', email);
      
      // Limpiar estado previo
      cleanupAuthState();
      
      // Intentar cerrar sesión global primero
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('AuthProvider: Could not sign out globally:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        throw error;
      }

      console.log('AuthProvider: Sign in successful for:', email);
      
      // Forzar recarga de página para estado limpio
      if (data.user) {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
      
    } catch (error) {
      console.error('AuthProvider: Unexpected error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Starting sign out process...');
      
      // Limpiar estado primero
      cleanupAuthState();
      
      // Intentar cerrar sesión
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('AuthProvider: Could not sign out:', err);
      }
      
      // Forzar recarga para estado limpio
      window.location.href = '/';
      
    } catch (error) {
      console.error('AuthProvider: Unexpected error signing out:', error);
      // Forzar recarga incluso si hay error
      window.location.href = '/';
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
