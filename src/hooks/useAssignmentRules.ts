
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AssignmentRule } from '@/types/database';

export const useAssignmentRules = () => {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['assignment-rules'],
    queryFn: async (): Promise<AssignmentRule[]> => {
      console.log('useAssignmentRules: Fetching rules...');
      
      try {
        const { data, error } = await supabase
          .from('assignment_rules')
          .select('*')
          .eq('activo', true)
          .order('prioridad', { ascending: false });

        if (error) {
          console.error('useAssignmentRules: Error fetching rules:', error);
          throw error;
        }

        console.log('useAssignmentRules: Fetched rules:', data?.length || 0);
        return data || [];
        
      } catch (error) {
        console.error('useAssignmentRules: Unexpected error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<AssignmentRule, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('useAssignmentRules: Creating rule:', ruleData);
      
      const { data, error } = await supabase
        .from('assignment_rules')
        .insert(ruleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules'] });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<AssignmentRule> & { id: string }) => {
      console.log('useAssignmentRules: Updating rule:', id, updateData);
      
      const { data, error } = await supabase
        .from('assignment_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules'] });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('useAssignmentRules: Deleting rule:', id);
      
      const { error } = await supabase
        .from('assignment_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-rules'] });
    },
  });

  // Función para encontrar el cotizador apropiado basado en reglas
  const findQuoterByRules = (codigo: string, nombre: string, grupo: string): string | null => {
    const rules = rulesQuery.data || [];
    
    for (const rule of rules) {
      let matches = true;
      
      // Verificar patrón de código
      if (rule.patron_codigo) {
        const regex = new RegExp(rule.patron_codigo, 'i');
        if (!regex.test(codigo)) matches = false;
      }
      
      // Verificar patrón de nombre
      if (rule.patron_nombre) {
        const regex = new RegExp(rule.patron_nombre, 'i');
        if (!regex.test(nombre)) matches = false;
      }
      
      // Verificar grupo genérico
      if (rule.grupo_generico) {
        if (rule.grupo_generico.toLowerCase() !== grupo.toLowerCase()) matches = false;
      }
      
      if (matches) {
        console.log(`Found matching rule for ${codigo}: ${rule.nombre}`);
        return rule.cotizador_id;
      }
    }
    
    return null;
  };

  return {
    rules: rulesQuery.data || [],
    isLoading: rulesQuery.isLoading,
    error: rulesQuery.error,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
    findQuoterByRules,
  };
};
