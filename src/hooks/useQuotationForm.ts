
import { useState, useEffect } from 'react';
import { useSuppliers } from './useSuppliers';
import { useEquipmentSuppliers } from './useEquipmentSuppliers';
import { useSmartSupplierSuggestions } from './useSmartSupplierSuggestions';

export interface QuotationFormData {
  tipo_cotizacion: 'nacional' | 'importado';
  proveedor_razon_social: string;
  proveedor_ruc: string;
  proveedor_pais: string;
  proveedor_contacto: string;
  proveedor_apellido: string;
  proveedor_email: string;
  proveedor_telefono: string;
  marca: string;
  modelo: string;
  procedencia: string;
  precio_unitario: string;
  moneda: string;
  tiempo_entrega: string;
  condiciones: string;
  incoterm: string;
  observaciones: string;
  fecha_vencimiento: string;
}

export interface Accessory {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: string;
  moneda: string;
  incluido_en_proforma: boolean;
}

export const useQuotationForm = (equipmentId?: string) => {
  const [formData, setFormData] = useState<QuotationFormData>({
    tipo_cotizacion: 'nacional',
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
    tiempo_entrega: '',
    condiciones: '',
    incoterm: '',
    observaciones: '',
    fecha_vencimiento: '',
  });

  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [useSmartSuggestions, setUseSmartSuggestions] = useState(true);

  const { suppliers } = useSuppliers();
  const { 
    uniqueSuppliers, 
    availableBrands, 
    getModelsForBrand, 
    getSupplierEquipment 
  } = useEquipmentSuppliers(equipmentId);

  const { 
    bestSuggestion, 
    hasHistoricalData 
  } = useSmartSupplierSuggestions(equipmentId);

  // Auto-apply best suggestion when component loads
  useEffect(() => {
    if (useSmartSuggestions && bestSuggestion && hasHistoricalData && !selectedSupplierId) {
      console.log('Auto-applying best suggestion:', bestSuggestion);
      applySupplierSuggestion(bestSuggestion);
    }
  }, [bestSuggestion, hasHistoricalData, useSmartSuggestions, selectedSupplierId]);

  const applySupplierSuggestion = (suggestion: any) => {
    console.log('Applying supplier suggestion:', suggestion);
    
    setSelectedSupplierId(suggestion.id);
    setIsNewSupplier(false);
    setUseSmartSuggestions(true);
    
    // Find the full supplier data
    const fullSupplier = uniqueSuppliers.find(s => s.suppliers.id === suggestion.id);
    
    if (fullSupplier) {
      setFormData(prev => ({
        ...prev,
        proveedor_razon_social: fullSupplier.suppliers.razon_social,
        proveedor_ruc: fullSupplier.suppliers.ruc || '',
        proveedor_pais: fullSupplier.suppliers.pais || '',
        proveedor_contacto: fullSupplier.suppliers.nombre_contacto || '',
        proveedor_apellido: fullSupplier.suppliers.apellido_contacto || '',
        proveedor_email: fullSupplier.suppliers.email_contacto || '',
        proveedor_telefono: fullSupplier.suppliers.telefono_contacto || '',
        marca: suggestion.marca,
        modelo: suggestion.modelo,
        procedencia: suggestion.procedencia || '',
        precio_unitario: suggestion.precio_unitario?.toString() || '',
        moneda: suggestion.moneda || 'USD',
      }));
    }
  };

  // Auto-fill supplier information when supplier is selected
  useEffect(() => {
    if (selectedSupplierId && !isNewSupplier && !useSmartSuggestions) {
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
  }, [selectedSupplierId, isNewSupplier, uniqueSuppliers, useSmartSuggestions]);

  // Auto-fill equipment information when brand and model are selected
  useEffect(() => {
    if (formData.marca && formData.modelo && !isNewSupplier && !useSmartSuggestions) {
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
  }, [formData.marca, formData.modelo, isNewSupplier, getSupplierEquipment, useSmartSuggestions]);

  const handleAddAccessory = () => {
    const newAccessory: Accessory = {
      id: Date.now().toString(),
      nombre: '',
      cantidad: 1,
      precio_unitario: '',
      moneda: 'USD',
      incluido_en_proforma: true,
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

  const clearForm = () => {
    setFormData({
      tipo_cotizacion: 'nacional',
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
      tiempo_entrega: '',
      condiciones: '',
      incoterm: '',
      observaciones: '',
      fecha_vencimiento: '',
    });
    setAccessories([]);
    setSelectedSupplierId('');
    setIsNewSupplier(false);
    setUseSmartSuggestions(true);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.precio_unitario.trim()) {
      errors.push('El precio unitario es requerido');
    }

    if (!formData.proveedor_razon_social.trim()) {
      errors.push('La razón social del proveedor es requerida');
    }

    if (!formData.marca.trim() || !formData.modelo.trim()) {
      errors.push('La marca y modelo son requeridos');
    }

    if (formData.tipo_cotizacion === 'importado' && !formData.incoterm) {
      errors.push('El incoterm es requerido para cotizaciones de importación');
    }

    // RUC validation only for Peruvian suppliers
    if (formData.proveedor_pais?.toLowerCase() === 'perú' || formData.proveedor_pais?.toLowerCase() === 'peru') {
      if (!formData.proveedor_ruc.trim()) {
        errors.push('El RUC es requerido para proveedores peruanos');
      }
    }

    return errors;
  };

  return {
    formData,
    setFormData,
    accessories,
    setAccessories,
    selectedSupplierId,
    setSelectedSupplierId,
    isNewSupplier,
    setIsNewSupplier,
    useSmartSuggestions,
    setUseSmartSuggestions,
    uniqueSuppliers,
    availableBrands,
    getModelsForBrand,
    handleAddAccessory,
    handleRemoveAccessory,
    handleAccessoryChange,
    applySupplierSuggestion,
    clearForm,
    validateForm,
    hasHistoricalData,
  };
};
