
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

      // Get equipment_id from the item
      const { data: itemData, error: itemError } = await supabase
        .from('project_items')
        .select('equipment_id')
        .eq('id', quotationData.item_id)
        .single();

      if (itemError) {
        console.error('Error getting item equipment_id:', itemError);
        throw new Error(`Error al obtener información del ítem: ${itemError.message}`);
      }

      // Check if supplier_equipment already exists
      const { data: existingSupplierEquipment, error: checkError } = await supabase
        .from('supplier_equipments')
        .select('id')
        .eq('equipment_id', itemData.equipment_id)
        .eq('proveedor_id', supplierId)
        .eq('marca', quotationData.marca)
        .eq('modelo', quotationData.modelo)
        .eq('activo', true)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing supplier equipment:', checkError);
        throw new Error(`Error al verificar equipo del proveedor: ${checkError.message}`);
      }

      let supplierEquipmentId = existingSupplierEquipment?.id;

      // If supplier_equipment doesn't exist, create it
      if (!supplierEquipmentId) {
        console.log('Creating new supplier equipment entry');
        const { data: newSupplierEquipment, error: supplierEquipmentError } = await supabase
          .from('supplier_equipments')
          .insert({
            equipment_id: itemData.equipment_id,
            proveedor_id: supplierId,
            marca: quotationData.marca,
            modelo: quotationData.modelo,
            precio_unitario: quotationData.precio_unitario,
            moneda: quotationData.moneda,
            procedencia: quotationData.procedencia,
            usuario_ultima_modificacion: quotationData.cotizador_id,
            activo: true,
          })
          .select('id')
          .single();

        if (supplierEquipmentError) {
          console.error('Error creating supplier equipment:', supplierEquipmentError);
          throw new Error(`Error al crear equipo del proveedor: ${supplierEquipmentError.message}`);
        }

        supplierEquipmentId = newSupplierEquipment.id;
        console.log('New supplier equipment created with ID:', supplierEquipmentId);
      } else {
        console.log('Using existing supplier equipment ID:', supplierEquipmentId);
        
        // Update the existing supplier equipment with the latest price
        const { error: updateError } = await supabase
          .from('supplier_equipments')
          .update({
            precio_anterior: quotationData.precio_unitario,
            precio_unitario: quotationData.precio_unitario,
            moneda: quotationData.moneda,
            procedencia: quotationData.procedencia,
            fecha_ultima_actualizacion: new Date().toISOString().split('T')[0],
            usuario_ultima_modificacion: quotationData.cotizador_id,
          })
          .eq('id', supplierEquipmentId);

        if (updateError) {
          console.error('Error updating supplier equipment:', updateError);
          // Don't throw here, just log the error
        }
      }

      // Create the quotation
      const quotationInsert = {
        item_id: quotationData.item_id,
        cotizador_id: quotationData.cotizador_id,
        proveedor_id: supplierId,
        supplier_equipment_id: supplierEquipmentId,
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
        description: "La cotización se ha guardado correctamente y el equipo se agregó al catálogo del proveedor.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
