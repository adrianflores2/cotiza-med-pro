
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

interface DatabaseUser {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface CreateUserData {
  nombre: string;
  email: string;
  password: string;
  role?: UserRole;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('useUsers: Starting to fetch users...');
      
      try {
        // Verificar autenticación primero
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        console.log('useUsers: Current authenticated user:', currentUser?.email);

        // Obtener todos los usuarios de la tabla users
        console.log('useUsers: Fetching users from public.users table...');
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('useUsers: Users query result:', {
          users: users?.length || 0,
          error: usersError,
          rawData: users
        });

        if (usersError) {
          console.error('useUsers: Error fetching users:', usersError);
          throw usersError;
        }

        // Obtener todos los roles
        console.log('useUsers: Fetching user roles from public.user_roles table...');
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');

        console.log('useUsers: User roles query result:', {
          roles: userRoles?.length || 0,
          error: rolesError,
          rawData: userRoles
        });

        if (rolesError) {
          console.error('useUsers: Error fetching user roles:', rolesError);
          throw rolesError;
        }

        // Combinar usuarios con sus roles
        const usersWithRoles: UserWithRoles[] = (users || []).map(user => {
          const userRoleRecords = (userRoles || []).filter(role => role.user_id === user.id);
          const roles = userRoleRecords.map(role => role.role);
          
          console.log(`useUsers: Processing user ${user.nombre} (${user.email}):`, {
            userId: user.id,
            roleRecords: userRoleRecords,
            finalRoles: roles
          });
          
          return {
            ...user,
            roles
          };
        });

        // Log detallado de cotizadores encontrados
        const quoters = usersWithRoles.filter(user => user.roles.includes('cotizador'));
        console.log('useUsers: Quoters found:', {
          totalUsers: usersWithRoles.length,
          quotersCount: quoters.length,
          quoters: quoters.map(q => ({ name: q.nombre, email: q.email, roles: q.roles }))
        });

        console.log('useUsers: Final result - users with roles:', usersWithRoles);
        return usersWithRoles;
        
      } catch (error) {
        console.error('useUsers: Unexpected error in fetchUsers:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('useUsers: Creating user:', userData.email);
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData
      });

      if (error) {
        console.error('useUsers: Error creating user:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('useUsers: User creation failed:', error);
    },
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
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isCreating: createUserMutation.isPending,
    isAssigning: assignRoleMutation.isPending,
    isRemoving: removeRoleMutation.isPending,
  };
};
