
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectStatus } from '@/types/database';

export const useProjectsData = () => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('useProjectsData: Fetching projects...');
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_items (
              id,
              numero_item,
              cantidad,
              equipment_id,
              master_equipment (
                codigo,
                nombre_equipo,
                grupo_generico
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('useProjectsData: Error fetching projects:', error);
          throw error;
        }

        console.log('useProjectsData: Fetched projects:', data?.length || 0);
        return data || [];
        
      } catch (error) {
        console.error('useProjectsData: Unexpected error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: {
      nombre: string;
      observaciones?: string;
      fecha_vencimiento?: string;
      responsable_id?: string;
      items: Array<{
        numero_item: number;
        equipment_id: string;
        cantidad: number;
        requiere_accesorios?: boolean;
        observaciones?: string;
      }>;
    }) => {
      console.log('Creating project with data:', projectData);
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          nombre: projectData.nombre,
          observaciones: projectData.observaciones,
          fecha_vencimiento: projectData.fecha_vencimiento,
          responsable_id: projectData.responsable_id,
          estado: 'pendiente' as ProjectStatus,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        throw projectError;
      }

      console.log('Project created:', project);

      if (projectData.items.length > 0) {
        const itemsToInsert = projectData.items.map(item => ({
          ...item,
          proyecto_id: project.id,
        }));

        console.log('Creating project items:', itemsToInsert);

        const { error: itemsError } = await supabase
          .from('project_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating project items:', itemsError);
          throw itemsError;
        }
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: ProjectStatus }) => {
      const { error } = await supabase
        .from('projects')
        .update({ estado })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      console.log('Deleting project:', projectId);

      // First get all project items for this project
      const { data: projectItems, error: fetchError } = await supabase
        .from('project_items')
        .select('id')
        .eq('proyecto_id', projectId);

      if (fetchError) {
        console.error('Error fetching project items:', fetchError);
        throw fetchError;
      }

      // Delete item assignments for all project items
      if (projectItems && projectItems.length > 0) {
        const itemIds = projectItems.map(item => item.id);
        
        const { error: assignmentsError } = await supabase
          .from('item_assignments')
          .delete()
          .in('item_id', itemIds);

        // Note: This might fail if there are no assignments, but that's okay
        if (assignmentsError) {
          console.warn('Warning deleting item assignments:', assignmentsError);
        }
      }

      // Delete all project items
      const { error: itemsError } = await supabase
        .from('project_items')
        .delete()
        .eq('proyecto_id', projectId);

      if (itemsError) {
        console.error('Error deleting project items:', itemsError);
        throw itemsError;
      }

      // Finally delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        throw projectError;
      }

      console.log('Project deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProjectStatus: updateProjectStatusMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectStatusMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};
