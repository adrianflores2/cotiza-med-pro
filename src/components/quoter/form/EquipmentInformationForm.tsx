
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import { QuotationFormData } from "@/hooks/useQuotationFormData";

interface EquipmentInformationFormProps {
  formData: QuotationFormData;
  onFormDataChange: (data: QuotationFormData) => void;
  isAutoCompleted: boolean;
  availableBrands: string[];
  getModelsForBrand: (brand: string) => string[];
  isManualMode: boolean;
  useSmartSuggestions: boolean;
  hasHistoricalData: boolean;
}

export const EquipmentInformationForm = ({
  formData,
  onFormDataChange,
  isAutoCompleted,
  availableBrands,
  getModelsForBrand,
  isManualMode,
  useSmartSuggestions,
  hasHistoricalData
}: EquipmentInformationFormProps) => {
  const updateField = (field: keyof QuotationFormData, value: string) => {
    if (field === 'marca') {
      onFormDataChange({ ...formData, [field]: value, modelo: '' });
    } else {
      onFormDataChange({ ...formData, [field]: value });
    }
  };

  const shouldShowBrandSelector = (isManualMode || !useSmartSuggestions || !hasHistoricalData) && availableBrands.length > 0;
  const shouldShowModelSelector = (isManualMode || !useSmartSuggestions || !hasHistoricalData) && 
                                  formData.marca && getModelsForBrand(formData.marca).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Package className="w-5 h-5" />
          <span>Información del Equipo</span>
          {isAutoCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Auto-completado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="marca">Marca *</Label>
            {shouldShowBrandSelector ? (
              <Select 
                value={formData.marca} 
                onValueChange={(value) => updateField('marca', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marca" />
                </SelectTrigger>
                <SelectContent>
                  {availableBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => updateField('marca', e.target.value)}
                placeholder="Ej: Philips"
                disabled={isAutoCompleted}
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="modelo">Modelo *</Label>
            {shouldShowModelSelector ? (
              <Select 
                value={formData.modelo} 
                onValueChange={(value) => updateField('modelo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {getModelsForBrand(formData.marca).map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => updateField('modelo', e.target.value)}
                placeholder="Ej: MX450"
                disabled={isAutoCompleted}
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="procedencia">Procedencia (País de Origen)</Label>
            <Input
              id="procedencia"
              value={formData.procedencia}
              onChange={(e) => updateField('procedencia', e.target.value)}
              placeholder="Ej: Alemania"
              disabled={isAutoCompleted}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
