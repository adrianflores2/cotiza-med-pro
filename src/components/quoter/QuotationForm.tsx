
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuotations } from "@/hooks/useQuotations";
import { useAuth } from "@/hooks/useAuth";
import { useQuotationForm } from "@/hooks/useQuotationForm";
import { SmartSupplierSuggestions } from "./SmartSupplierSuggestions";
import { QuotationModeSelector } from "./form/QuotationModeSelector";
import { QuotationTypeSelector } from "./form/QuotationTypeSelector";
import { SupplierInformationForm } from "./form/SupplierInformationForm";
import { EquipmentInformationForm } from "./form/EquipmentInformationForm";
import { CommercialInformationForm } from "./form/CommercialInformationForm";
import { AccessoriesSection } from "./form/accessories/AccessoriesSection";
import { QuotationFormActions } from "./form/QuotationFormActions";
import { Card as ManualModeCard, CardContent as ManualModeCardContent, CardHeader as ManualModeCardHeader, CardTitle as ManualModeCardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

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

  const isAutoCompleted = useSmartSuggestions && hasHistoricalData && !isManualMode;

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
          <QuotationModeSelector
            hasHistoricalData={hasHistoricalData}
            useSmartSuggestions={useSmartSuggestions}
            onSmartSuggestionsChange={setUseSmartSuggestions}
            showAdvancedMode={showAdvancedMode}
            onAdvancedModeChange={setShowAdvancedMode}
            onSwitchToManualMode={switchToManualMode}
            suggestionsCount={suggestions.length}
          />

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
            <ManualModeCard>
              <ManualModeCardHeader>
                <div className="flex items-center justify-between">
                  <ManualModeCardTitle className="text-lg flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Entrada Manual de Datos</span>
                  </ManualModeCardTitle>
                  {uniqueSuppliers.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {uniqueSuppliers.length} proveedor{uniqueSuppliers.length !== 1 ? 'es' : ''} registrado{uniqueSuppliers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </ManualModeCardHeader>
              <ManualModeCardContent>
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
              </ManualModeCardContent>
            </ManualModeCard>
          )}

          {/* Tipo de Cotización */}
          <QuotationTypeSelector
            value={formData.tipo_cotizacion}
            onChange={(value) => setFormData({ ...formData, tipo_cotizacion: value })}
          />

          {/* Información del Proveedor */}
          <SupplierInformationForm
            formData={formData}
            onFormDataChange={setFormData}
            isAutoCompleted={isAutoCompleted}
          />

          {/* Información del Equipo */}
          <EquipmentInformationForm
            formData={formData}
            onFormDataChange={setFormData}
            isAutoCompleted={isAutoCompleted}
            availableBrands={availableBrands}
            getModelsForBrand={getModelsForBrand}
            isManualMode={isManualMode}
            useSmartSuggestions={useSmartSuggestions}
            hasHistoricalData={hasHistoricalData}
          />

          {/* Información Comercial */}
          <CommercialInformationForm
            formData={formData}
            onFormDataChange={setFormData}
            isAutoCompleted={isAutoCompleted}
          />

          {/* Accesorios */}
          <AccessoriesSection
            accessories={accessories}
            onAddAccessory={handleAddAccessory}
            onAccessoryChange={handleAccessoryChange}
            onRemoveAccessory={handleRemoveAccessory}
          />

          {/* Form Actions */}
          <QuotationFormActions
            onSaveDraft={() => handleSubmit(true)}
            onSubmit={() => handleSubmit(false)}
            isCreating={isCreating}
          />
        </CardContent>
      </Card>
    </div>
  );
};
