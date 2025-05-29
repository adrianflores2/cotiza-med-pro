
import { useState } from 'react';

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

const initialFormData: QuotationFormData = {
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
};

export const useQuotationFormData = () => {
  const [formData, setFormData] = useState<QuotationFormData>(initialFormData);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

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
    setFormData(initialFormData);
    setAccessories([]);
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
    handleAddAccessory,
    handleRemoveAccessory,
    handleAccessoryChange,
    clearForm,
    validateForm,
  };
};
