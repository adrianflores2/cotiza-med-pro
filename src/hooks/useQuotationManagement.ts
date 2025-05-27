
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useQuotationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteQuotation = useMutation({
    mutationFn: async (quotationId: string) => {
      console.log('Deleting quotation:', quotationId);

      // First, remove any quotation comparisons that reference this quotation
      const { error: comparisonError } = await supabase
        .from('quotation_comparisons')
        .delete()
        .eq('cotizacion_seleccionada_id', quotationId);

      if (comparisonError) {
        console.error('Error deleting quotation comparisons:', comparisonError);
        // Don't throw here as this might not exist
      }

      // Then delete accessories associated with this quotation
      const { error: accessoriesError } = await supabase
        .from('quotation_accessories')
        .delete()
        .eq('cotizacion_id', quotationId);

      if (accessoriesError) {
        console.error('Error deleting quotation accessories:', accessoriesError);
        throw new Error(`Error al eliminar accesorios: ${accessoriesError.message}`);
      }

      // Finally delete the quotation itself
      const { error: quotationError } = await supabase
        .from('quotations')
        .delete()
        .eq('id', quotationId);

      if (quotationError) {
        console.error('Error deleting quotation:', quotationError);
        throw new Error(`Error al eliminar cotización: ${quotationError.message}`);
      }

      return quotationId;
    },
    onSuccess: () => {
      toast({
        title: "Cotización eliminada",
        description: "La cotización se ha eliminado correctamente",
      });
      
      // Invalidate all related queries to ensure data synchronization
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['items-with-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      console.error('Quotation deletion error:', error);
      toast({
        title: "Error al eliminar cotización",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deleteQuotation: deleteQuotation.mutate,
    isDeleting: deleteQuotation.isPending,
  };
};
