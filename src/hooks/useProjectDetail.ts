
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectDetail = (projectId: string, filters?: {
  grupoGenerico?: string;
  searchTerm?: string;
  estado?: string;
}) => {
  const projectDetailQuery = useQuery({
    queryKey: ['project-detail', projectId, filters],
    queryFn: async () => {
      console.log('useProjectDetail: Fetching project detail for:', projectId, 'with filters:', filters);
      
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

      let items = project.project_items || [];

      // Aplicar filtros
      if (filters?.grupoGenerico) {
        items = items.filter(item => 
          item.master_equipment?.grupo_generico === filters.grupoGenerico
        );
      }

      if (filters?.estado) {
        items = items.filter(item => item.estado === filters.estado);
      }

      if (filters?.searchTerm && filters.searchTerm.length >= 2) {
        const searchLower = filters.searchTerm.toLowerCase();
        items = items.filter(item => 
          item.master_equipment?.codigo?.toLowerCase().includes(searchLower) ||
          item.master_equipment?.nombre_equipo?.toLowerCase().includes(searchLower)
        );
      }

      // Calcular estadísticas
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
        project_items: items,
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
