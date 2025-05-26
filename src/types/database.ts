
export type UserRole = 'coordinador' | 'cotizador' | 'comercial' | 'admin';
export type ProjectStatus = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
export type QuotationStatus = 'vigente' | 'vencida' | 'seleccionada' | 'descartada';

export interface User {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface MasterEquipment {
  id: string;
  codigo: string;
  grupo_generico: string;
  nombre_equipo: string;
  cotizador_predeterminado_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRule {
  id: string;
  nombre: string;
  patron_codigo?: string;
  patron_nombre?: string;
  grupo_generico?: string;
  cotizador_id: string;
  prioridad: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  nombre: string;
  estado: ProjectStatus;
  excel_url?: string;
  requerimientos_pdf_url?: string;
  responsable_id?: string;
  fecha_creacion: string;
  fecha_vencimiento?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  proyecto_id: string;
  numero_item: number;
  equipment_id: string;
  cantidad: number;
  requiere_accesorios: boolean;
  observaciones?: string;
  estado?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  razon_social: string;
  ruc: string;
  pais?: string;
  nombre_contacto?: string;
  apellido_contacto?: string;
  email_contacto?: string;
  telefono_contacto?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierEquipment {
  id: string;
  equipment_id: string;
  proveedor_id: string;
  marca: string;
  modelo: string;
  precio_unitario?: number;
  precio_anterior?: number;
  moneda?: string;
  procedencia?: string;
  catalogo_url?: string;
  ficha_tecnica_url?: string;
  manual_url?: string;
  fecha_cambio_precio?: string;
  fecha_ultima_actualizacion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndependentProforma {
  id: string;
  supplier_equipment_id: string;
  archivo_url?: string;
  fecha_proforma: string;
  precio_unitario?: number;
  moneda?: string;
  tiempo_entrega?: string;
  condiciones?: string;
  observaciones?: string;
  vigente: boolean;
  created_at: string;
  updated_at: string;
}
