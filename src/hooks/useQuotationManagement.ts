
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useQuotationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteQuotationMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      console.log('useQuotationManagement: Deleting quotation:', quotationId);
      
      // First, check if this quotation is selected in any comparison
      const { data: comparison } = await supabase
        .from('quotation_comparisons')
        .select('id, item_id')
        .eq('cotizacion_seleccionada_id', quotationId)
        .maybeSingle();

      if (comparison) {
        console.log('Deleting comparison record for quotation:', quotationId);
        const { error: comparisonError } = await supabase
          .from('quotation_comparisons')
          .delete()
          .eq('id', comparison.id);

        if (comparisonError) {
          console.error('Error deleting comparison:', comparisonError);
          throw comparisonError;
        }
      }

      // Delete accessories first (foreign key constraint)
      const { error: accessoriesError } = await supabase
        .from('quotation_accessories')
        .delete()
        .eq('cotizacion_id', quotationId);

      if (accessoriesError) {
        console.error('Error deleting quotation accessories:', accessoriesError);
        throw accessoriesError;
      }

      // Then delete the quotation
      const { error: quotationError } = await supabase
        .from('quotations')
        .delete()
        .eq('id', quotationId);

      if (quotationError) {
        console.error('Error deleting quotation:', quotationError);
        throw quotationError;
      }

      console.log('Quotation deleted successfully:', quotationId);
      return { quotationId, comparisonDeleted: !!comparison };
    },
    onError: (error) => {
      console.error('Error deleting quotation:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la cotización. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log('Quotation deletion successful:', data);
      
      toast({
        title: "Cotización eliminada",
        description: `La cotización se ha eliminado correctamente${data.comparisonDeleted ? ' junto con su selección' : ''}`,
      });

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['items-with-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['project-detail'] });
    }
  });

  return {
    deleteQuotation: deleteQuotationMutation.mutate,
    isDeleting: deleteQuotationMutation.isPending,
  };
};
