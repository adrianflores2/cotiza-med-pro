
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Supplier {
  id: string;
  razon_social: string;
  ruc?: string;
  pais?: string;
}

interface SupplierSelectorProps {
  suppliers: Supplier[];
  value: string;
  onValueChange: (value: string) => void;
  onAddNew?: () => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const SupplierSelector = React.memo(({
  suppliers,
  value,
  onValueChange,
  onAddNew,
  label = "Proveedor",
  placeholder = "Seleccionar proveedor",
  required = false,
  disabled = false,
  isLoading = false,
  className = ""
}: SupplierSelectorProps) => {
  const selectedSupplier = suppliers.find(s => s.id === value);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex space-x-2">
        <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Cargando..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{supplier.razon_social}</span>
                  {supplier.ruc && (
                    <span className="text-xs text-gray-500">RUC: {supplier.ruc}</span>
                  )}
                  {supplier.pais && (
                    <span className="text-xs text-gray-500">{supplier.pais}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onAddNew && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddNew}
            disabled={disabled || isLoading}
            title="Agregar nuevo proveedor"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
      {selectedSupplier && (
        <div className="text-xs text-gray-600 mt-1">
          {selectedSupplier.ruc && `RUC: ${selectedSupplier.ruc}`}
          {selectedSupplier.pais && ` • ${selectedSupplier.pais}`}
        </div>
      )}
    </div>
  );
});

SupplierSelector.displayName = 'SupplierSelector';
