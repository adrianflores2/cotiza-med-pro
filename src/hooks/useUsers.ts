
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/database';

interface UserWithRoles {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
  updated_at: string;
  roles: UserRole[];
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('useUsers: Fetching users...');
      
      try {
        // Obtener todos los usuarios de la tabla users
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('useUsers: Error fetching users:', usersError);
          throw usersError;
        }

        // Obtener todos los roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');

        if (rolesError) {
          console.error('useUsers: Error fetching user roles:', rolesError);
          throw rolesError;
        }

        // También intentar obtener usuarios de auth que podrían no estar en la tabla users
        try {
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          
          if (!authError && authUsers?.users) {
            // Agregar usuarios de auth que no estén en la tabla users
            const existingUserIds = new Set((users || []).map(u => u.id));
            const missingUsers = authUsers.users.filter(authUser => !existingUserIds.has(authUser.id));
            
            for (const authUser of missingUsers) {
              console.log('useUsers: Found user in auth but not in users table:', authUser.email);
              
              // Intentar crear el registro en la tabla users
              try {
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: authUser.id,
                    nombre: authUser.user_metadata?.nombre || authUser.email?.split('@')[0] || 'Usuario',
                    email: authUser.email || ''
                  });
                
                if (!insertError && users) {
                  // Agregar a la lista local
                  users.push({
                    id: authUser.id,
                    nombre: authUser.user_metadata?.nombre || authUser.email?.split('@')[0] || 'Usuario',
                    email: authUser.email || '',
                    created_at: authUser.created_at,
                    updated_at: authUser.updated_at || authUser.created_at
                  });
                }
              } catch (insertError) {
                console.warn('useUsers: Could not insert missing user:', insertError);
              }
            }
          }
        } catch (authError) {
          console.warn('useUsers: Could not fetch auth users (admin required):', authError);
        }

        const usersWithRoles: UserWithRoles[] = (users || []).map(user => ({
          ...user,
          roles: (userRoles || []).filter(role => role.user_id === user.id).map(role => role.role)
        }));

        console.log('useUsers: Fetched users with roles:', usersWithRoles.length);
        return usersWithRoles;
        
      } catch (error) {
        console.error('useUsers: Unexpected error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      console.log('useUsers: Assigning role:', { userId, role });
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        console.error('useUsers: Error assigning role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('useUsers: Role assignment failed:', error);
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      console.log('useUsers: Removing role:', { userId, role });
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('useUsers: Error removing role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('useUsers: Role removal failed:', error);
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAssigning: assignRoleMutation.isPending,
    isRemoving: removeRoleMutation.isPending,
  };
};
