
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { useSupplierEquipments } from '@/hooks/useSupplierEquipments';
import { useEquipmentChangeLogs } from '@/hooks/useEquipmentChangeLogs';

interface PriceUpdateData {
  precio_unitario: number;
  moneda: string;
  notas_cambio?: string;
}

interface PriceUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    precio_unitario?: number;
    moneda?: string;
    master_equipment?: {
      nombre_equipo: string;
    };
    marca: string;
    modelo: string;
  };
}

export const PriceUpdateDialog = ({ isOpen, onClose, equipment }: PriceUpdateDialogProps) => {
  const { updatePrice, isUpdatingPrice } = useSupplierEquipments();
  const { createChangeLog } = useEquipmentChangeLogs();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PriceUpdateData>({
    defaultValues: {
      precio_unitario: equipment.precio_unitario || 0,
      moneda: equipment.moneda || 'USD',
      notas_cambio: ''
    }
  });

  const moneda = watch('moneda');

  const onSubmit = async (data: PriceUpdateData) => {
    console.log('PriceUpdateDialog: Submitting price update', { equipmentId: equipment.id, data });
    
    try {
      // Store the previous price for comparison
      const previousPrice = equipment.precio_unitario;
      
      // Update the price first
      await updatePrice({
        id: equipment.id,
        precio_unitario: data.precio_unitario,
        moneda: data.moneda,
        notas_cambio: data.notas_cambio,
      });

      // Create a change log entry if the price actually changed
      if (previousPrice !== data.precio_unitario) {
        console.log('PriceUpdateDialog: Creating change log for price update');
        
        try {
          await createChangeLog({
            equipment_id: equipment.id,
            tipo_cambio: 'precio_actualizado',
            valor_anterior: previousPrice ? previousPrice.toString() : 'null',
            valor_nuevo: data.precio_unitario.toString(),
            observaciones: data.notas_cambio || 'Precio actualizado desde el diálogo de actualización'
          });
          console.log('PriceUpdateDialog: Change log created successfully');
        } catch (logError) {
          console.error('PriceUpdateDialog: Error creating change log (non-critical):', logError);
          // Don't fail the whole operation if logging fails
        }
      }
      
      reset();
      onClose();
    } catch (error) {
      console.error('PriceUpdateDialog: Error updating price:', error);
    }
  };

  const formatCurrentPrice = () => {
    if (!equipment.precio_unitario) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: equipment.moneda || 'USD',
    }).format(equipment.precio_unitario);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Precio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información del Equipo</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Equipo:</strong> {equipment.master_equipment?.nombre_equipo}</p>
              <p><strong>Marca/Modelo:</strong> {equipment.marca} - {equipment.modelo}</p>
              <p><strong>Precio Actual:</strong> {formatCurrentPrice()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_unitario">Nuevo Precio *</Label>
                <Input
                  id="precio_unitario"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('precio_unitario', { 
                    required: 'Este campo es requerido',
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                  })}
                  placeholder="0.00"
                />
                {errors.precio_unitario && (
                  <p className="text-sm text-destructive">{errors.precio_unitario.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <Select
                  value={moneda}
                  onValueChange={(value) => setValue('moneda', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - Dólar</SelectItem>
                    <SelectItem value="PEN">PEN - Sol</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas_cambio">Notas del Cambio</Label>
              <Textarea
                id="notas_cambio"
                {...register('notas_cambio')}
                placeholder="Motivo del cambio de precio, fuente de información, etc."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isUpdatingPrice}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdatingPrice}
              >
                {isUpdatingPrice ? 'Actualizando...' : 'Actualizar Precio'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
