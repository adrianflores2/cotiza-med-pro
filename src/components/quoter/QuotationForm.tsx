
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Save, 
  Send, 
  Upload,
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Building,
  Package,
  Zap,
  Settings,
  UserPlus,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuotations } from "@/hooks/useQuotations";
import { useAuth } from "@/hooks/useAuth";
import { useQuotationForm } from "@/hooks/useQuotationForm";
import { SmartSupplierSuggestions } from "./SmartSupplierSuggestions";

interface QuotationFormProps {
  assignment: any;
  onBack: () => void;
}

export const QuotationForm = ({ assignment, onBack }: QuotationFormProps) => {
  const { toast } = useToast();
  const { createQuotation, isCreating } = useQuotations();
  const { user } = useAuth();

  const item = assignment.project_items;
  const equipment = item?.master_equipment;
  const project = item?.projects;

  const {
    formData,
    setFormData,
    accessories,
    selectedSupplierId,
    setSelectedSupplierId,
    isManualMode,
    useSmartSuggestions,
    setUseSmartSuggestions,
    suggestions,
    uniqueSuppliers,
    availableBrands,
    getModelsForBrand,
    handleAddAccessory,
    handleRemoveAccessory,
    handleAccessoryChange,
    applySupplierSuggestion,
    switchToManualMode,
    validateForm,
    hasHistoricalData,
  } = useQuotationForm(equipment?.id);

  const [showAdvancedMode, setShowAdvancedMode] = useState(false);

  const handleSubmit = (asDraft = true) => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      toast({
        title: "Error de validación",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    // Preparar datos para envío
    const quotationData = {
      item_id: assignment.project_items.id,
      cotizador_id: user?.id || '',
      tipo_cotizacion: formData.tipo_cotizacion as 'nacional' | 'importado',
      marca: formData.marca,
      modelo: formData.modelo,
      procedencia: formData.procedencia,
      precio_unitario: parseFloat(formData.precio_unitario),
      moneda: formData.moneda,
      tiempo_entrega: formData.tiempo_entrega,
      condiciones: formData.condiciones,
      incoterm: formData.incoterm,
      observaciones: formData.observaciones,
      fecha_vencimiento: formData.fecha_vencimiento,
      
      // Supplier data
      proveedor_razon_social: formData.proveedor_razon_social,
      proveedor_ruc: formData.proveedor_ruc,
      proveedor_pais: formData.proveedor_pais,
      proveedor_contacto: formData.proveedor_contacto,
      proveedor_apellido: formData.proveedor_apellido,
      proveedor_email: formData.proveedor_email,
      proveedor_telefono: formData.proveedor_telefono,
      
      accessories: accessories.map(acc => ({
        nombre: acc.nombre,
        cantidad: acc.cantidad,
        precio_unitario: acc.precio_unitario ? parseFloat(acc.precio_unitario) : undefined,
        moneda: acc.moneda,
        incluido_en_proforma: acc.incluido_en_proforma,
      })).filter(acc => acc.nombre.trim() !== ''),
    };

    console.log('Submitting quotation data:', quotationData);
    
    createQuotation(quotationData);
    
    if (!asDraft) {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la bandeja
        </Button>
        <div className="flex space-x-2">
          <Badge variant="outline">
            Ítem #{item?.numero_item}
          </Badge>
          <Badge variant="secondary">
            {project?.nombre}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Cotización - {equipment?.nombre_equipo}</span>
          </CardTitle>
          <div className="text-sm text-gray-600">
            <p>Código: {equipment?.codigo}</p>
            <p>Cantidad: {item?.cantidad} unidades</p>
            {item?.observaciones && (
              <p>Observaciones: {item.observaciones}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <Card className={hasHistoricalData ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center space-x-2 ${hasHistoricalData ? 'text-blue-800' : 'text-orange-800'}`}>
                  {hasHistoricalData ? <Database className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  <span>{hasHistoricalData ? 'Modo Inteligente Disponible' : 'Modo Manual'}</span>
                  {hasHistoricalData && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {suggestions.length} proveedor{suggestions.length !== 1 ? 'es' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-4">
                  {hasHistoricalData && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="smart-mode">Modo Inteligente</Label>
                      <Switch
                        id="smart-mode"
                        checked={useSmartSuggestions}
                        onCheckedChange={setUseSmartSuggestions}
                      />
                    </div>
                  )}
                  {hasHistoricalData && useSmartSuggestions && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="advanced-mode">Análisis Avanzado</Label>
                      <Switch
                        id="advanced-mode"
                        checked={showAdvancedMode}
                        onCheckedChange={setShowAdvancedMode}
                      />
                    </div>
                  )}
                  {hasHistoricalData && useSmartSuggestions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={switchToManualMode}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Nuevo Proveedor
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Smart Suggestions */}
          {useSmartSuggestions && hasHistoricalData && (
            <SmartSupplierSuggestions
              equipmentId={equipment?.id}
              onSelectSuggestion={applySupplierSuggestion}
              showAdvancedMode={showAdvancedMode}
            />
          )}

          {/* Manual Mode Controls */}
          {(!useSmartSuggestions || !hasHistoricalData || isManualMode) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Entrada Manual de Datos</span>
                  </CardTitle>
                  {uniqueSuppliers.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {uniqueSuppliers.length} proveedor{uniqueSuppliers.length !== 1 ? 'es' : ''} registrado{uniqueSuppliers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {uniqueSuppliers.length > 0 && (
                  <div className="mb-4">
                    <Label htmlFor="existing-supplier">Seleccionar Proveedor Existente (Opcional)</Label>
                    <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor o ingresa uno nuevo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueSuppliers.map((supplier) => (
                          <SelectItem key={supplier.suppliers.id} value={supplier.suppliers.id}>
                            {supplier.suppliers.razon_social} ({supplier.suppliers.pais || 'Sin país'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tipo de Cotización */}
          <div>
            <Label className="text-base font-medium">Tipo de Cotización *</Label>
            <RadioGroup 
              value={formData.tipo_cotizacion} 
              onValueChange={(value) => setFormData({ ...formData, tipo_cotizacion: value as 'nacional' | 'importado' })}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nacional" id="nacional" />
                <Label htmlFor="nacional">Compra Nacional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="importado" id="importado" />
                <Label htmlFor="importado">Importado</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Información del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Building className="w-5 h-5" />
                <span>Información del Proveedor</span>
                {useSmartSuggestions && hasHistoricalData && !isManualMode && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Auto-completado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proveedor_razon_social">Razón Social *</Label>
                  <Input
                    id="proveedor_razon_social"
                    value={formData.proveedor_razon_social}
                    onChange={(e) => setFormData({ ...formData, proveedor_razon_social: e.target.value })}
                    placeholder="Nombre de la empresa"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="proveedor_pais">País *</Label>
                  <Input
                    id="proveedor_pais"
                    value={formData.proveedor_pais}
                    onChange={(e) => setFormData({ ...formData, proveedor_pais: e.target.value })}
                    placeholder="Ej: Perú"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                  />
                </div>

                <div>
                  <Label htmlFor="proveedor_ruc">
                    RUC {formData.proveedor_pais?.toLowerCase().includes('per') && '*'}
                  </Label>
                  <Input
                    id="proveedor_ruc"
                    value={formData.proveedor_ruc}
                    onChange={(e) => setFormData({ ...formData, proveedor_ruc: e.target.value })}
                    placeholder="20123456789"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                    required={formData.proveedor_pais?.toLowerCase().includes('per')}
                  />
                </div>
                <div>
                  <Label htmlFor="proveedor_contacto">Nombre Contacto</Label>
                  <Input
                    id="proveedor_contacto"
                    value={formData.proveedor_contacto}
                    onChange={(e) => setFormData({ ...formData, proveedor_contacto: e.target.value })}
                    placeholder="Nombre del contacto"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                  />
                </div>
                <div>
                  <Label htmlFor="proveedor_apellido">Apellido Contacto</Label>
                  <Input
                    id="proveedor_apellido"
                    value={formData.proveedor_apellido}
                    onChange={(e) => setFormData({ ...formData, proveedor_apellido: e.target.value })}
                    placeholder="Apellido del contacto"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                  />
                </div>
                <div>
                  <Label htmlFor="proveedor_email">Email</Label>
                  <Input
                    id="proveedor_email"
                    type="email"
                    value={formData.proveedor_email}
                    onChange={(e) => setFormData({ ...formData, proveedor_email: e.target.value })}
                    placeholder="contacto@empresa.com"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                  />
                </div>
                <div>
                  <Label htmlFor="proveedor_telefono">Teléfono</Label>
                  <Input
                    id="proveedor_telefono"
                    value={formData.proveedor_telefono}
                    onChange={(e) => setFormData({ ...formData, proveedor_telefono: e.target.value })}
                    placeholder="+51 999 999 999"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Equipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="w-5 h-5" />
                <span>Información del Equipo</span>
                {useSmartSuggestions && hasHistoricalData && !isManualMode && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Auto-completado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  {(isManualMode || !useSmartSuggestions || !hasHistoricalData) && availableBrands.length > 0 ? (
                    <Select 
                      value={formData.marca} 
                      onValueChange={(value) => setFormData({ ...formData, marca: value, modelo: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBrands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Ej: Philips"
                      disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                      required
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo *</Label>
                  {(isManualMode || !useSmartSuggestions || !hasHistoricalData) && formData.marca && getModelsForBrand(formData.marca).length > 0 ? (
                    <Select 
                      value={formData.modelo} 
                      onValueChange={(value) => setFormData({ ...formData, modelo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {getModelsForBrand(formData.marca).map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ej: MX450"
                      disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                      required
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="procedencia">Procedencia (País de Origen)</Label>
                  <Input
                    id="procedencia"
                    value={formData.procedencia}
                    onChange={(e) => setFormData({ ...formData, procedencia: e.target.value })}
                    placeholder="Ej: Alemania"
                    disabled={useSmartSuggestions && hasHistoricalData && !isManualMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Comercial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio">Precio Unitario *</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                    placeholder="0.00"
                    className={useSmartSuggestions && hasHistoricalData && !isManualMode ? 'bg-green-50' : ''}
                    required
                  />
                </div>
                <Select 
                  value={formData.moneda} 
                  onValueChange={(value) => setFormData({ ...formData, moneda: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="PEN">PEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
              <Input
                id="tiempo_entrega"
                value={formData.tiempo_entrega}
                onChange={(e) => setFormData({ ...formData, tiempo_entrega: e.target.value })}
                placeholder="Ej: 30 días calendario"
              />
            </div>

            <div>
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              />
            </div>

            {formData.tipo_cotizacion === "importado" && (
              <div>
                <Label htmlFor="incoterm">Incoterm *</Label>
                <Select 
                  value={formData.incoterm} 
                  onValueChange={(value) => setFormData({ ...formData, incoterm: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                    <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                    <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                    <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="condiciones">Condiciones de Pago</Label>
            <Textarea
              id="condiciones"
              value={formData.condiciones}
              onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
              placeholder="Ej: 50% adelanto, 50% contra entrega"
              rows={2}
            />
          </div>

          {/* Accesorios */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Accesorios</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddAccessory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Accesorio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {accessories.length > 0 ? (
                <div className="space-y-4">
                  {accessories.map((accessory) => (
                    <div key={accessory.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Nombre del Accesorio</Label>
                        <Input
                          value={accessory.nombre}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'nombre', e.target.value)}
                          placeholder="Nombre del accesorio"
                        />
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={accessory.cantidad}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'cantidad', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Precio Unitario</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={accessory.precio_unitario}
                          onChange={(e) => handleAccessoryChange(accessory.id, 'precio_unitario', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Moneda</Label>
                        <Select 
                          value={accessory.moneda}
                          onValueChange={(value) => handleAccessoryChange(accessory.id, 'moneda', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="PEN">PEN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>¿Incluir en proforma?</Label>
                        <Select 
                          value={accessory.incluido_en_proforma ? "si" : "no"}
                          onValueChange={(value) => handleAccessoryChange(accessory.id, 'incluido_en_proforma', value === "si")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="si">Sí</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveAccessory(accessory.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay accesorios agregados. Haz clic en "Agregar Accesorio" para añadir uno.
                </p>
              )}
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones adicionales sobre la cotización"
              rows={3}
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Subir proforma (PDF, máximo 10MB)
            </p>
            <Button variant="outline" size="sm">
              Seleccionar archivo
            </Button>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
              disabled={isCreating}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar borrador
            </Button>
            <Button 
              onClick={() => handleSubmit(false)}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isCreating ? 'Enviando...' : 'Enviar cotización'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
