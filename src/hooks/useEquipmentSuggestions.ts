
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEquipmentSuggestions = (searchName: string, threshold: number = 0.6) => {
  const suggestionsQuery = useQuery({
    queryKey: ['equipment-suggestions', searchName, threshold],
    queryFn: async () => {
      console.log('useEquipmentSuggestions: Finding similar equipment for:', searchName);
      
      if (!searchName || searchName.trim().length < 3) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .rpc('find_similar_equipment', {
            search_name: searchName.trim(),
            similarity_threshold: threshold
          });

        if (error) {
          console.error('useEquipmentSuggestions: Error finding similar equipment:', error);
          throw error;
        }

        console.log('useEquipmentSuggestions: Found suggestions:', data?.length || 0);
        return data || [];
        
      } catch (error) {
        console.error('useEquipmentSuggestions: Unexpected error:', error);
        throw error;
      }
    },
    enabled: searchName.trim().length >= 3,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    suggestions: suggestionsQuery.data || [],
    isLoading: suggestionsQuery.isLoading,
    error: suggestionsQuery.error,
  };
};
