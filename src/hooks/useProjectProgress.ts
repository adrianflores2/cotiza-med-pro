
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectProgress = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-progress', projectId],
    queryFn: async () => {
      if (!projectId) return { progress: 0, details: null };

      console.log('Calculating progress for project:', projectId);
      
      // Get all items for the project
      const { data: items, error: itemsError } = await supabase
        .from('project_items')
        .select(`
          id,
          numero_item,
          estado,
          equipment_id,
          master_equipment (
            codigo,
            nombre_equipo
          )
        `)
        .eq('proyecto_id', projectId);

      if (itemsError) {
        console.error('Error fetching project items:', itemsError);
        throw itemsError;
      }

      if (!items || items.length === 0) {
        return { progress: 0, details: { total: 0, cotizados: 0, pendientes: 0, asignados: 0 } };
      }

      // Get quotations for all items
      const itemIds = items.map(item => item.id);
      const { data: quotations, error: quotationsError } = await supabase
        .from('quotations')
        .select('item_id, estado')
        .in('item_id', itemIds)
        .eq('estado', 'vigente');

      if (quotationsError) {
        console.error('Error fetching quotations:', quotationsError);
        throw quotationsError;
      }

      // Get assignments for all items
      const { data: assignments, error: assignmentsError } = await supabase
        .from('item_assignments')
        .select('item_id, estado')
        .in('item_id', itemIds);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }

      // Calculate progress
      const totalItems = items.length;
      const quotedItemIds = new Set(quotations?.map(q => q.item_id) || []);
      const assignedItemIds = new Set(assignments?.map(a => a.item_id) || []);
      
      const cotizados = quotedItemIds.size;
      const asignados = assignedItemIds.size;
      const pendientes = totalItems - asignados;

      const progress = totalItems > 0 ? Math.round((cotizados / totalItems) * 100) : 0;

      const details = {
        total: totalItems,
        cotizados,
        asignados,
        pendientes,
      };

      console.log('Project progress calculated:', { progress, details });
      
      return { progress, details };
    },
    enabled: !!projectId,
  });
};
