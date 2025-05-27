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
import { EquipmentModelSelector } from './EquipmentModelSelector';
import { SupplierSelector } from './SupplierSelector';
import { useQuotations } from '@/hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';

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
  preselectedProject?: any;
  preselectedItem?: any;
}

export const SimplifiedQuotationForm = ({ onBack, preselectedProject, preselectedItem }: SimplifiedQuotationFormProps) => {
  const [currentStep, setCurrentStep] = useState<'project' | 'model' | 'supplier' | 'quotation'>('project');
  const [selectedProject, setSelectedProject] = useState<any>(preselectedProject || null);
  const [selectedItem, setSelectedItem] = useState<any>(preselectedItem || null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [selectedModelo, setSelectedModelo] = useState<string>('');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { createQuotation, isCreating } = useQuotations();
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<QuotationFormData>({
    defaultValues: {
      tipo_cotizacion: 'nacional',
      moneda: 'USD',
      accessories: [],
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const { fields: accessories, append: addAccessory, remove: removeAccessory } = useFieldArray({
    control,
    name: 'accessories'
  });

  const watchedTipoCotizacion = watch('tipo_cotizacion');

  // Si hay datos preseleccionados, saltar al paso correspondiente
  useEffect(() => {
    if (preselectedProject && preselectedItem) {
      setCurrentStep('model');
      setValue('proyecto_id', preselectedProject.id);
      setValue('item_id', preselectedItem.id);
    }
  }, [preselectedProject, preselectedItem, setValue]);

  const handleProjectSelect = (project: any, item: any) => {
    console.log('Project selected:', project?.nombre, 'Item:', item?.numero_item);
    setSelectedProject(project);
    setSelectedItem(item);
    setValue('proyecto_id', project.id);
    setValue('item_id', item.id);
    setCurrentStep('model');
  };

  const handleModelSelect = (marca: string, modelo: string) => {
    console.log('Model selected:', marca, modelo);
    setSelectedMarca(marca);
    setSelectedModelo(modelo);
    setValue('marca', marca);
    setValue('modelo', modelo);
    setCurrentStep('supplier');
  };

  const handleNewModel = (marca: string, modelo: string) => {
    console.log('New model created:', marca, modelo);
    setSelectedMarca(marca);
    setSelectedModelo(modelo);
    setValue('marca', marca);
    setValue('modelo', modelo);
    setCurrentStep('supplier');
  };

  const handleSupplierSelect = (supplier: any) => {
    console.log('Supplier selected:', supplier?.razon_social);
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
      
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Preparar datos para el hook useQuotations
      const quotationData = {
        item_id: data.item_id,
        cotizador_id: user.id,
        tipo_cotizacion: data.tipo_cotizacion,
        marca: data.marca,
        modelo: data.modelo,
        procedencia: data.procedencia,
        precio_unitario: parseFloat(data.precio_unitario),
        moneda: data.moneda,
        tiempo_entrega: data.tiempo_entrega,
        condiciones: data.condiciones,
        incoterm: data.incoterm,
        observaciones: data.observaciones,
        fecha_vencimiento: data.fecha_vencimiento || undefined,
        
        // Supplier data
        proveedor_razon_social: selectedSupplier?.razon_social || '',
        proveedor_ruc: selectedSupplier?.ruc || '',
        proveedor_pais: selectedSupplier?.pais || '',
        proveedor_contacto: selectedSupplier?.nombre_contacto || '',
        proveedor_apellido: selectedSupplier?.apellido_contacto || '',
        proveedor_email: selectedSupplier?.email_contacto || '',
        proveedor_telefono: selectedSupplier?.telefono_contacto || '',
        
        // Accessories
        accessories: data.accessories.filter(acc => acc.nombre.trim()).map(acc => ({
          nombre: acc.nombre,
          cantidad: acc.cantidad,
          precio_unitario: parseFloat(acc.precio_unitario) || undefined,
          moneda: acc.moneda,
          incluido_en_proforma: acc.incluido_en_proforma,
        })),
      };

      console.log('Using createQuotation with data:', quotationData);
      createQuotation(quotationData);
      
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
      
      case 'model':
        return (
          <EquipmentModelSelector 
            project={selectedProject}
            item={selectedItem}
            onModelSelect={handleModelSelect}
            onNewModel={handleNewModel}
            onBack={() => preselectedProject ? onBack() : setCurrentStep('project')}
          />
        );
      
      case 'supplier':
        return (
          <SupplierSelector 
            equipmentId={selectedItem?.equipment_id}
            onSupplierSelect={handleSupplierSelect}
            onBack={() => setCurrentStep('model')}
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
                  <Badge variant="outline">{selectedMarca} {selectedModelo}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Equipment and Supplier Info Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Equipo</h4>
                    <p className="text-sm text-gray-600">{selectedItem?.master_equipment?.nombre_equipo}</p>
                    <p className="text-sm text-gray-500">{selectedMarca} - {selectedModelo}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Proveedor</h4>
                    <p className="text-sm text-gray-600">{selectedSupplier?.razon_social}</p>
                    {selectedSupplier?.ruc && <p className="text-sm text-gray-500">RUC: {selectedSupplier.ruc}</p>}
                  </div>
                </div>

                {/* Quotation Details */}
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
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              {...register(`accessories.${index}.cantidad`, { valueAsNumber: true })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Precio</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`accessories.${index}.precio_unitario`)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Moneda</Label>
                            <Select onValueChange={(value) => setValue(`accessories.${index}.moneda`, value)} defaultValue="USD">
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
                  <Button type="submit" disabled={isCreating}>
                    <Save className="w-4 h-4 mr-2" />
                    {isCreating ? 'Guardando...' : 'Guardar Cotización'}
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

  const getStepIndex = (step: string) => {
    const steps = ['project', 'model', 'supplier', 'quotation'];
    return steps.indexOf(step);
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
            <p className="text-gray-600">Sistema de cotización mejorado</p>
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center space-x-2">
          {['project', 'model', 'supplier', 'quotation'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : index < getStepIndex(currentStep)
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
