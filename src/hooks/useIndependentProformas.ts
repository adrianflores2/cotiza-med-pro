
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIndependentProformas = (supplierEquipmentId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const independentProformasQuery = useQuery({
    queryKey: ['independent-proformas', supplierEquipmentId],
    queryFn: async () => {
      console.log('useIndependentProformas: Fetching proformas for equipment:', supplierEquipmentId);
      
      let query = supabase
        .from('independent_proformas')
        .select(`
          *,
          supplier_equipments (
            marca,
            modelo,
            master_equipment (
              codigo,
              nombre_equipo,
              grupo_generico
            ),
            suppliers (
              razon_social,
              ruc
            )
          )
        `)
        .eq('vigente', true)
        .order('fecha_proforma', { ascending: false });

      if (supplierEquipmentId) {
        query = query.eq('supplier_equipment_id', supplierEquipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useIndependentProformas: Error fetching proformas:', error);
        throw error;
      }

      console.log('useIndependentProformas: Fetched proformas:', data?.length || 0);
      return data || [];
    },
    enabled: !!supplierEquipmentId,
  });

  const createProformaMutation = useMutation({
    mutationFn: async (proformaData: {
      supplier_equipment_id: string;
      archivo_url?: string;
      fecha_proforma?: string;
      precio_unitario?: number;
      moneda?: string;
      tiempo_entrega?: string;
      condiciones?: string;
      observaciones?: string;
    }) => {
      console.log('Creating independent proforma:', proformaData);
      
      const { data, error } = await supabase
        .from('independent_proformas')
        .insert(proformaData)
        .select()
        .single();

      if (error) {
        console.error('Error creating proforma:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['independent-proformas'] });
      toast({
        title: "Proforma creada",
        description: "La proforma se creó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error creating proforma:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la proforma",
        variant: "destructive",
      });
    },
  });

  return {
    proformas: independentProformasQuery.data || [],
    isLoading: independentProformasQuery.isLoading,
    error: independentProformasQuery.error,
    createProforma: createProformaMutation.mutate,
    isCreating: createProformaMutation.isPending,
  };
};
