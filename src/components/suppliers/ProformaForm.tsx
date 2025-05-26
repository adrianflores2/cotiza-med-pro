
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { useSupplierEquipments } from '@/hooks/useSupplierEquipments';
import { useIndependentProformas } from '@/hooks/useIndependentProformas';

interface ProformaFormData {
  supplier_equipment_id: string;
  archivo_url?: string;
  fecha_proforma?: string;
  precio_unitario?: number;
  moneda?: string;
  tiempo_entrega?: string;
  condiciones?: string;
  observaciones?: string;
}

export const ProformaForm = () => {
  const { equipments } = useSupplierEquipments();
  const { createProforma, isCreating } = useIndependentProformas();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProformaFormData>();

  const onSubmit = async (data: ProformaFormData) => {
    createProforma(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supplier_equipment_id">Equipo del Proveedor *</Label>
        <Controller
          name="supplier_equipment_id"
          control={control}
          rules={{ required: 'Debe seleccionar un equipo' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {equipments.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.suppliers?.razon_social} - {equipment.master_equipment?.codigo} - {equipment.marca} {equipment.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.supplier_equipment_id && (
          <p className="text-sm text-destructive">{errors.supplier_equipment_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_proforma">Fecha de Proforma</Label>
          <Input
            id="fecha_proforma"
            type="date"
            {...register('fecha_proforma')}
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="precio_unitario">Precio Unitario</Label>
          <Input
            id="precio_unitario"
            type="number"
            step="0.01"
            {...register('precio_unitario', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="moneda">Moneda</Label>
          <Controller
            name="moneda"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} defaultValue="USD">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="PEN">PEN - Sol Peruano</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
          <Input
            id="tiempo_entrega"
            {...register('tiempo_entrega')}
            placeholder="30 días"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="archivo_url">URL de Archivo</Label>
          <Input
            id="archivo_url"
            type="url"
            {...register('archivo_url')}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="condiciones">Condiciones</Label>
          <Textarea
            id="condiciones"
            {...register('condiciones')}
            placeholder="Condiciones comerciales..."
            rows={3}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            {...register('observaciones')}
            placeholder="Observaciones adicionales..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={isCreating}
        >
          {isCreating ? 'Creando...' : 'Crear Proforma'}
        </Button>
      </div>
    </form>
  );
};
