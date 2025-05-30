
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  QuotationComparison, 
  ItemWithQuotations, 
  SelectQuotationParams 
} from '@/types/quotationComparison';

export const useQuotationComparisons = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const itemsWithQuotationsQuery = useQuery({
    queryKey: ['items-with-quotations', projectId],
    queryFn: async () => {
      console.log('Fetching items with quotations for project:', projectId);
      
      let query = supabase
        .from('project_items')
        .select(`
          id,
          numero_item,
          cantidad,
          observaciones,
          projects!inner (
            id,
            nombre
          ),
          master_equipment!inner (
            codigo,
            nombre_equipo
          ),
          quotations (
            id,
            marca,
            modelo,
            precio_unitario,
            moneda,
            tiempo_entrega,
            condiciones,
            fecha_cotizacion,
            estado,
            procedencia,
            tipo_cotizacion,
            suppliers!inner (
              razon_social,
              pais
            ),
            users!quotations_cotizador_id_fkey (
              nombre,
              email
            ),
            quotation_accessories (
              id,
              nombre,
              cantidad,
              precio_unitario,
              moneda,
              incluido_en_proforma,
              observaciones
            )
          ),
          quotation_comparisons (
            id,
            cotizacion_seleccionada_id,
            comercial_id,
            margen_utilidad,
            precio_venta,
            justificacion,
            observaciones,
            fecha_seleccion,
            created_at
          )
        `)
        .eq('quotations.estado', 'vigente');

      if (projectId) {
        query = query.eq('proyecto_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching items with quotations:', error);
        throw error;
      }

      // Transform data to add selected flag and accessories
      const transformedData: ItemWithQuotations[] = (data || []).map(item => ({
        id: item.id,
        numero_item: item.numero_item,
        cantidad: item.cantidad,
        observaciones: item.observaciones,
        project: item.projects,
        equipment: item.master_equipment,
        quotations: (item.quotations || []).map(quotation => ({
          ...quotation,
          supplier: quotation.suppliers,
          cotizador: quotation.users,
          selected: item.quotation_comparisons?.[0]?.cotizacion_seleccionada_id === quotation.id,
          accessories: quotation.quotation_accessories,
          quotation_accessories: quotation.quotation_accessories
        })),
        comparison: item.quotation_comparisons?.[0] || undefined
      }));

      console.log('Fetched items with quotations:', transformedData.length);
      return transformedData;
    },
    enabled: true,
    staleTime: 300000, // 5 minutes - much longer to prevent data loss when switching tabs
    gcTime: 600000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false
  });

  const selectQuotationMutation = useMutation({
    mutationFn: async ({
      itemId,
      quotationId,
      comercialId,
      margenUtilidad,
      precioVenta,
      justificacion
    }: SelectQuotationParams) => {
      console.log('Selecting quotation:', { itemId, quotationId });
      
      // Check if comparison already exists
      const { data: existing } = await supabase
        .from('quotation_comparisons')
        .select('id')
        .eq('item_id', itemId)
        .single();

      if (existing) {
        // Update existing comparison
        const { data, error } = await supabase
          .from('quotation_comparisons')
          .update({
            cotizacion_seleccionada_id: quotationId,
            comercial_id: comercialId,
            margen_utilidad: margenUtilidad,
            precio_venta: precioVenta,
            justificacion,
            fecha_seleccion: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new comparison
        const { data, error } = await supabase
          .from('quotation_comparisons')
          .insert({
            item_id: itemId,
            cotizacion_seleccionada_id: quotationId,
            comercial_id: comercialId,
            margen_utilidad: margenUtilidad,
            precio_venta: precioVenta,
            justificacion
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onMutate: async ({ itemId, quotationId, margenUtilidad, precioVenta, justificacion }) => {
      console.log('Optimistic update: selecting quotation', { itemId, quotationId });
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['items-with-quotations'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['items-with-quotations', projectId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['items-with-quotations', projectId], (old: ItemWithQuotations[] | undefined) => {
        if (!old) return old;
        
        return old.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              quotations: item.quotations.map(q => ({
                ...q,
                selected: q.id === quotationId
              })),
              comparison: {
                id: item.comparison?.id || 'temp-id',
                item_id: itemId,
                cotizacion_seleccionada_id: quotationId,
                comercial_id: item.comparison?.comercial_id || '',
                margen_utilidad: margenUtilidad || item.comparison?.margen_utilidad,
                precio_venta: precioVenta || item.comparison?.precio_venta,
                justificacion: justificacion || item.comparison?.justificacion,
                observaciones: item.comparison?.observaciones,
                fecha_seleccion: new Date().toISOString(),
                created_at: item.comparison?.created_at || new Date().toISOString()
              }
            };
          }
          return item;
        });
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error('Error selecting quotation:', error);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['items-with-quotations', projectId], context.previousData);
      }
      
      toast({
        title: "Error",
        description: "No se pudo seleccionar la cotización",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      console.log('Quotation selection successful:', data);
      
      // Only show toast for actual quotation selections, not margin/justification updates
      if (!variables.margenUtilidad && !variables.justificacion) {
        toast({
          title: "Cotización seleccionada",
          description: "La cotización se ha seleccionado correctamente",
        });
      }
      
      // Update the specific item's data with real server data
      queryClient.setQueryData(['items-with-quotations', projectId], (old: ItemWithQuotations[] | undefined) => {
        if (!old) return old;
        
        return old.map(item => {
          if (item.id === variables.itemId) {
            return {
              ...item,
              quotations: item.quotations.map(q => ({
                ...q,
                selected: q.id === variables.quotationId
              })),
              comparison: data
            };
          }
          return item;
        });
      });
    }
  });

  // Separate mutation for margin and justification updates to avoid re-selection
  const updateComparisonMutation = useMutation({
    mutationFn: async ({
      itemId,
      margenUtilidad,
      precioVenta,
      justificacion
    }: {
      itemId: string;
      margenUtilidad?: number;
      precioVenta?: number;
      justificacion?: string;
    }) => {
      console.log('Updating comparison details:', { itemId, margenUtilidad, precioVenta, justificacion });
      
      // Get existing comparison
      const { data: existing } = await supabase
        .from('quotation_comparisons')
        .select('*')
        .eq('item_id', itemId)
        .single();

      if (!existing) {
        throw new Error('No hay cotización seleccionada para actualizar');
      }

      // Update only the changed fields
      const updateData: any = {};
      if (margenUtilidad !== undefined) updateData.margen_utilidad = margenUtilidad;
      if (precioVenta !== undefined) updateData.precio_venta = precioVenta;
      if (justificacion !== undefined) updateData.justificacion = justificacion;

      const { data, error } = await supabase
        .from('quotation_comparisons')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ itemId, margenUtilidad, precioVenta, justificacion }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['items-with-quotations'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['items-with-quotations', projectId]);

      // Optimistically update only the comparison data
      queryClient.setQueryData(['items-with-quotations', projectId], (old: ItemWithQuotations[] | undefined) => {
        if (!old) return old;
        
        return old.map(item => {
          if (item.id === itemId && item.comparison) {
            return {
              ...item,
              comparison: {
                ...item.comparison,
                margen_utilidad: margenUtilidad !== undefined ? margenUtilidad : item.comparison.margen_utilidad,
                precio_venta: precioVenta !== undefined ? precioVenta : item.comparison.precio_venta,
                justificacion: justificacion !== undefined ? justificacion : item.comparison.justificacion
              }
            };
          }
          return item;
        });
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error('Error updating comparison:', error);
      
      if (context?.previousData) {
        queryClient.setQueryData(['items-with-quotations', projectId], context.previousData);
      }
      
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      console.log('Comparison update successful:', data);
      
      // Update with real server data
      queryClient.setQueryData(['items-with-quotations', projectId], (old: ItemWithQuotations[] | undefined) => {
        if (!old) return old;
        
        return old.map(item => {
          if (item.id === variables.itemId) {
            return {
              ...item,
              comparison: data
            };
          }
          return item;
        });
      });
    }
  });

  return {
    itemsWithQuotations: itemsWithQuotationsQuery.data || [],
    isLoading: itemsWithQuotationsQuery.isLoading,
    error: itemsWithQuotationsQuery.error,
    selectQuotation: selectQuotationMutation.mutate,
    updateComparison: updateComparisonMutation.mutate,
    isSelecting: selectQuotationMutation.isPending,
    isUpdating: updateComparisonMutation.isPending,
    refetch: itemsWithQuotationsQuery.refetch,
  };
};
