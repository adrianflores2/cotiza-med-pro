
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useQuotations } from '@/hooks/useQuotations';
import { useToast } from '@/hooks/use-toast';

interface QuotationEditInlineFormProps {
  quotation: any;
  onCancel: () => void;
  onSave: () => void;
}

interface Accessory {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: string;
  moneda: string;
  incluido_en_proforma: boolean;
  observaciones?: string;
}

export const QuotationEditInlineForm = ({ quotation, onCancel, onSave }: QuotationEditInlineFormProps) => {
  const { updateQuotation, isUpdating } = useQuotations();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tipo_cotizacion: quotation.tipo_cotizacion || 'nacional',
    marca: quotation.marca || '',
    modelo: quotation.modelo || '',
    procedencia: quotation.procedencia || '',
    precio_unitario: quotation.precio_unitario?.toString() || '',
    moneda: quotation.moneda || 'USD',
    tiempo_entrega: quotation.tiempo_entrega || '',
    condiciones: quotation.condiciones || '',
    incoterm: quotation.incoterm || '',
    observaciones: quotation.observaciones || '',
    fecha_vencimiento: quotation.fecha_vencimiento || '',
  });

  const [accessories, setAccessories] = useState<Accessory[]>(
    (quotation.accessories || quotation.quotation_accessories || []).map((acc: any) => ({
      id: acc.id || Date.now().toString() + Math.random(),
      nombre: acc.nombre || '',
      cantidad: acc.cantidad || 1,
      precio_unitario: acc.precio_unitario?.toString() || '',
      moneda: acc.moneda || quotation.moneda || 'USD',
      incluido_en_proforma: acc.incluido_en_proforma ?? true,
      observaciones: acc.observaciones || '',
    }))
  );

  const handleAddAccessory = () => {
    const newAccessory: Accessory = {
      id: Date.now().toString() + Math.random(),
      nombre: '',
      cantidad: 1,
      precio_unitario: '',
      moneda: formData.moneda,
      incluido_en_proforma: true,
      observaciones: '',
    };
    setAccessories([...accessories, newAccessory]);
  };

  const handleRemoveAccessory = (id: string) => {
    setAccessories(accessories.filter(acc => acc.id !== id));
  };

  const handleAccessoryChange = (id: string, field: keyof Accessory, value: any) => {
    setAccessories(accessories.map(acc => 
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        id: quotation.id,
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario),
        accessories: accessories.map(acc => ({
          nombre: acc.nombre,
          cantidad: acc.cantidad,
          precio_unitario: acc.precio_unitario ? parseFloat(acc.precio_unitario) : undefined,
          moneda: acc.moneda,
          incluido_en_proforma: acc.incluido_en_proforma,
          descripcion: acc.observaciones,
        })),
      };

      updateQuotation(updateData);
      onSave();
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cotización",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Información del Producto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_cotizacion">Tipo de Cotización</Label>
              <Select 
                value={formData.tipo_cotizacion} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_cotizacion: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="importado">Importado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="procedencia">Procedencia</Label>
              <Input
                id="procedencia"
                value={formData.procedencia}
                onChange={(e) => setFormData(prev => ({ ...prev, procedencia: e.target.value }))}
                placeholder="País de origen"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Comercial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Comercial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="precio_unitario">Precio Unitario *</Label>
              <Input
                id="precio_unitario"
                type="number"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Select 
                value={formData.moneda} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, moneda: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="PEN">PEN</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
              <Input
                id="tiempo_entrega"
                value={formData.tiempo_entrega}
                onChange={(e) => setFormData(prev => ({ ...prev, tiempo_entrega: e.target.value }))}
                placeholder="ej: 15 días"
              />
            </div>
          </div>

          {formData.tipo_cotizacion === 'importado' && (
            <div>
              <Label htmlFor="incoterm">Incoterm</Label>
              <Input
                id="incoterm"
                value={formData.incoterm}
                onChange={(e) => setFormData(prev => ({ ...prev, incoterm: e.target.value }))}
                placeholder="ej: FOB, CIF, EXW"
              />
            </div>
          )}

          <div>
            <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
            <Input
              id="fecha_vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="condiciones">Condiciones</Label>
            <Textarea
              id="condiciones"
              value={formData.condiciones}
              onChange={(e) => setFormData(prev => ({ ...prev, condiciones: e.target.value }))}
              placeholder="Condiciones comerciales"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accesorios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Accesorios</CardTitle>
            <Button type="button" variant="outline" onClick={handleAddAccessory}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Accesorio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accessories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay accesorios. Haz clic en "Agregar Accesorio" para añadir uno.
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-20">Cant.</TableHead>
                    <TableHead className="w-32">Precio</TableHead>
                    <TableHead className="w-24">Moneda</TableHead>
                    <TableHead className="w-24">Incluido</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessories.map((accessory) => (
                    <TableRow key={accessory.id}>
                      <TableCell>
                        <Input
                          value={accessory.nombre}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'nombre', e.target.value)}
                          placeholder="Nombre del accesorio"
                          className="min-w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={accessory.cantidad}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'cantidad', parseInt(e.target.value) || 1)}
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={accessory.precio_unitario}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'precio_unitario', e.target.value)}
                          placeholder="0.00"
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={accessory.moneda} 
                          onValueChange={(value) => handleAccessoryChange(accessory.id, 'moneda', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="PEN">PEN</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={accessory.incluido_en_proforma}
                          onCheckedChange={(checked) => 
                            handleAccessoryChange(accessory.id, 'incluido_en_proforma', !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={accessory.observaciones || ''}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'observaciones', e.target.value)}
                          placeholder="Observaciones"
                          className="min-w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAccessory(accessory.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isUpdating}>
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};
