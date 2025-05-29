
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Accessory } from "@/hooks/useQuotationFormData";

interface AccessoryRowProps {
  accessory: Accessory;
  onAccessoryChange: (id: string, field: keyof Accessory, value: any) => void;
  onRemoveAccessory: (id: string) => void;
}

export const AccessoryRow = ({ accessory, onAccessoryChange, onRemoveAccessory }: AccessoryRowProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
      <div>
        <Label>Nombre del Accesorio</Label>
        <Input
          value={accessory.nombre}
          onChange={(e) => onAccessoryChange(accessory.id, 'nombre', e.target.value)}
          placeholder="Nombre del accesorio"
        />
      </div>
      <div>
        <Label>Cantidad</Label>
        <Input
          type="number"
          min="1"
          value={accessory.cantidad}
          onChange={(e) => onAccessoryChange(accessory.id, 'cantidad', parseInt(e.target.value))}
        />
      </div>
      <div>
        <Label>Precio Unitario</Label>
        <Input
          type="number"
          step="0.01"
          value={accessory.precio_unitario}
          onChange={(e) => onAccessoryChange(accessory.id, 'precio_unitario', e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label>Moneda</Label>
        <Select 
          value={accessory.moneda}
          onValueChange={(value) => onAccessoryChange(accessory.id, 'moneda', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="PEN">PEN</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>¿Incluir en proforma?</Label>
        <Select 
          value={accessory.incluido_en_proforma ? "si" : "no"}
          onValueChange={(value) => onAccessoryChange(accessory.id, 'incluido_en_proforma', value === "si")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="si">Sí</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onRemoveAccessory(accessory.id)}
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
