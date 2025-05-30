
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useQuotationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteQuotation = useMutation({
    mutationFn: async (quotationId: string) => {
      console.log('Deleting quotation:', quotationId);

      try {
        // First, check if this quotation is selected in any comparison
        const { data: comparison } = await supabase
          .from('quotation_comparisons')
          .select('id, item_id')
          .eq('cotizacion_seleccionada_id', quotationId)
          .single();

        // If this quotation is selected, remove the comparison
        if (comparison) {
          const { error: comparisonError } = await supabase
            .from('quotation_comparisons')
            .delete()
            .eq('id', comparison.id);

          if (comparisonError) {
            console.error('Error deleting quotation comparison:', comparisonError);
            throw new Error(`Error al eliminar la selección: ${comparisonError.message}`);
          }
          console.log('Removed quotation comparison for item:', comparison.item_id);
        }

        // Delete accessories associated with this quotation
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

        console.log('Quotation deleted successfully:', quotationId);
        return { quotationId, comparisonRemoved: !!comparison };

      } catch (error) {
        console.error('Error in deleteQuotation:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('Quotation deletion successful, invalidating queries');
      
      toast({
        title: "Cotización eliminada",
        description: result.comparisonRemoved 
          ? "La cotización y su selección se han eliminado correctamente"
          : "La cotización se ha eliminado correctamente",
      });
      
      // Invalidate all related queries to ensure data synchronization
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['items-with-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Force a fresh fetch of comparison data
      queryClient.refetchQueries({ queryKey: ['items-with-quotations'] });
      
      console.log('All queries invalidated after deletion');
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
