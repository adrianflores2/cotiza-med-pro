
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useQuotations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createQuotationMutation = useMutation({
    mutationFn: async (quotationData: {
      item_id: string;
      cotizador_id: string;
      proveedor_id: string;
      tipo_cotizacion: 'nacional' | 'importado';
      marca?: string;
      modelo?: string;
      procedencia?: string;
      precio_unitario: number;
      moneda: string;
      tiempo_entrega?: string;
      condiciones?: string;
      incoterm?: string;
      observaciones?: string;
      fecha_vencimiento?: string;
      estado?: 'vigente' | 'vencida' | 'seleccionada' | 'descartada';
      accessories?: Array<{
        nombre: string;
        cantidad: number;
        precio_unitario?: number;
        incluido_en_proforma: boolean;
      }>;
    }) => {
      console.log('Creating quotation with data:', quotationData);
      
      const { accessories, ...quotationMainData } = quotationData;
      
      // Crear la cotización principal
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          ...quotationMainData,
          estado: quotationMainData.estado || 'vigente',
        })
        .select()
        .single();

      if (quotationError) {
        console.error('Error creating quotation:', quotationError);
        throw quotationError;
      }

      // Crear los accesorios si existen
      if (accessories && accessories.length > 0) {
        const accessoriesData = accessories.map(acc => ({
          ...acc,
          cotizacion_id: quotation.id,
        }));

        const { error: accessoriesError } = await supabase
          .from('quotation_accessories')
          .insert(accessoriesData);

        if (accessoriesError) {
          console.error('Error creating accessories:', accessoriesError);
          throw accessoriesError;
        }
      }

      return quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      toast({
        title: "Cotización guardada",
        description: "La cotización se guardó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la cotización",
        variant: "destructive",
      });
    },
  });

  return {
    createQuotation: createQuotationMutation.mutate,
    isCreating: createQuotationMutation.isPending,
  };
};
