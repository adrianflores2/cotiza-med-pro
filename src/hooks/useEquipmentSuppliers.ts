
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EquipmentSupplier {
  id: string;
  equipment_id: string;
  proveedor_id: string;
  marca: string;
  modelo: string;
  precio_unitario?: number;
  precio_anterior?: number;
  moneda?: string;
  procedencia?: string;
  catalogo_url?: string;
  ficha_tecnica_url?: string;
  manual_url?: string;
  fecha_cambio_precio?: string;
  fecha_ultima_actualizacion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  suppliers: {
    id: string;
    razon_social: string;
    ruc?: string;
    pais?: string;
    nombre_contacto?: string;
    apellido_contacto?: string;
    email_contacto?: string;
    telefono_contacto?: string;
  };
  master_equipment: {
    codigo: string;
    nombre_equipo: string;
    grupo_generico: string;
  };
}

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
            apellido_contacto,
            email_contacto,
            telefono_contacto
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
      return data as EquipmentSupplier[] || [];
    },
    enabled: !!equipmentId,
  });

  // Get unique suppliers for this equipment
  const uniqueSuppliers = equipmentSuppliersQuery.data?.reduce((acc, current) => {
    const existingSupplier = acc.find(item => item.suppliers.id === current.suppliers.id);
    if (!existingSupplier) {
      acc.push(current);
    }
    return acc;
  }, [] as EquipmentSupplier[]) || [];

  // Get brands for equipment
  const availableBrands = [...new Set(equipmentSuppliersQuery.data?.map(item => item.marca) || [])];

  // Get models for a specific brand
  const getModelsForBrand = (brand: string) => {
    return [...new Set(
      equipmentSuppliersQuery.data
        ?.filter(item => item.marca === brand)
        ?.map(item => item.modelo) || []
    )];
  };

  // Get supplier equipment by brand and model
  const getSupplierEquipment = (brand: string, model: string) => {
    return equipmentSuppliersQuery.data?.find(
      item => item.marca === brand && item.modelo === model
    );
  };

  return {
    suppliers: equipmentSuppliersQuery.data || [],
    uniqueSuppliers,
    availableBrands,
    getModelsForBrand,
    getSupplierEquipment,
    isLoading: equipmentSuppliersQuery.isLoading,
    error: equipmentSuppliersQuery.error,
  };
};
