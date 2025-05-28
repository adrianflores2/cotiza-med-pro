
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
    descripcion?: string;
    obligatorio?: boolean;
  }>;
}

interface UpdateQuotationData extends Partial<QuotationData> {
  id: string;
}

// Helper function to determine correct quotation type
const determineQuotationType = (procedencia?: string, supplierCountry?: string, supplierType?: string): 'nacional' | 'importado' => {
  const procLower = procedencia?.toLowerCase();
  const countryLower = supplierCountry?.toLowerCase();
  
  // If from Peru or supplier is national (from Peru), it's national
  if (procLower === 'peru' || procLower === 'perú' || 
      countryLower === 'peru' || countryLower === 'perú' ||
      supplierType === 'nacional') {
    return 'nacional';
  }
  
  // If from another country or supplier is international, it's imported
  if (procLower && procLower !== 'peru' && procLower !== 'perú') {
    return 'importado';
  }
  
  if (supplierType === 'internacional') {
    return 'importado';
  }
  
  // Default to national if unclear
  return 'nacional';
};

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

      // Get supplier info to determine correct quotation type
      const { data: supplierInfo } = await supabase
        .from('suppliers')
        .select('pais, tipo_proveedor')
        .eq('id', supplierId)
        .single();

      // Determine correct quotation type
      const correctType = determineQuotationType(
        quotationData.procedencia,
        supplierInfo?.pais,
        supplierInfo?.tipo_proveedor
      );

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

      // Create the quotation with the correct type
      const quotationInsert = {
        item_id: quotationData.item_id,
        cotizador_id: quotationData.cotizador_id,
        proveedor_id: supplierId,
        supplier_equipment_id: supplierEquipmentId,
        tipo_cotizacion: correctType, // Use the determined correct type
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

      // Process accessories if any
      if (quotationData.accessories && quotationData.accessories.length > 0) {
        console.log('Processing accessories:', quotationData.accessories.length);
        
        // Process each accessory: first standardize, then create quotation accessory
        for (const acc of quotationData.accessories) {
          try {
            // First, create or get standardized accessory
            const { data: existingAccessory, error: checkAccessoryError } = await supabase
              .from('equipment_accessories')
              .select('id')
              .eq('equipment_id', itemData.equipment_id)
              .eq('nombre', acc.nombre)
              .maybeSingle();

            if (checkAccessoryError) {
              console.error('Error checking existing accessory:', checkAccessoryError);
              // Continue with other accessories even if one fails
              continue;
            }

            if (!existingAccessory) {
              // Create new standardized accessory
              const { data: newAccessory, error: createAccessoryError } = await supabase
                .from('equipment_accessories')
                .insert({
                  equipment_id: itemData.equipment_id,
                  nombre: acc.nombre,
                  descripcion: acc.descripcion,
                  precio_referencial: acc.precio_unitario,
                  moneda: acc.moneda || 'USD',
                  obligatorio: acc.obligatorio || false,
                  activo: true,
                })
                .select()
                .single();

              if (createAccessoryError) {
                console.error('Error creating standardized accessory:', createAccessoryError);
                // Continue with other accessories even if one fails
              } else {
                console.log('Created new standardized accessory:', newAccessory);
              }
            } else {
              console.log('Using existing standardized accessory:', existingAccessory);
            }

            // Create quotation accessory regardless of standardization result
            const { error: quotationAccessoryError } = await supabase
              .from('quotation_accessories')
              .insert({
                cotizacion_id: quotation.id,
                nombre: acc.nombre,
                cantidad: acc.cantidad,
                precio_unitario: acc.precio_unitario,
                moneda: acc.moneda,
                incluido_en_proforma: acc.incluido_en_proforma,
                observaciones: acc.descripcion,
              });

            if (quotationAccessoryError) {
              console.error('Error creating quotation accessory:', quotationAccessoryError);
              // Continue with other accessories even if one fails
            } else {
              console.log('Created quotation accessory for:', acc.nombre);
            }

          } catch (error) {
            console.error('Error processing accessory:', acc.nombre, error);
            // Continue with other accessories even if one fails
          }
        }
      }

      return quotation;
    },
    onSuccess: () => {
      toast({
        title: "¡Cotización creada!",
        description: "La cotización se ha guardado correctamente y los accesorios se agregaron al catálogo.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-accessories'] });
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

  const updateQuotation = useMutation({
    mutationFn: async (updateData: UpdateQuotationData) => {
      console.log('Updating quotation with data:', updateData);
      
      const quotationId = updateData.id;
      const { id, accessories, ...quotationFields } = updateData;

      // Get current quotation and supplier info to determine correct type
      const { data: currentQuotation, error: fetchError } = await supabase
        .from('quotations')
        .select(`
          *,
          suppliers (pais, tipo_proveedor)
        `)
        .eq('id', quotationId)
        .single();

      if (fetchError) {
        console.error('Error fetching current quotation:', fetchError);
        throw new Error(`Error al obtener cotización actual: ${fetchError.message}`);
      }

      // Determine correct quotation type based on updated data
      const correctType = determineQuotationType(
        quotationFields.procedencia || currentQuotation.procedencia,
        currentQuotation.suppliers?.pais,
        currentQuotation.suppliers?.tipo_proveedor
      );

      // Update quotation fields with correct type
      const finalQuotationFields = {
        ...quotationFields,
        tipo_cotizacion: correctType
      };

      // Update the quotation
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .update(finalQuotationFields)
        .eq('id', quotationId)
        .select()
        .single();

      if (quotationError) {
        console.error('Error updating quotation:', quotationError);
        throw new Error(`Error al actualizar cotización: ${quotationError.message}`);
      }

      // If accessories are provided, update them
      if (accessories && accessories.length >= 0) {
        // First, delete existing accessories for this quotation
        const { error: deleteAccessoriesError } = await supabase
          .from('quotation_accessories')
          .delete()
          .eq('cotizacion_id', quotationId);

        if (deleteAccessoriesError) {
          console.error('Error deleting existing accessories:', deleteAccessoriesError);
          throw new Error(`Error al eliminar accesorios existentes: ${deleteAccessoriesError.message}`);
        }

        // Then create new accessories
        for (const acc of accessories) {
          const { error: accessoryError } = await supabase
            .from('quotation_accessories')
            .insert({
              cotizacion_id: quotationId,
              nombre: acc.nombre,
              cantidad: acc.cantidad,
              precio_unitario: acc.precio_unitario,
              moneda: acc.moneda,
              incluido_en_proforma: acc.incluido_en_proforma,
              observaciones: acc.descripcion,
            });

          if (accessoryError) {
            console.error('Error creating quotation accessory:', accessoryError);
            // Continue with other accessories even if one fails
          }
        }
      }

      console.log('Quotation updated successfully:', quotation);
      return quotation;
    },
    onSuccess: () => {
      toast({
        title: "¡Cotización actualizada!",
        description: "La cotización se ha actualizado correctamente con el tipo corregido.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['item-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation-details'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-accessories'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      console.error('Quotation update error:', error);
      toast({
        title: "Error al actualizar cotización",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createQuotation: createQuotation.mutate,
    updateQuotation: updateQuotation.mutate,
    isCreating: createQuotation.isPending,
    isUpdating: updateQuotation.isPending,
  };
};
