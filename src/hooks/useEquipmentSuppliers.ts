
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEquipmentSuppliers = (equipmentId?: string) => {
  const equipmentSuppliersQuery = useQuery({
    queryKey: ['equipment-suppliers', equipmentId],
    queryFn: async () => {
      console.log('useEquipmentSuppliers: Fetching suppliers for equipment:', equipmentId);
      
      const { data, error } = await supabase
        .from('supplier_equipments')
        .select(`
          *,
          suppliers (
            id,
            razon_social,
            ruc,
            pais,
            nombre_contacto,
            email_contacto
          ),
          master_equipment (
            codigo,
            nombre_equipo,
            grupo_generico
          )
        `)
        .eq('equipment_id', equipmentId)
        .eq('activo', true)
        .order('precio_unitario', { ascending: true });

      if (error) {
        console.error('useEquipmentSuppliers: Error fetching suppliers:', error);
        throw error;
      }

      console.log('useEquipmentSuppliers: Fetched suppliers:', data?.length || 0);
      return data || [];
    },
    enabled: !!equipmentId,
  });

  return {
    suppliers: equipmentSuppliersQuery.data || [],
    isLoading: equipmentSuppliersQuery.isLoading,
    error: equipmentSuppliersQuery.error,
  };
};
