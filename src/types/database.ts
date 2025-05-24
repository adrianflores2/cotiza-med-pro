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
