import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentFilters {
  grupoGenerico?: string;
  tipoProveedor?: string;
  moneda?: string;
}

export const useSupplierEquipments = (
  supplierId?: string, 
  searchTerm?: string, 
  filters?: EquipmentFilters
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const supplierEquipmentsQuery = useQuery({
    queryKey: ['supplier-equipments', supplierId, searchTerm, filters],
    queryFn: async () => {
      console.log('useSupplierEquipments: Fetching equipment for supplier:', supplierId, 'search:', searchTerm, 'filters:', filters);
      
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
            ruc,
            tipo_proveedor
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

      // Apply filters
      if (filters) {
        if (filters.grupoGenerico) {
          query = query.eq('master_equipment.grupo_generico', filters.grupoGenerico);
        }

        if (filters.tipoProveedor) {
          query = query.eq('suppliers.tipo_proveedor', filters.tipoProveedor);
        }

        if (filters.moneda) {
          query = query.eq('moneda', filters.moneda);
        }
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

  // Get available groups for filtering
  const getAvailableGroups = () => {
    const groups = supplierEquipmentsQuery.data?.map(item => item.master_equipment?.grupo_generico).filter(Boolean) || [];
    return [...new Set(groups)];
  };

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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('supplier_equipments')
        .insert({
          ...equipmentData,
          usuario_ultima_modificacion: user?.id
        })
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
      precio_unitario,
      moneda,
      notas_cambio 
    }: { 
      id: string; 
      precio_unitario: number;
      moneda?: string;
      notas_cambio?: string;
    }) => {
      console.log('updatePriceMutation: Updating price for equipment:', id, {
        precio_unitario,
        moneda,
        notas_cambio
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // First get the current equipment data
      const { data: currentEquipment, error: fetchError } = await supabase
        .from('supplier_equipments')
        .select('precio_unitario, moneda')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching current equipment:', fetchError);
        throw fetchError;
      }

      const updateData: any = {
        precio_anterior: currentEquipment?.precio_unitario,
        precio_unitario,
        fecha_cambio_precio: new Date().toISOString().split('T')[0],
        fecha_ultima_actualizacion: new Date().toISOString().split('T')[0],
        usuario_ultima_modificacion: user?.id,
      };

      if (moneda) {
        updateData.moneda = moneda;
      }

      if (notas_cambio) {
        updateData.notas_cambio = notas_cambio;
      }

      console.log('updatePriceMutation: Executing update with data:', updateData);

      const { data, error } = await supabase
        .from('supplier_equipments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('updatePriceMutation: Database error:', error);
        throw error;
      }

      console.log('updatePriceMutation: Successfully updated equipment:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('updatePriceMutation: Success callback executed');
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      toast({
        title: "Precio actualizado",
        description: "El precio del equipo se actualizó correctamente",
      });
    },
    onError: (error) => {
      console.error('updatePriceMutation: Error callback executed:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el precio: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Record<string, any>;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('supplier_equipments')
        .update({
          ...updates,
          usuario_ultima_modificacion: user?.id,
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
        title: "Equipo actualizado",
        description: "El equipo se actualizó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el equipo",
        variant: "destructive",
      });
    },
  });

  return {
    equipments: supplierEquipmentsQuery.data || [],
    isLoading: supplierEquipmentsQuery.isLoading,
    error: supplierEquipmentsQuery.error,
    getAvailableGroups,
    createSupplierEquipment: createSupplierEquipmentMutation.mutate,
    updatePrice: updatePriceMutation.mutateAsync, // Using mutateAsync for better error handling
    updateEquipment: updateEquipmentMutation.mutate,
    isCreating: createSupplierEquipmentMutation.isPending,
    isUpdatingPrice: updatePriceMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending,
  };
};
