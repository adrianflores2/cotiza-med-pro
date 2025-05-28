
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
            tipo_proveedor,
            nombre_contacto,
            apellido_contacto,
            email_contacto,
            telefono_contacto
          ),
          quotation_accessories (
            *
          ),
          users!quotations_cotizador_id_fkey (
            nombre,
            email
          )
        `)
        .eq('id', quotationId)
        .single();

      if (error) {
        console.error('Error fetching quotation details:', error);
        throw error;
      }

      console.log('Fetched quotation details:', quotation);
      
      // Transform the data to match expected structure
      const transformedQuotation = {
        ...quotation,
        supplier: quotation.suppliers,
        cotizador: quotation.users,
        accessories: quotation.quotation_accessories
      };

      return transformedQuotation;
    },
    enabled: !!quotationId,
  });
};
