export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignment_rules: {
        Row: {
          activo: boolean | null
          cotizador_id: string
          created_at: string | null
          grupo_generico: string | null
          id: string
          nombre: string
          patron_codigo: string | null
          patron_nombre: string | null
          prioridad: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          cotizador_id: string
          created_at?: string | null
          grupo_generico?: string | null
          id?: string
          nombre: string
          patron_codigo?: string | null
          patron_nombre?: string | null
          prioridad?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          cotizador_id?: string
          created_at?: string | null
          grupo_generico?: string | null
          id?: string
          nombre?: string
          patron_codigo?: string | null
          patron_nombre?: string | null
          prioridad?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_rules_cotizador_id_fkey"
            columns: ["cotizador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      item_assignments: {
        Row: {
          cotizador_id: string
          created_at: string | null
          estado: string | null
          fecha_asignacion: string | null
          id: string
          item_id: string
        }
        Insert: {
          cotizador_id: string
          created_at?: string | null
          estado?: string | null
          fecha_asignacion?: string | null
          id?: string
          item_id: string
        }
        Update: {
          cotizador_id?: string
          created_at?: string | null
          estado?: string | null
          fecha_asignacion?: string | null
          id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_assignments_cotizador_id_fkey"
            columns: ["cotizador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
        ]
      }
      master_equipment: {
        Row: {
          codigo: string
          cotizador_predeterminado_id: string | null
          created_at: string | null
          grupo_generico: string
          id: string
          nombre_equipo: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          cotizador_predeterminado_id?: string | null
          created_at?: string | null
          grupo_generico: string
          id?: string
          nombre_equipo: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          cotizador_predeterminado_id?: string | null
          created_at?: string | null
          grupo_generico?: string
          id?: string
          nombre_equipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_equipment_cotizador_predeterminado_id_fkey"
            columns: ["cotizador_predeterminado_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_items: {
        Row: {
          cantidad: number
          created_at: string | null
          equipment_id: string
          estado: string | null
          id: string
          numero_item: number
          observaciones: string | null
          proyecto_id: string
          requiere_accesorios: boolean | null
        }
        Insert: {
          cantidad?: number
          created_at?: string | null
          equipment_id: string
          estado?: string | null
          id?: string
          numero_item: number
          observaciones?: string | null
          proyecto_id: string
          requiere_accesorios?: boolean | null
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          equipment_id?: string
          estado?: string | null
          id?: string
          numero_item?: number
          observaciones?: string | null
          proyecto_id?: string
          requiere_accesorios?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "master_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_items_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          estado: Database["public"]["Enums"]["project_status"] | null
          excel_url: string | null
          fecha_creacion: string | null
          fecha_vencimiento: string | null
          id: string
          nombre: string
          observaciones: string | null
          requerimientos_pdf_url: string | null
          responsable_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["project_status"] | null
          excel_url?: string | null
          fecha_creacion?: string | null
          fecha_vencimiento?: string | null
          id?: string
          nombre: string
          observaciones?: string | null
          requerimientos_pdf_url?: string | null
          responsable_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["project_status"] | null
          excel_url?: string | null
          fecha_creacion?: string | null
          fecha_vencimiento?: string | null
          id?: string
          nombre?: string
          observaciones?: string | null
          requerimientos_pdf_url?: string | null
          responsable_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_accessories: {
        Row: {
          cantidad: number
          cotizacion_id: string
          created_at: string | null
          id: string
          incluido_en_proforma: boolean | null
          moneda: string | null
          nombre: string
          observaciones: string | null
          precio_unitario: number | null
        }
        Insert: {
          cantidad?: number
          cotizacion_id: string
          created_at?: string | null
          id?: string
          incluido_en_proforma?: boolean | null
          moneda?: string | null
          nombre: string
          observaciones?: string | null
          precio_unitario?: number | null
        }
        Update: {
          cantidad?: number
          cotizacion_id?: string
          created_at?: string | null
          id?: string
          incluido_en_proforma?: boolean | null
          moneda?: string | null
          nombre?: string
          observaciones?: string | null
          precio_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_accessories_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_comparisons: {
        Row: {
          comercial_id: string
          cotizacion_seleccionada_id: string
          created_at: string | null
          fecha_seleccion: string | null
          id: string
          item_id: string
          justificacion: string | null
          margen_utilidad: number | null
          observaciones: string | null
          precio_venta: number | null
        }
        Insert: {
          comercial_id: string
          cotizacion_seleccionada_id: string
          created_at?: string | null
          fecha_seleccion?: string | null
          id?: string
          item_id: string
          justificacion?: string | null
          margen_utilidad?: number | null
          observaciones?: string | null
          precio_venta?: number | null
        }
        Update: {
          comercial_id?: string
          cotizacion_seleccionada_id?: string
          created_at?: string | null
          fecha_seleccion?: string | null
          id?: string
          item_id?: string
          justificacion?: string | null
          margen_utilidad?: number | null
          observaciones?: string | null
          precio_venta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_comparisons_comercial_id_fkey"
            columns: ["comercial_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_comparisons_cotizacion_seleccionada_id_fkey"
            columns: ["cotizacion_seleccionada_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_comparisons_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          condiciones: string | null
          cotizador_id: string
          created_at: string | null
          estado: Database["public"]["Enums"]["quotation_status"] | null
          fecha_cotizacion: string | null
          fecha_vencimiento: string | null
          id: string
          incoterm: string | null
          item_id: string
          marca: string | null
          modelo: string | null
          moneda: string
          observaciones: string | null
          precio_unitario: number
          procedencia: string | null
          proforma_url: string | null
          proveedor_id: string
          supplier_equipment_id: string | null
          tiempo_entrega: string | null
          tipo_cambio: number | null
          tipo_cotizacion: string
          updated_at: string | null
        }
        Insert: {
          condiciones?: string | null
          cotizador_id: string
          created_at?: string | null
          estado?: Database["public"]["Enums"]["quotation_status"] | null
          fecha_cotizacion?: string | null
          fecha_vencimiento?: string | null
          id?: string
          incoterm?: string | null
          item_id: string
          marca?: string | null
          modelo?: string | null
          moneda?: string
          observaciones?: string | null
          precio_unitario: number
          procedencia?: string | null
          proforma_url?: string | null
          proveedor_id: string
          supplier_equipment_id?: string | null
          tiempo_entrega?: string | null
          tipo_cambio?: number | null
          tipo_cotizacion?: string
          updated_at?: string | null
        }
        Update: {
          condiciones?: string | null
          cotizador_id?: string
          created_at?: string | null
          estado?: Database["public"]["Enums"]["quotation_status"] | null
          fecha_cotizacion?: string | null
          fecha_vencimiento?: string | null
          id?: string
          incoterm?: string | null
          item_id?: string
          marca?: string | null
          modelo?: string | null
          moneda?: string
          observaciones?: string | null
          precio_unitario?: number
          procedencia?: string | null
          proforma_url?: string | null
          proveedor_id?: string
          supplier_equipment_id?: string | null
          tiempo_entrega?: string | null
          tipo_cambio?: number | null
          tipo_cotizacion?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_cotizador_id_fkey"
            columns: ["cotizador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_supplier_equipment_id_fkey"
            columns: ["supplier_equipment_id"]
            isOneToOne: false
            referencedRelation: "supplier_equipments"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_equipments: {
        Row: {
          activo: boolean | null
          catalogo_url: string | null
          created_at: string | null
          equipment_id: string
          fecha_cambio_precio: string | null
          fecha_ultima_actualizacion: string | null
          ficha_tecnica_url: string | null
          id: string
          manual_url: string | null
          marca: string
          modelo: string
          moneda: string | null
          precio_anterior: number | null
          precio_unitario: number | null
          procedencia: string | null
          proveedor_id: string
          tipo_cambio: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          catalogo_url?: string | null
          created_at?: string | null
          equipment_id: string
          fecha_cambio_precio?: string | null
          fecha_ultima_actualizacion?: string | null
          ficha_tecnica_url?: string | null
          id?: string
          manual_url?: string | null
          marca: string
          modelo: string
          moneda?: string | null
          precio_anterior?: number | null
          precio_unitario?: number | null
          procedencia?: string | null
          proveedor_id: string
          tipo_cambio?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          catalogo_url?: string | null
          created_at?: string | null
          equipment_id?: string
          fecha_cambio_precio?: string | null
          fecha_ultima_actualizacion?: string | null
          ficha_tecnica_url?: string | null
          id?: string
          manual_url?: string | null
          marca?: string
          modelo?: string
          moneda?: string | null
          precio_anterior?: number | null
          precio_unitario?: number | null
          procedencia?: string | null
          proveedor_id?: string
          tipo_cambio?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_equipments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "master_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_equipments_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          apellido_contacto: string | null
          created_at: string | null
          email_contacto: string | null
          id: string
          nombre_contacto: string | null
          pais: string | null
          razon_social: string
          ruc: string
          telefono_contacto: string | null
          updated_at: string | null
        }
        Insert: {
          apellido_contacto?: string | null
          created_at?: string | null
          email_contacto?: string | null
          id?: string
          nombre_contacto?: string | null
          pais?: string | null
          razon_social: string
          ruc: string
          telefono_contacto?: string | null
          updated_at?: string | null
        }
        Update: {
          apellido_contacto?: string | null
          created_at?: string | null
          email_contacto?: string | null
          id?: string
          nombre_contacto?: string | null
          pais?: string | null
          razon_social?: string
          ruc?: string
          telefono_contacto?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "coordinador" | "cotizador" | "comercial" | "admin"
      project_status: "pendiente" | "en_proceso" | "completado" | "cancelado"
      quotation_status: "vigente" | "vencida" | "seleccionada" | "descartada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["coordinador", "cotizador", "comercial", "admin"],
      project_status: ["pendiente", "en_proceso", "completado", "cancelado"],
      quotation_status: ["vigente", "vencida", "seleccionada", "descartada"],
    },
  },
} as const
