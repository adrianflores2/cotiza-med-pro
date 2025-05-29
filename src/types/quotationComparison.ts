
export interface QuotationComparison {
  id: string;
  item_id: string;
  cotizacion_seleccionada_id: string;
  comercial_id: string;
  margen_utilidad?: number;
  precio_venta?: number;
  justificacion?: string;
  observaciones?: string;
  fecha_seleccion: string;
  created_at: string;
}

export interface QuotationAccessory {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario?: number;
  moneda?: string;
  incluido_en_proforma: boolean;
  observaciones?: string;
}

export interface QuotationWithDetails {
  id: string;
  marca: string;
  modelo: string;
  precio_unitario: number;
  moneda: string;
  tiempo_entrega?: string;
  condiciones?: string;
  fecha_cotizacion: string;
  estado: string;
  tipo_cotizacion: string;
  supplier: {
    razon_social: string;
    pais?: string;
  };
  cotizador?: {
    nombre: string;
    email: string;
  };
  procedencia?: string;
  selected?: boolean;
  accessories?: QuotationAccessory[];
  quotation_accessories?: QuotationAccessory[];
}

export interface ItemWithQuotations {
  id: string;
  numero_item: number;
  cantidad: number;
  observaciones?: string;
  project: {
    id: string;
    nombre: string;
  };
  equipment: {
    codigo: string;
    nombre_equipo: string;
  };
  quotations: QuotationWithDetails[];
  comparison?: QuotationComparison;
}

export interface SelectQuotationParams {
  itemId: string;
  quotationId: string;
  comercialId: string;
  margenUtilidad?: number;
  precioVenta?: number;
  justificacion?: string;
}
