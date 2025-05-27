
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEquipmentChangeLogs = (equipmentId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const changeLogsQuery = useQuery({
    queryKey: ['equipment-change-logs', equipmentId],
    queryFn: async () => {
      console.log('useEquipmentChangeLogs: Fetching change logs for equipment:', equipmentId);
      
      let query = supabase
        .from('equipment_change_logs')
        .select(`
          *,
          users (
            nombre,
            email
          )
        `)
        .order('fecha_cambio', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useEquipmentChangeLogs: Error fetching change logs:', error);
        throw error;
      }

      console.log('useEquipmentChangeLogs: Fetched change logs:', data?.length || 0);
      return data || [];
    },
    enabled: !!equipmentId,
    retry: 2,
    retryDelay: 1000,
  });

  const createChangeLogMutation = useMutation({
    mutationFn: async (logData: {
      equipment_id: string;
      tipo_cambio: string;
      valor_anterior?: string;
      valor_nuevo?: string;
      observaciones?: string;
    }) => {
      console.log('Creating equipment change log:', logData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('equipment_change_logs')
        .insert({
          ...logData,
          usuario_id: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating change log:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-change-logs'] });
      toast({
        title: "Log registrado",
        description: "El cambio se registró correctamente en el historial",
      });
    },
    onError: (error) => {
      console.error('Error creating change log:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el cambio en el historial",
        variant: "destructive",
      });
    },
  });

  return {
    changeLogs: changeLogsQuery.data || [],
    isLoading: changeLogsQuery.isLoading,
    error: changeLogsQuery.error,
    createChangeLog: createChangeLogMutation.mutateAsync, // Using mutateAsync for better async handling
    isCreatingLog: createChangeLogMutation.isPending,
  };
};
