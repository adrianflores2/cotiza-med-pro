
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSuppliers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('useSuppliers: Fetching suppliers...');
      
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('razon_social');

        if (error) {
          console.error('useSuppliers: Error fetching suppliers:', error);
          throw error;
        }

        console.log('useSuppliers: Fetched suppliers:', data?.length || 0);
        return data || [];
        
      } catch (error) {
        console.error('useSuppliers: Unexpected error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (supplierData: {
      razon_social: string;
      ruc: string;
      pais?: string;
      nombre_contacto?: string;
      apellido_contacto?: string;
      email_contacto?: string;
      telefono_contacto?: string;
    }) => {
      console.log('Creating supplier with data:', supplierData);
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Proveedor creado",
        description: "El proveedor se creó correctamente",
      });
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el proveedor",
        variant: "destructive",
      });
    },
  });

  return {
    suppliers: suppliersQuery.data || [],
    isLoading: suppliersQuery.isLoading,
    error: suppliersQuery.error,
    createSupplier: createSupplierMutation.mutate,
    isCreating: createSupplierMutation.isPending,
  };
};
