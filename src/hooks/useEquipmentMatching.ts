
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterEquipment } from './useMasterEquipment';
import type { MasterEquipment } from '@/types/database';

export const useEquipmentMatching = () => {
  const { equipment } = useMasterEquipment();
  const queryClient = useQueryClient();

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: {
      codigo: string;
      nombre_equipo: string;
      grupo_generico: string;
    }) => {
      const { data, error } = await supabase
        .from('master_equipment')
        .insert(equipmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-equipment'] });
    },
  });

  const findOrCreateEquipment = async (
    codigo: string,
    nombre: string,
    grupo: string = 'General'
  ): Promise<MasterEquipment> => {
    console.log('Finding or creating equipment:', { codigo, nombre, grupo });
    
    // Buscar por código exacto
    let existingEquipment = equipment.find(eq => eq.codigo.toLowerCase() === codigo.toLowerCase());
    
    // Si no encuentra por código, buscar por nombre similar
    if (!existingEquipment) {
      existingEquipment = equipment.find(eq => 
        eq.nombre_equipo.toLowerCase().includes(nombre.toLowerCase()) ||
        nombre.toLowerCase().includes(eq.nombre_equipo.toLowerCase())
      );
    }

    if (existingEquipment) {
      console.log('Found existing equipment:', existingEquipment);
      return existingEquipment;
    }

    // Crear nuevo equipo
    console.log('Creating new equipment');
    return new Promise((resolve, reject) => {
      createEquipmentMutation.mutate(
        {
          codigo: codigo || `AUTO-${Date.now()}`,
          nombre_equipo: nombre,
          grupo_generico: grupo,
        },
        {
          onSuccess: (data) => {
            console.log('Equipment created:', data);
            resolve(data);
          },
          onError: (error) => {
            console.error('Error creating equipment:', error);
            reject(error);
          },
        }
      );
    });
  };

  return {
    findOrCreateEquipment,
    isCreating: createEquipmentMutation.isPending,
  };
};
