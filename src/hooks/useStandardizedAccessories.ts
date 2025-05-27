
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateStandardizedAccessoryData {
  equipment_id: string;
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  moneda?: string;
  obligatorio: boolean;
}

export const useStandardizedAccessories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrGetStandardizedAccessory = useMutation({
    mutationFn: async (data: CreateStandardizedAccessoryData) => {
      console.log('Creating or getting standardized accessory:', data);

      // Check if accessory already exists for this equipment
      const { data: existingAccessory, error: checkError } = await supabase
        .from('equipment_accessories')
        .select('id')
        .eq('equipment_id', data.equipment_id)
        .eq('nombre', data.nombre)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing accessory:', checkError);
        throw new Error(`Error al verificar accesorio: ${checkError.message}`);
      }

      if (existingAccessory) {
        console.log('Using existing accessory:', existingAccessory.id);
        return existingAccessory;
      }

      // Create new standardized accessory
      const { data: newAccessory, error: createError } = await supabase
        .from('equipment_accessories')
        .insert({
          equipment_id: data.equipment_id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio_referencial: data.precio_referencial,
          moneda: data.moneda || 'USD',
          obligatorio: data.obligatorio,
          activo: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating accessory:', createError);
        throw new Error(`Error al crear accesorio: ${createError.message}`);
      }

      console.log('Created new standardized accessory:', newAccessory);
      return newAccessory;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['equipment-accessories'] });
    },
    onError: (error: Error) => {
      console.error('Standardized accessory creation error:', error);
      toast({
        title: "Error al procesar accesorio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createOrGetStandardizedAccessory: createOrGetStandardizedAccessory.mutate,
    isCreating: createOrGetStandardizedAccessory.isPending,
  };
};
