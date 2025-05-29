
import { AccessoryRow } from "./AccessoryRow";
import { Accessory } from "@/hooks/useQuotationFormData";

interface AccessoryTableProps {
  accessories: Accessory[];
  onAccessoryChange: (id: string, field: keyof Accessory, value: any) => void;
  onRemoveAccessory: (id: string) => void;
}

export const AccessoryTable = ({ accessories, onAccessoryChange, onRemoveAccessory }: AccessoryTableProps) => {
  if (accessories.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No hay accesorios agregados. Haz clic en "Agregar Accesorio" para añadir uno.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {accessories.map((accessory) => (
        <AccessoryRow
          key={accessory.id}
          accessory={accessory}
          onAccessoryChange={onAccessoryChange}
          onRemoveAccessory={onRemoveAccessory}
        />
      ))}
    </div>
  );
};
