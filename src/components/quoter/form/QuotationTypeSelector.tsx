
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuotationTypeSelectorProps {
  value: 'nacional' | 'importado';
  onChange: (value: 'nacional' | 'importado') => void;
}

export const QuotationTypeSelector = ({ value, onChange }: QuotationTypeSelectorProps) => {
  return (
    <div>
      <Label className="text-base font-medium">Tipo de Cotización *</Label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as 'nacional' | 'importado')}
        className="flex space-x-4 mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nacional" id="nacional" />
          <Label htmlFor="nacional">Compra Nacional</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="importado" id="importado" />
          <Label htmlFor="importado">Importado</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
