
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { useSupplierEquipments } from '@/hooks/useSupplierEquipments';

interface EquipmentFormData {
  equipment_id: string;
  marca: string;
  modelo: string;
  precio_unitario?: number;
  moneda?: string;
  procedencia?: string;
  catalogo_url?: string;
  ficha_tecnica_url?: string;
  manual_url?: string;
}

interface EquipmentFormProps {
  supplierId: string;
  masterEquipment: any[];
}

export const EquipmentForm = ({ supplierId, masterEquipment }: EquipmentFormProps) => {
  const { createSupplierEquipment, isCreating } = useSupplierEquipments();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<EquipmentFormData>();

  const onSubmit = async (data: EquipmentFormData) => {
    createSupplierEquipment({
      ...data,
      proveedor_id: supplierId,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="equipment_id">Equipo *</Label>
        <Controller
          name="equipment_id"
          control={control}
          rules={{ required: 'Debe seleccionar un equipo' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {masterEquipment.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.codigo} - {equipment.nombre_equipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.equipment_id && (
          <p className="text-sm text-destructive">{errors.equipment_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input
            id="marca"
            {...register('marca', { required: 'Este campo es requerido' })}
            placeholder="Siemens"
          />
          {errors.marca && (
            <p className="text-sm text-destructive">{errors.marca.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            {...register('modelo', { required: 'Este campo es requerido' })}
            placeholder="S7-1200"
          />
          {errors.modelo && (
            <p className="text-sm text-destructive">{errors.modelo.message}</p>
          )}
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

        <div className="space-y-2 col-span-2">
          <Label htmlFor="procedencia">Procedencia</Label>
          <Input
            id="procedencia"
            {...register('procedencia')}
            placeholder="Alemania"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catalogo_url">URL de Catálogo</Label>
          <Input
            id="catalogo_url"
            type="url"
            {...register('catalogo_url')}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ficha_tecnica_url">URL de Ficha Técnica</Label>
          <Input
            id="ficha_tecnica_url"
            type="url"
            {...register('ficha_tecnica_url')}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="manual_url">URL de Manual</Label>
          <Input
            id="manual_url"
            type="url"
            {...register('manual_url')}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={isCreating}
        >
          {isCreating ? 'Agregando...' : 'Agregar Equipo'}
        </Button>
      </div>
    </form>
  );
};
