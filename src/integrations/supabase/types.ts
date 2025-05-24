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
      project_items: {
        Row: {
          cantidad: number
          codigo_interno: string
          id: string
          nombre_equipo: string
          numero_item: number
          proyecto_id: string | null
          requiere_accesorios: boolean | null
        }
        Insert: {
          cantidad: number
          codigo_interno: string
          id?: string
          nombre_equipo: string
          numero_item: number
          proyecto_id?: string | null
          requiere_accesorios?: boolean | null
        }
        Update: {
          cantidad?: number
          codigo_interno?: string
          id?: string
          nombre_equipo?: string
          numero_item?: number
          proyecto_id?: string | null
          requiere_accesorios?: boolean | null
        }
        Relationships: [
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
          estado: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          requerimiento_url: string | null
          responsable_id: string | null
        }
        Insert: {
          estado?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          requerimiento_url?: string | null
          responsable_id?: string | null
        }
        Update: {
          estado?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          requerimiento_url?: string | null
          responsable_id?: string | null
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
          cotizacion_id: string | null
          en_misma_proforma: boolean | null
          id: string
          nombre: string
          observaciones: string | null
          precio_unitario: number | null
        }
        Insert: {
          cantidad: number
          cotizacion_id?: string | null
          en_misma_proforma?: boolean | null
          id?: string
          nombre: string
          observaciones?: string | null
          precio_unitario?: number | null
        }
        Update: {
          cantidad?: number
          cotizacion_id?: string | null
          en_misma_proforma?: boolean | null
          id?: string
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
      quotations: {
        Row: {
          cotizacion_pdf_url: string | null
          equipo_id: string | null
          estado: string | null
          fecha_cotizacion: string | null
          id: string
          incoterm: string | null
          item_id: string | null
          moneda: string
          precio_unitario: number
          proveedor_id: string | null
          tiempo_entrega: string | null
          tipo_cambio: number | null
          usuario_id: string | null
        }
        Insert: {
          cotizacion_pdf_url?: string | null
          equipo_id?: string | null
          estado?: string | null
          fecha_cotizacion?: string | null
          id?: string
          incoterm?: string | null
          item_id?: string | null
          moneda: string
          precio_unitario: number
          proveedor_id?: string | null
          tiempo_entrega?: string | null
          tipo_cambio?: number | null
          usuario_id?: string | null
        }
        Update: {
          cotizacion_pdf_url?: string | null
          equipo_id?: string | null
          estado?: string | null
          fecha_cotizacion?: string | null
          id?: string
          incoterm?: string | null
          item_id?: string | null
          moneda?: string
          precio_unitario?: number
          proveedor_id?: string | null
          tiempo_entrega?: string | null
          tipo_cambio?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "supplier_equipments"
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
            foreignKeyName: "quotations_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_equipments: {
        Row: {
          catalogo_url: string | null
          codigo_interno: string
          cotizacion_pdf_url: string | null
          fecha_actualizacion: string | null
          id: string
          manual_url: string | null
          marca: string
          modelo: string
          moneda: string | null
          precio_unitario: number | null
          procedencia: string | null
          proveedor_id: string | null
          tipo_cambio: number | null
        }
        Insert: {
          catalogo_url?: string | null
          codigo_interno: string
          cotizacion_pdf_url?: string | null
          fecha_actualizacion?: string | null
          id?: string
          manual_url?: string | null
          marca: string
          modelo: string
          moneda?: string | null
          precio_unitario?: number | null
          procedencia?: string | null
          proveedor_id?: string | null
          tipo_cambio?: number | null
        }
        Update: {
          catalogo_url?: string | null
          codigo_interno?: string
          cotizacion_pdf_url?: string | null
          fecha_actualizacion?: string | null
          id?: string
          manual_url?: string | null
          marca?: string
          modelo?: string
          moneda?: string | null
          precio_unitario?: number | null
          procedencia?: string | null
          proveedor_id?: string | null
          tipo_cambio?: number | null
        }
        Relationships: [
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
          email_contacto: string | null
          id: string
          nombre_contacto: string | null
          pais: string | null
          razon_social: string
          ruc: string
          telefono_contacto: string | null
        }
        Insert: {
          apellido_contacto?: string | null
          email_contacto?: string | null
          id?: string
          nombre_contacto?: string | null
          pais?: string | null
          razon_social: string
          ruc: string
          telefono_contacto?: string | null
        }
        Update: {
          apellido_contacto?: string | null
          email_contacto?: string | null
          id?: string
          nombre_contacto?: string | null
          pais?: string | null
          razon_social?: string
          ruc?: string
          telefono_contacto?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          id: string
          nombre: string
          rol: string
        }
        Insert: {
          email: string
          id: string
          nombre: string
          rol: string
        }
        Update: {
          email?: string
          id?: string
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
