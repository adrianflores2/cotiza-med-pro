
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuotationDetails = (quotationId: string) => {
  return useQuery({
    queryKey: ['quotation-details', quotationId],
    queryFn: async () => {
      console.log('Fetching quotation details for ID:', quotationId);
      
      const { data: quotation, error } = await supabase
        .from('quotations')
        .select(`
          *,
          suppliers (
            razon_social,
            ruc,
            pais,
            nombre_contacto,
            apellido_contacto,
            email_contacto,
            telefono_contacto
          ),
          quotation_accessories (
            *
          )
        `)
        .eq('id', quotationId)
        .single();

      if (error) {
        console.error('Error fetching quotation details:', error);
        throw error;
      }

      console.log('Fetched quotation details:', quotation);
      return quotation;
    },
    enabled: !!quotationId,
  });
};
