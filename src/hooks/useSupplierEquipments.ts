
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupplierEquipments = (supplierId?: string, searchTerm?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const supplierEquipmentsQuery = useQuery({
    queryKey: ['supplier-equipments', supplierId, searchTerm],
    queryFn: async () => {
      console.log('useSupplierEquipments: Fetching equipment for supplier:', supplierId, 'search:', searchTerm);
      
      let query = supabase
        .from('supplier_equipments')
        .select(`
          *,
          master_equipment (
            codigo,
            nombre_equipo,
            grupo_generico
          ),
          suppliers (
            razon_social,
            ruc
          )
        `)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (supplierId) {
        query = query.eq('proveedor_id', supplierId);
      }

      if (searchTerm) {
        query = query.or(`master_equipment.codigo.ilike.%${searchTerm}%,master_equipment.nombre_equipo.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useSupplierEquipments: Error fetching equipment:', error);
        throw error;
      }

      console.log('useSupplierEquipments: Fetched equipment:', data?.length || 0);
      return data || [];
    },
    enabled: !searchTerm || searchTerm.length >= 2, // Only search if term has 2+ characters
  });

  const createSupplierEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: {
      equipment_id: string;
      proveedor_id: string;
      marca: string;
      modelo: string;
      precio_unitario?: number;
      moneda?: string;
      procedencia?: string;
      catalogo_url?: string;
      ficha_tecnica_url?: string;
      manual_url?: string;
    }) => {
      console.log('Creating supplier equipment:', equipmentData);
      
      const { data, error } = await supabase
        .from('supplier_equipments')
        .insert(equipmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier equipment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      toast({
        title: "Equipo agregado",
        description: "El equipo se agregó correctamente al proveedor",
      });
    },
    onError: (error) => {
      console.error('Error creating supplier equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el equipo al proveedor",
        variant: "destructive",
      });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ 
      id, 
      precio_unitario 
    }: { 
      id: string; 
      precio_unitario: number;
    }) => {
      // Primero obtener el precio actual para guardarlo como histórico
      const { data: currentEquipment } = await supabase
        .from('supplier_equipments')
        .select('precio_unitario')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('supplier_equipments')
        .update({
          precio_anterior: currentEquipment?.precio_unitario,
          precio_unitario,
          fecha_cambio_precio: new Date().toISOString().split('T')[0],
          fecha_ultima_actualizacion: new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      toast({
        title: "Precio actualizado",
        description: "El precio del equipo se actualizó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio",
        variant: "destructive",
      });
    },
  });

  return {
    equipments: supplierEquipmentsQuery.data || [],
    isLoading: supplierEquipmentsQuery.isLoading,
    error: supplierEquipmentsQuery.error,
    createSupplierEquipment: createSupplierEquipmentMutation.mutate,
    updatePrice: updatePriceMutation.mutate,
    isCreating: createSupplierEquipmentMutation.isPending,
    isUpdatingPrice: updatePriceMutation.isPending,
  };
};
