
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useItemAssignments = () => {
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ['item-assignments'],
    queryFn: async () => {
      console.log('useItemAssignments: Fetching assignments...');
      
      try {
        const { data, error } = await supabase
          .from('item_assignments')
          .select(`
            *,
            project_items (
              id,
              numero_item,
              cantidad,
              proyecto_id,
              equipment_id,
              observaciones,
              master_equipment (
                codigo,
                nombre_equipo,
                grupo_generico
              ),
              projects (
                id,
                nombre
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('useItemAssignments: Error fetching assignments:', error);
          throw error;
        }

        console.log('useItemAssignments: Fetched assignments:', data?.length || 0);
        return data || [];
        
      } catch (error) {
        console.error('useItemAssignments: Unexpected error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async ({ itemId, cotizadorId }: { itemId: string; cotizadorId: string }) => {
      console.log('useItemAssignments: Creating assignment:', { itemId, cotizadorId });
      
      const { error } = await supabase
        .from('item_assignments')
        .insert({
          item_id: itemId,
          cotizador_id: cotizadorId,
          estado: 'pendiente'
        });

      if (error) {
        console.error('useItemAssignments: Error creating assignment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ itemId, cotizadorId }: { itemId: string; cotizadorId: string | null }) => {
      console.log('useItemAssignments: Updating assignment:', { itemId, cotizadorId });
      
      if (cotizadorId === null) {
        // Eliminar asignación
        const { error } = await supabase
          .from('item_assignments')
          .delete()
          .eq('item_id', itemId);

        if (error) {
          console.error('useItemAssignments: Error removing assignment:', error);
          throw error;
        }
      } else {
        // Verificar si ya existe una asignación
        const { data: existing } = await supabase
          .from('item_assignments')
          .select('id')
          .eq('item_id', itemId)
          .maybeSingle();

        if (existing) {
          // Actualizar asignación existente
          const { error } = await supabase
            .from('item_assignments')
            .update({ cotizador_id: cotizadorId })
            .eq('item_id', itemId);

          if (error) {
            console.error('useItemAssignments: Error updating assignment:', error);
            throw error;
          }
        } else {
          // Crear nueva asignación
          const { error } = await supabase
            .from('item_assignments')
            .insert({
              item_id: itemId,
              cotizador_id: cotizadorId,
              estado: 'pendiente'
            });

          if (error) {
            console.error('useItemAssignments: Error creating assignment:', error);
            throw error;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    error: assignmentsQuery.error,
    createAssignment: createAssignmentMutation.mutate,
    updateAssignment: updateAssignmentMutation.mutate,
    isCreating: createAssignmentMutation.isPending,
    isUpdating: updateAssignmentMutation.isPending,
  };
};
