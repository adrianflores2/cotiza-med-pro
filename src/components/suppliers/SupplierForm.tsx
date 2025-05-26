
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useSuppliers } from '@/hooks/useSuppliers';

interface SupplierFormData {
  razon_social: string;
  ruc: string;
  pais?: string;
  nombre_contacto?: string;
  apellido_contacto?: string;
  email_contacto?: string;
  telefono_contacto?: string;
}

export const SupplierForm = () => {
  const { createSupplier, isCreating } = useSuppliers();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>();

  const onSubmit = async (data: SupplierFormData) => {
    createSupplier(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="razon_social">Razón Social *</Label>
          <Input
            id="razon_social"
            {...register('razon_social', { required: 'Este campo es requerido' })}
            placeholder="Nombre de la empresa"
          />
          {errors.razon_social && (
            <p className="text-sm text-destructive">{errors.razon_social.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruc">RUC *</Label>
          <Input
            id="ruc"
            {...register('ruc', { required: 'Este campo es requerido' })}
            placeholder="12345678901"
          />
          {errors.ruc && (
            <p className="text-sm text-destructive">{errors.ruc.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pais">País</Label>
          <Input
            id="pais"
            {...register('pais')}
            placeholder="Perú"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre_contacto">Nombre de Contacto</Label>
          <Input
            id="nombre_contacto"
            {...register('nombre_contacto')}
            placeholder="Juan"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellido_contacto">Apellido de Contacto</Label>
          <Input
            id="apellido_contacto"
            {...register('apellido_contacto')}
            placeholder="Pérez"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_contacto">Email de Contacto</Label>
          <Input
            id="email_contacto"
            type="email"
            {...register('email_contacto')}
            placeholder="contacto@empresa.com"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="telefono_contacto">Teléfono de Contacto</Label>
          <Input
            id="telefono_contacto"
            {...register('telefono_contacto')}
            placeholder="+51 999 999 999"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={isCreating}
        >
          {isCreating ? 'Creando...' : 'Crear Proveedor'}
        </Button>
      </div>
    </form>
  );
};
