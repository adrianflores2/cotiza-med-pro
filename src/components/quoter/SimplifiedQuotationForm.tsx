
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { ProjectSelector } from './ProjectSelector';
import { EquipmentDisplay } from './EquipmentDisplay';
import { SupplierSelector } from './SupplierSelector';

interface AccessoryInput {
  nombre: string;
  cantidad: number;
  precio_unitario: string;
  moneda: string;
  incluido_en_proforma: boolean;
}

interface QuotationFormData {
  proyecto_id: string;
  item_id: string;
  proveedor_id: string;
  tipo_cotizacion: 'nacional' | 'importado';
  marca: string;
  modelo: string;
  precio_unitario: string;
  moneda: string;
  tiempo_entrega: string;
  condiciones: string;
  incoterm: string;
  observaciones: string;
  fecha_vencimiento: string;
  procedencia: string;
  accessories: AccessoryInput[];
}

interface SimplifiedQuotationFormProps {
  onBack: () => void;
}

export const SimplifiedQuotationForm = ({ onBack }: SimplifiedQuotationFormProps) => {
  const [currentStep, setCurrentStep] = useState<'project' | 'equipment' | 'supplier' | 'quotation'>('project');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const { toast } = useToast();
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<QuotationFormData>({
    defaultValues: {
      tipo_cotizacion: 'nacional',
      moneda: 'USD',
      accessories: [],
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    }
  });

  const { fields: accessories, append: addAccessory, remove: removeAccessory } = useFieldArray({
    control,
    name: 'accessories'
  });

  const watchedTipoCotizacion = watch('tipo_cotizacion');

  const handleProjectSelect = (project: any, item: any) => {
    setSelectedProject(project);
    setSelectedItem(item);
    setValue('proyecto_id', project.id);
    setValue('item_id', item.id);
    setCurrentStep('equipment');
  };

  const handleEquipmentContinue = () => {
    setCurrentStep('supplier');
  };

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier);
    setValue('proveedor_id', supplier.id);
    setCurrentStep('quotation');
  };

  const handleAddAccessory = () => {
    addAccessory({
      nombre: '',
      cantidad: 1,
      precio_unitario: '',
      moneda: 'USD',
      incluido_en_proforma: true
    });
  };

  const onSubmit = async (data: QuotationFormData) => {
    try {
      console.log('Submitting quotation:', data);
      
      // Here you would implement the actual submission logic
      // For now, we'll just show a success message
      
      toast({
        title: "Cotización creada",
        description: "La cotización se ha guardado exitosamente",
      });
      
      onBack();
    } catch (error) {
      console.error('Error submitting quotation:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la cotización",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'project':
        return (
          <ProjectSelector 
            onProjectSelect={handleProjectSelect}
          />
        );
      
      case 'equipment':
        return (
          <EquipmentDisplay 
            project={selectedProject}
            item={selectedItem}
            onContinue={handleEquipmentContinue}
            onBack={() => setCurrentStep('project')}
          />
        );
      
      case 'supplier':
        return (
          <SupplierSelector 
            equipmentId={selectedItem?.equipment_id}
            onSupplierSelect={handleSupplierSelect}
            onBack={() => setCurrentStep('equipment')}
          />
        );
      
      case 'quotation':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información de Cotización</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{selectedProject?.nombre}</Badge>
                  <Badge variant="secondary">Ítem #{selectedItem?.numero_item}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Supplier Info Display */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Proveedor Seleccionado</h4>
                  <p className="text-sm text-gray-600">{selectedSupplier?.razon_social}</p>
                  {selectedSupplier?.ruc && <p className="text-sm text-gray-500">RUC: {selectedSupplier.ruc}</p>}
                </div>

                {/* Equipment and Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_cotizacion">Tipo de Cotización *</Label>
                    <Select onValueChange={(value) => setValue('tipo_cotizacion', value as 'nacional' | 'importado')} defaultValue="nacional">
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
                    <Label htmlFor="moneda">Moneda *</Label>
                    <Select onValueChange={(value) => setValue('moneda', value)} defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="PEN">PEN - Sol Peruano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      {...register('marca', { required: 'La marca es requerida' })}
                      placeholder="Ingrese la marca"
                    />
                    {errors.marca && <p className="text-sm text-red-600 mt-1">{errors.marca.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      {...register('modelo', { required: 'El modelo es requerido' })}
                      placeholder="Ingrese el modelo"
                    />
                    {errors.modelo && <p className="text-sm text-red-600 mt-1">{errors.modelo.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="precio_unitario">Precio Unitario *</Label>
                    <Input
                      id="precio_unitario"
                      type="number"
                      step="0.01"
                      {...register('precio_unitario', { required: 'El precio es requerido' })}
                      placeholder="0.00"
                    />
                    {errors.precio_unitario && <p className="text-sm text-red-600 mt-1">{errors.precio_unitario.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="procedencia">Procedencia</Label>
                    <Input
                      id="procedencia"
                      {...register('procedencia')}
                      placeholder="País de origen"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
                    <Input
                      id="tiempo_entrega"
                      {...register('tiempo_entrega')}
                      placeholder="15 días"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                    <Input
                      id="fecha_vencimiento"
                      type="date"
                      {...register('fecha_vencimiento')}
                    />
                  </div>
                </div>

                {/* Incoterm for imported quotations */}
                {watchedTipoCotizacion === 'importado' && (
                  <div>
                    <Label htmlFor="incoterm">Incoterm *</Label>
                    <Select onValueChange={(value) => setValue('incoterm', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar incoterm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                        <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                        <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                        <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="condiciones">Condiciones de Pago</Label>
                  <Textarea
                    id="condiciones"
                    {...register('condiciones')}
                    placeholder="50% anticipo, 50% contra entrega"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    {...register('observaciones')}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Accessories Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Accesorios</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAccessory}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Accesorio
                    </Button>
                  </div>

                  {accessories.length > 0 && (
                    <div className="space-y-3">
                      {accessories.map((accessory, index) => (
                        <div key={accessory.id} className="grid grid-cols-6 gap-2 items-end p-3 border rounded-lg">
                          <div>
                            <Label className="text-xs">Nombre</Label>
                            <Input
                              {...register(`accessories.${index}.nombre`)}
                              placeholder="Nombre del accesorio"
                              size="sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              {...register(`accessories.${index}.cantidad`, { valueAsNumber: true })}
                              size="sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Precio</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`accessories.${index}.precio_unitario`)}
                              placeholder="0.00"
                              size="sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Moneda</Label>
                            <Select onValueChange={(value) => setValue(`accessories.${index}.moneda`, value)} defaultValue="USD">
                              <SelectTrigger size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="PEN">PEN</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              {...register(`accessories.${index}.incluido_en_proforma`)}
                              className="mr-2"
                            />
                            <Label className="text-xs">En proforma</Label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAccessory(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('supplier')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cotización
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Bandeja
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Cotización</h2>
            <p className="text-gray-600">Sistema simplificado de cotización</p>
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center space-x-2">
          {['project', 'equipment', 'supplier', 'quotation'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : index < ['project', 'equipment', 'supplier', 'quotation'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {renderStepContent()}
    </div>
  );
};
