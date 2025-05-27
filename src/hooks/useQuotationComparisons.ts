
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuotationComparison {
  id: string;
  item_id: string;
  cotizacion_seleccionada_id: string;
  comercial_id: string;
  margen_utilidad?: number;
  precio_venta?: number;
  justificacion?: string;
  observaciones?: string;
  fecha_seleccion: string;
  created_at: string;
}

export interface ItemWithQuotations {
  id: string;
  numero_item: number;
  cantidad: number;
  observaciones?: string;
  project: {
    id: string;
    nombre: string;
  };
  equipment: {
    codigo: string;
    nombre_equipo: string;
  };
  quotations: Array<{
    id: string;
    marca: string;
    modelo: string;
    precio_unitario: number;
    moneda: string;
    tiempo_entrega?: string;
    condiciones?: string;
    fecha_cotizacion: string;
    estado: string;
    supplier: {
      razon_social: string;
      pais?: string;
    };
    cotizador?: {
      nombre: string;
      email: string;
    };
    procedencia?: string;
    selected?: boolean;
  }>;
  comparison?: QuotationComparison;
}

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
            suppliers!inner (
              razon_social,
              pais
            ),
            users!quotations_cotizador_id_fkey (
              nombre,
              email
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

      // Transform data to add selected flag
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
          selected: item.quotation_comparisons?.[0]?.cotizacion_seleccionada_id === quotation.id
        })),
        comparison: item.quotation_comparisons?.[0] || undefined
      }));

      console.log('Fetched items with quotations:', transformedData.length);
      return transformedData;
    },
    enabled: true,
  });

  const selectQuotationMutation = useMutation({
    mutationFn: async ({
      itemId,
      quotationId,
      comercialId,
      margenUtilidad,
      precioVenta,
      justificacion
    }: {
      itemId: string;
      quotationId: string;
      comercialId: string;
      margenUtilidad?: number;
      precioVenta?: number;
      justificacion?: string;
    }) => {
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
    onSuccess: () => {
      toast({
        title: "Cotización seleccionada",
        description: "La cotización se ha seleccionado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['items-with-quotations'] });
    },
    onError: (error) => {
      console.error('Error selecting quotation:', error);
      toast({
        title: "Error",
        description: "No se pudo seleccionar la cotización",
        variant: "destructive",
      });
    },
  });

  return {
    itemsWithQuotations: itemsWithQuotationsQuery.data || [],
    isLoading: itemsWithQuotationsQuery.isLoading,
    error: itemsWithQuotationsQuery.error,
    selectQuotation: selectQuotationMutation.mutate,
    isSelecting: selectQuotationMutation.isPending,
    refetch: itemsWithQuotationsQuery.refetch,
  };
};
