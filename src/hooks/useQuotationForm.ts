
import { useState, useEffect } from 'react';
import { useSuppliers } from './useSuppliers';
import { useEquipmentSuppliers } from './useEquipmentSuppliers';
import { useSmartSupplierSuggestions } from './useSmartSupplierSuggestions';
import { useQuotationFormData } from './useQuotationFormData';

export { type QuotationFormData, type Accessory } from './useQuotationFormData';

export const useQuotationForm = (equipmentId?: string) => {
  const {
    formData,
    setFormData,
    accessories,
    setAccessories,
    handleAddAccessory,
    handleRemoveAccessory,
    handleAccessoryChange,
    clearForm: clearFormData,
    validateForm,
  } = useQuotationFormData();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [useSmartSuggestions, setUseSmartSuggestions] = useState(true);
  const [hasAppliedAutoSuggestion, setHasAppliedAutoSuggestion] = useState(false);

  const { suppliers } = useSuppliers();
  const { 
    uniqueSuppliers, 
    availableBrands, 
    getModelsForBrand, 
    getSupplierEquipment 
  } = useEquipmentSuppliers(equipmentId);

  const { 
    suggestions,
    bestSuggestion, 
    hasHistoricalData 
  } = useSmartSupplierSuggestions(equipmentId);

  // Auto-apply best suggestion when smart mode is enabled and we have data
  useEffect(() => {
    if (
      useSmartSuggestions && 
      bestSuggestion && 
      hasHistoricalData && 
      !hasAppliedAutoSuggestion &&
      !selectedSupplierId
    ) {
      console.log('Auto-applying best suggestion:', bestSuggestion);
      applySupplierSuggestion(bestSuggestion);
      setHasAppliedAutoSuggestion(true);
    }
  }, [bestSuggestion, hasHistoricalData, useSmartSuggestions, hasAppliedAutoSuggestion, selectedSupplierId]);

  // Reset auto-suggestion flag when smart suggestions are toggled
  useEffect(() => {
    if (!useSmartSuggestions) {
      setHasAppliedAutoSuggestion(false);
    }
  }, [useSmartSuggestions]);

  const applySupplierSuggestion = (suggestion: any) => {
    console.log('Applying supplier suggestion:', suggestion);
    
    setSelectedSupplierId(suggestion.id);
    setIsManualMode(false);
    
    setFormData(prev => ({
      ...prev,
      proveedor_razon_social: suggestion.razon_social,
      proveedor_ruc: suggestion.ruc || '',
      proveedor_pais: suggestion.pais || '',
      proveedor_contacto: suggestion.nombre_contacto || '',
      proveedor_apellido: suggestion.apellido_contacto || '',
      proveedor_email: suggestion.email_contacto || '',
      proveedor_telefono: suggestion.telefono_contacto || '',
      marca: suggestion.marca,
      modelo: suggestion.modelo,
      procedencia: suggestion.procedencia || '',
      precio_unitario: suggestion.precio_unitario?.toString() || '',
      moneda: suggestion.moneda || 'USD',
    }));
  };

  // Handle switching to manual mode for new supplier
  const switchToManualMode = () => {
    setIsManualMode(true);
    setSelectedSupplierId('');
    setUseSmartSuggestions(false);
    
    // Clear form data for manual entry
    setFormData(prev => ({
      ...prev,
      proveedor_razon_social: '',
      proveedor_ruc: '',
      proveedor_pais: '',
      proveedor_contacto: '',
      proveedor_apellido: '',
      proveedor_email: '',
      proveedor_telefono: '',
      marca: '',
      modelo: '',
      procedencia: '',
      precio_unitario: '',
      moneda: 'USD',
    }));
  };

  // Auto-fill supplier information when supplier is selected (manual mode)
  useEffect(() => {
    if (selectedSupplierId && isManualMode && !useSmartSuggestions) {
      const selectedSupplier = uniqueSuppliers.find(s => s.suppliers.id === selectedSupplierId);
      if (selectedSupplier) {
        setFormData(prev => ({
          ...prev,
          proveedor_razon_social: selectedSupplier.suppliers.razon_social,
          proveedor_ruc: selectedSupplier.suppliers.ruc || '',
          proveedor_pais: selectedSupplier.suppliers.pais || '',
          proveedor_contacto: selectedSupplier.suppliers.nombre_contacto || '',
          proveedor_apellido: selectedSupplier.suppliers.apellido_contacto || '',
          proveedor_email: selectedSupplier.suppliers.email_contacto || '',
          proveedor_telefono: selectedSupplier.suppliers.telefono_contacto || '',
        }));
      }
    }
  }, [selectedSupplierId, isManualMode, uniqueSuppliers, useSmartSuggestions]);

  // Auto-fill equipment information when brand and model are selected (manual mode)
  useEffect(() => {
    if (formData.marca && formData.modelo && isManualMode && !useSmartSuggestions) {
      const supplierEquipment = getSupplierEquipment(formData.marca, formData.modelo);
      if (supplierEquipment) {
        setFormData(prev => ({
          ...prev,
          precio_unitario: supplierEquipment.precio_unitario?.toString() || '',
          moneda: supplierEquipment.moneda || 'USD',
          procedencia: supplierEquipment.procedencia || '',
        }));
      }
    }
  }, [formData.marca, formData.modelo, isManualMode, getSupplierEquipment, useSmartSuggestions]);

  const clearForm = () => {
    clearFormData();
    setSelectedSupplierId('');
    setIsManualMode(false);
    setUseSmartSuggestions(true);
    setHasAppliedAutoSuggestion(false);
  };

  return {
    formData,
    setFormData,
    accessories,
    setAccessories,
    selectedSupplierId,
    setSelectedSupplierId,
    isManualMode,
    setIsManualMode: switchToManualMode,
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
    clearForm,
    validateForm,
    hasHistoricalData,
  };
};
