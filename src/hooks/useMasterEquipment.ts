
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMasterEquipment = () => {
  const equipmentQuery = useQuery({
    queryKey: ['master-equipment'],
    queryFn: async () => {
      console.log('useMasterEquipment: Fetching equipment...');
      
      try {
        const { data, error } = await supabase
          .from('master_equipment')
          .select('*')
          .order('codigo');

        if (error) {
          console.error('useMasterEquipment: Error fetching equipment:', error);
          throw error;
        }

        console.log('useMasterEquipment: Fetched equipment:', data?.length || 0);
        return data || [];
        
      } catch (error) {
        console.error('useMasterEquipment: Unexpected error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  return {
    equipment: equipmentQuery.data || [],
    isLoading: equipmentQuery.isLoading,
    error: equipmentQuery.error,
  };
};
