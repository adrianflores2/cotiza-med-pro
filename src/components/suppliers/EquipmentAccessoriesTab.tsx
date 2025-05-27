
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEquipmentAccessories } from '@/hooks/useEquipmentAccessories';

interface AccessoryFormData {
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  moneda?: string;
  obligatorio: boolean;
}

interface EquipmentAccessoriesTabProps {
  equipmentId: string;
  equipmentName: string;
}

export const EquipmentAccessoriesTab = ({ equipmentId, equipmentName }: EquipmentAccessoriesTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { accessories, isLoading, createAccessory, isCreating } = useEquipmentAccessories(equipmentId);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AccessoryFormData>({
    defaultValues: {
      obligatorio: false,
      moneda: 'USD'
    }
  });

  const moneda = watch('moneda');

  const onSubmit = async (data: AccessoryFormData) => {
    createAccessory({
      equipment_id: equipmentId,
      ...data,
      precio_referencial: data.precio_referencial || undefined,
    });
    reset();
    setIsDialogOpen(false);
  };

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Accesorios para {equipmentName}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Accesorio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Accesorio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Accesorio *</Label>
                  <Input
                    id="nombre"
                    {...register('nombre', { required: 'Este campo es requerido' })}
                    placeholder="Ej: Cable de conexión, Manual de usuario"
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    {...register('descripcion')}
                    placeholder="Descripción detallada del accesorio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio_referencial">Precio Referencial</Label>
                    <Input
                      id="precio_referencial"
                      type="number"
                      step="0.01"
                      {...register('precio_referencial', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'El precio debe ser mayor a 0' }
                      })}
                      placeholder="0.00"
                    />
                    {errors.precio_referencial && (
                      <p className="text-sm text-destructive">{errors.precio_referencial.message}</p>
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="obligatorio"
                    {...register('obligatorio')}
                    onCheckedChange={(checked) => setValue('obligatorio', checked)}
                  />
                  <Label htmlFor="obligatorio">Accesorio obligatorio</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creando...' : 'Crear Accesorio'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando accesorios...</p>
          </div>
        ) : accessories.length === 0 ? (
          <div className="text-center py-8">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay accesorios registrados</p>
            <p className="text-sm text-gray-400 mt-2">Crea el primer accesorio usando el botón de arriba</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio Referencial</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessories.map((accessory) => (
                  <TableRow key={accessory.id}>
                    <TableCell className="font-medium">{accessory.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {accessory.descripcion || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                      {accessory.precio_referencial ? (
                        <Badge variant="outline">
                          {formatPrice(accessory.precio_referencial, accessory.moneda)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No definido</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={accessory.obligatorio ? "default" : "secondary"}>
                        {accessory.obligatorio ? 'Obligatorio' : 'Opcional'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={accessory.activo ? "default" : "secondary"}>
                        {accessory.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
