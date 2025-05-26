
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectDetail = (projectId: string) => {
  const projectDetailQuery = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      console.log('useProjectDetail: Fetching project detail for:', projectId);
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          project_items (
            id,
            numero_item,
            cantidad,
            equipment_id,
            estado,
            observaciones,
            requiere_accesorios,
            master_equipment (
              codigo,
              nombre_equipo,
              grupo_generico
            ),
            item_assignments (
              id,
              cotizador_id,
              estado,
              fecha_asignacion,
              users (
                nombre,
                email
              )
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('useProjectDetail: Error fetching project:', projectError);
        throw projectError;
      }

      // Calcular estadísticas
      const items = project.project_items || [];
      const totalItems = items.length;
      const asignados = items.filter(item => 
        item.item_assignments && item.item_assignments.length > 0
      ).length;
      const cotizados = items.filter(item => item.estado === 'cotizado').length;
      const pendientes = totalItems - cotizados;

      const stats = {
        total: totalItems,
        asignados,
        cotizados,
        pendientes,
        porcentajeProgreso: totalItems > 0 ? Math.round((cotizados / totalItems) * 100) : 0
      };

      console.log('useProjectDetail: Project stats:', stats);

      return {
        ...project,
        stats
      };
    },
    enabled: !!projectId,
  });

  return {
    project: projectDetailQuery.data,
    isLoading: projectDetailQuery.isLoading,
    error: projectDetailQuery.error,
  };
};
