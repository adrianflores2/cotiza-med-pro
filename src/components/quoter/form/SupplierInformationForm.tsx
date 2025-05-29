
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { QuotationFormData } from "@/hooks/useQuotationFormData";

interface SupplierInformationFormProps {
  formData: QuotationFormData;
  onFormDataChange: (data: QuotationFormData) => void;
  isAutoCompleted: boolean;
}

export const SupplierInformationForm = ({
  formData,
  onFormDataChange,
  isAutoCompleted
}: SupplierInformationFormProps) => {
  const updateField = (field: keyof QuotationFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const isPeruvianSupplier = formData.proveedor_pais?.toLowerCase().includes('per');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Building className="w-5 h-5" />
          <span>Información del Proveedor</span>
          {isAutoCompleted && (
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
              onChange={(e) => updateField('proveedor_razon_social', e.target.value)}
              placeholder="Nombre de la empresa"
              disabled={isAutoCompleted}
              required
            />
          </div>
          <div>
            <Label htmlFor="proveedor_pais">País *</Label>
            <Input
              id="proveedor_pais"
              value={formData.proveedor_pais}
              onChange={(e) => updateField('proveedor_pais', e.target.value)}
              placeholder="Ej: Perú"
              disabled={isAutoCompleted}
            />
          </div>

          <div>
            <Label htmlFor="proveedor_ruc">
              RUC {isPeruvianSupplier && '*'}
            </Label>
            <Input
              id="proveedor_ruc"
              value={formData.proveedor_ruc}
              onChange={(e) => updateField('proveedor_ruc', e.target.value)}
              placeholder="20123456789"
              disabled={isAutoCompleted}
              required={isPeruvianSupplier}
            />
          </div>
          <div>
            <Label htmlFor="proveedor_contacto">Nombre Contacto</Label>
            <Input
              id="proveedor_contacto"
              value={formData.proveedor_contacto}
              onChange={(e) => updateField('proveedor_contacto', e.target.value)}
              placeholder="Nombre del contacto"
              disabled={isAutoCompleted}
            />
          </div>
          <div>
            <Label htmlFor="proveedor_apellido">Apellido Contacto</Label>
            <Input
              id="proveedor_apellido"
              value={formData.proveedor_apellido}
              onChange={(e) => updateField('proveedor_apellido', e.target.value)}
              placeholder="Apellido del contacto"
              disabled={isAutoCompleted}
            />
          </div>
          <div>
            <Label htmlFor="proveedor_email">Email</Label>
            <Input
              id="proveedor_email"
              type="email"
              value={formData.proveedor_email}
              onChange={(e) => updateField('proveedor_email', e.target.value)}
              placeholder="contacto@empresa.com"
              disabled={isAutoCompleted}
            />
          </div>
          <div>
            <Label htmlFor="proveedor_telefono">Teléfono</Label>
            <Input
              id="proveedor_telefono"
              value={formData.proveedor_telefono}
              onChange={(e) => updateField('proveedor_telefono', e.target.value)}
              placeholder="+51 999 999 999"
              disabled={isAutoCompleted}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
