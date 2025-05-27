
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentAccessory {
  id: string;
  equipment_id: string;
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  moneda?: string;
  obligatorio: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useEquipmentAccessories = (equipmentId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const accessoriesQuery = useQuery({
    queryKey: ['equipment-accessories', equipmentId],
    queryFn: async () => {
      console.log('useEquipmentAccessories: Fetching accessories for equipment:', equipmentId);
      
      let query = supabase
        .from('equipment_accessories')
        .select('*')
        .eq('activo', true)
        .order('obligatorio', { ascending: false })
        .order('nombre');

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useEquipmentAccessories: Error fetching accessories:', error);
        throw error;
      }

      console.log('useEquipmentAccessories: Fetched accessories:', data?.length || 0);
      return data as EquipmentAccessory[] || [];
    },
    enabled: !!equipmentId,
  });

  const createAccessoryMutation = useMutation({
    mutationFn: async (accessoryData: {
      equipment_id: string;
      nombre: string;
      descripcion?: string;
      precio_referencial?: number;
      moneda?: string;
      obligatorio?: boolean;
    }) => {
      console.log('Creating equipment accessory:', accessoryData);
      
      const { data, error } = await supabase
        .from('equipment_accessories')
        .insert(accessoryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating accessory:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-accessories'] });
      toast({
        title: "Accesorio creado",
        description: "El accesorio se creó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error creating accessory:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el accesorio",
        variant: "destructive",
      });
    },
  });

  const updateAccessoryMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<EquipmentAccessory>;
    }) => {
      const { data, error } = await supabase
        .from('equipment_accessories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-accessories'] });
      toast({
        title: "Accesorio actualizado",
        description: "El accesorio se actualizó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error updating accessory:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el accesorio",
        variant: "destructive",
      });
    },
  });

  return {
    accessories: accessoriesQuery.data || [],
    isLoading: accessoriesQuery.isLoading,
    error: accessoriesQuery.error,
    createAccessory: createAccessoryMutation.mutate,
    updateAccessory: updateAccessoryMutation.mutate,
    isCreating: createAccessoryMutation.isPending,
    isUpdating: updateAccessoryMutation.isPending,
  };
};
