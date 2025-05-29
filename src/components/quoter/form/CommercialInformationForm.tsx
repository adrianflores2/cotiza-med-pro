
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuotationFormData } from "@/hooks/useQuotationFormData";

interface CommercialInformationFormProps {
  formData: QuotationFormData;
  onFormDataChange: (data: QuotationFormData) => void;
  isAutoCompleted: boolean;
}

export const CommercialInformationForm = ({
  formData,
  onFormDataChange,
  isAutoCompleted
}: CommercialInformationFormProps) => {
  const updateField = (field: keyof QuotationFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="precio">Precio Unitario *</Label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => updateField('precio_unitario', e.target.value)}
                placeholder="0.00"
                className={isAutoCompleted ? 'bg-green-50' : ''}
                required
              />
            </div>
            <Select 
              value={formData.moneda} 
              onValueChange={(value) => updateField('moneda', value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="PEN">PEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
          <Input
            id="tiempo_entrega"
            value={formData.tiempo_entrega}
            onChange={(e) => updateField('tiempo_entrega', e.target.value)}
            placeholder="Ej: 30 días calendario"
          />
        </div>

        <div>
          <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
          <Input
            id="fecha_vencimiento"
            type="date"
            value={formData.fecha_vencimiento}
            onChange={(e) => updateField('fecha_vencimiento', e.target.value)}
          />
        </div>

        {formData.tipo_cotizacion === "importado" && (
          <div>
            <Label htmlFor="incoterm">Incoterm *</Label>
            <Select 
              value={formData.incoterm} 
              onValueChange={(value) => updateField('incoterm', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar incoterm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="condiciones">Condiciones de Pago</Label>
        <Textarea
          id="condiciones"
          value={formData.condiciones}
          onChange={(e) => updateField('condiciones', e.target.value)}
          placeholder="Ej: 50% adelanto, 50% contra entrega"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => updateField('observaciones', e.target.value)}
          placeholder="Observaciones adicionales sobre la cotización"
          rows={3}
        />
      </div>
    </div>
  );
};
