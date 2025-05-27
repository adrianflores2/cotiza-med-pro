
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuotationData {
  item_id: string;
  cotizador_id: string;
  tipo_cotizacion: 'nacional' | 'importado';
  marca: string;
  modelo: string;
  procedencia?: string;
  precio_unitario: number;
  moneda: string;
  tiempo_entrega?: string;
  condiciones?: string;
  incoterm?: string;
  observaciones?: string;
  fecha_vencimiento?: string;
  
  // Supplier data
  proveedor_razon_social: string;
  proveedor_ruc?: string;
  proveedor_pais?: string;
  proveedor_contacto?: string;
  proveedor_apellido?: string;
  proveedor_email?: string;
  proveedor_telefono?: string;
  
  // Accessories
  accessories: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario?: number;
    moneda: string;
    incluido_en_proforma: boolean;
  }>;
}

export const useQuotations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createQuotation = useMutation({
    mutationFn: async (quotationData: QuotationData) => {
      console.log('Creating quotation with data:', quotationData);
      
      // First, create or get the supplier using the database function
      const { data: supplierId, error: supplierError } = await supabase
        .rpc('create_or_get_supplier', {
          _razon_social: quotationData.proveedor_razon_social,
          _ruc: quotationData.proveedor_ruc || '',
          _pais: quotationData.proveedor_pais,
          _nombre_contacto: quotationData.proveedor_contacto,
          _apellido_contacto: quotationData.proveedor_apellido,
          _email_contacto: quotationData.proveedor_email,
          _telefono_contacto: quotationData.proveedor_telefono,
        });

      if (supplierError) {
        console.error('Error creating/getting supplier:', supplierError);
        throw new Error(`Error al crear/obtener proveedor: ${supplierError.message}`);
      }

      console.log('Supplier ID:', supplierId);

      // Create the quotation
      const quotationInsert = {
        item_id: quotationData.item_id,
        cotizador_id: quotationData.cotizador_id,
        proveedor_id: supplierId,
        tipo_cotizacion: quotationData.tipo_cotizacion,
        marca: quotationData.marca,
        modelo: quotationData.modelo,
        procedencia: quotationData.procedencia,
        precio_unitario: quotationData.precio_unitario,
        moneda: quotationData.moneda,
        tiempo_entrega: quotationData.tiempo_entrega,
        condiciones: quotationData.condiciones,
        incoterm: quotationData.incoterm,
        observaciones: quotationData.observaciones,
        fecha_vencimiento: quotationData.fecha_vencimiento,
        estado: 'vigente' as const,
      };

      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert(quotationInsert)
        .select()
        .single();

      if (quotationError) {
        console.error('Error creating quotation:', quotationError);
        throw new Error(`Error al crear cotización: ${quotationError.message}`);
      }

      console.log('Quotation created:', quotation);

      // Create accessories if any
      if (quotationData.accessories && quotationData.accessories.length > 0) {
        const accessoriesData = quotationData.accessories.map(acc => ({
          cotizacion_id: quotation.id,
          nombre: acc.nombre,
          cantidad: acc.cantidad,
          precio_unitario: acc.precio_unitario,
          moneda: acc.moneda,
          incluido_en_proforma: acc.incluido_en_proforma,
        }));

        const { error: accessoriesError } = await supabase
          .from('quotation_accessories')
          .insert(accessoriesData);

        if (accessoriesError) {
          console.error('Error creating accessories:', accessoriesError);
          // Don't throw here, just log the error as the main quotation was created
        }
      }

      return quotation;
    },
    onSuccess: () => {
      toast({
        title: "¡Cotización creada!",
        description: "La cotización se ha guardado correctamente y está disponible para revisión.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error: Error) => {
      console.error('Quotation creation error:', error);
      toast({
        title: "Error al crear cotización",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createQuotation: createQuotation.mutate,
    isCreating: createQuotation.isPending,
  };
};
