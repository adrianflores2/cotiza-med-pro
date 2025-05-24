
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectStatus } from '@/types/database';

export const useProjectsData = () => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
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
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data;
    },
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

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProjectStatus: updateProjectStatusMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectStatusMutation.isPending,
  };
};
