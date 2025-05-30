
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Accessory } from "@/hooks/useQuotationFormData";
import { PriceInput } from "@/components/ui/forms/PriceInput";

interface OptimizedAccessoryRowProps {
  accessory: Accessory;
  onAccessoryChange: (id: string, field: keyof Accessory, value: any) => void;
  onRemoveAccessory: (id: string) => void;
}

export const OptimizedAccessoryRow = React.memo(({
  accessory,
  onAccessoryChange,
  onRemoveAccessory
}: OptimizedAccessoryRowProps) => {
  const handleFieldChange = React.useCallback((field: keyof Accessory, value: any) => {
    onAccessoryChange(accessory.id, field, value);
  }, [accessory.id, onAccessoryChange]);

  const handleRemove = React.useCallback(() => {
    onRemoveAccessory(accessory.id);
  }, [accessory.id, onRemoveAccessory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <Input
          placeholder="Nombre del accesorio"
          value={accessory.nombre}
          onChange={(e) => handleFieldChange('nombre', e.target.value)}
        />
      </div>
      
      <div>
        <Input
          type="number"
          placeholder="Cantidad"
          value={accessory.cantidad}
          onChange={(e) => handleFieldChange('cantidad', parseInt(e.target.value) || 1)}
          min="1"
        />
      </div>

      <div className="md:col-span-2">
        <PriceInput
          value={accessory.precio_unitario}
          currency={accessory.moneda}
          onValueChange={(value) => handleFieldChange('precio_unitario', value)}
          onCurrencyChange={(currency) => handleFieldChange('moneda', currency)}
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`incluido-${accessory.id}`}
          checked={accessory.incluido_en_proforma}
          onCheckedChange={(checked) => handleFieldChange('incluido_en_proforma', checked)}
        />
        <label htmlFor={`incluido-${accessory.id}`} className="text-sm">
          Incluido en proforma
        </label>
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          title="Eliminar accesorio"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

OptimizedAccessoryRow.displayName = 'OptimizedAccessoryRow';
