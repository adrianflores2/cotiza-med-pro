
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
  const { equipments, isLoading: loadingEquipments } = useSupplierEquipments();
  const { createProforma, isCreating } = useIndependentProformas();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProformaFormData>();

  console.log('ProformaForm: equipments received:', equipments);

  // Much more robust filtering to prevent empty or invalid values
  const validEquipments = React.useMemo(() => {
    if (!Array.isArray(equipments)) {
      console.log('ProformaForm: equipments is not an array:', equipments);
      return [];
    }

    const filtered = equipments.filter(equipment => {
      const isValid = equipment && 
        typeof equipment === 'object' &&
        equipment.id &&
        typeof equipment.id === 'string' && 
        equipment.id.trim() !== '' &&
        equipment.master_equipment &&
        typeof equipment.master_equipment === 'object' &&
        equipment.master_equipment.nombre_equipo &&
        equipment.suppliers &&
        typeof equipment.suppliers === 'object' &&
        equipment.suppliers.razon_social;
      
      if (!isValid) {
        console.log('ProformaForm: Filtering out invalid equipment:', equipment);
      }
      
      return isValid;
    });

    console.log('ProformaForm: Valid equipment filtered:', filtered.length, 'out of', equipments.length);
    return filtered;
  }, [equipments]);

  const onSubmit = async (data: ProformaFormData) => {
    console.log('ProformaForm: Submitting data:', data);
    createProforma(data);
    reset();
  };

  if (loadingEquipments) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Cargando equipos...</p>
      </div>
    );
  }

  if (validEquipments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay equipos disponibles para crear proformas</p>
        <p className="text-sm text-gray-400 mt-2">
          {equipments.length === 0 ? 'No se encontraron equipos de proveedores' : 'No hay equipos válidos disponibles'}
        </p>
      </div>
    );
  }

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
                {validEquipments.map((equipment) => {
                  console.log('ProformaForm: Rendering SelectItem for equipment:', equipment.id);
                  // Double check the value before rendering
                  if (!equipment.id || typeof equipment.id !== 'string' || equipment.id.trim() === '') {
                    console.warn('ProformaForm: Skipping invalid equipment in render:', equipment);
                    return null;
                  }
                  return (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.suppliers?.razon_social} - {equipment.master_equipment?.nombre_equipo} ({equipment.marca} {equipment.modelo})
                    </SelectItem>
                  );
                })}
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
          <Label htmlFor="archivo_url">URL del Archivo</Label>
          <Input
            id="archivo_url"
            type="url"
            {...register('archivo_url')}
            placeholder="https://..."
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
            placeholder="15 días"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="condiciones">Condiciones</Label>
          <Input
            id="condiciones"
            {...register('condiciones')}
            placeholder="50% anticipo, 50% contra entrega"
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
