
import React from "react";
import { OptimizedAccessoryRow } from "./OptimizedAccessoryRow";
import { Accessory } from "@/hooks/useQuotationFormData";
import { EmptyState } from "@/components/ui/states/EmptyState";

interface OptimizedAccessoryTableProps {
  accessories: Accessory[];
  onAccessoryChange: (id: string, field: keyof Accessory, value: any) => void;
  onRemoveAccessory: (id: string) => void;
  onAddAccessory?: () => void;
}

export const OptimizedAccessoryTable = React.memo(({ 
  accessories, 
  onAccessoryChange, 
  onRemoveAccessory,
  onAddAccessory 
}: OptimizedAccessoryTableProps) => {
  if (accessories.length === 0) {
    return (
      <EmptyState
        icon="package"
        message="No hay accesorios agregados"
        description="Haz clic en 'Agregar Accesorio' para añadir uno."
        action={onAddAccessory ? {
          label: "Agregar Accesorio",
          onClick: onAddAccessory
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {accessories.map((accessory) => (
        <OptimizedAccessoryRow
          key={accessory.id}
          accessory={accessory}
          onAccessoryChange={onAccessoryChange}
          onRemoveAccessory={onRemoveAccessory}
        />
      ))}
    </div>
  );
});

OptimizedAccessoryTable.displayName = 'OptimizedAccessoryTable';
