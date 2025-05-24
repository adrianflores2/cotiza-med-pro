
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMasterEquipment = () => {
  const equipmentQuery = useQuery({
    queryKey: ['master-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_equipment')
        .select('*')
        .order('codigo');

      if (error) {
        console.error('Error fetching master equipment:', error);
        throw error;
      }

      return data;
    },
  });

  return {
    equipment: equipmentQuery.data || [],
    isLoading: equipmentQuery.isLoading,
    error: equipmentQuery.error,
  };
};
