
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AccessoryTable } from "./AccessoryTable";
import { Accessory } from "@/hooks/useQuotationFormData";

interface AccessoriesSectionProps {
  accessories: Accessory[];
  onAddAccessory: () => void;
  onAccessoryChange: (id: string, field: keyof Accessory, value: any) => void;
  onRemoveAccessory: (id: string) => void;
}

export const AccessoriesSection = ({
  accessories,
  onAddAccessory,
  onAccessoryChange,
  onRemoveAccessory
}: AccessoriesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Accesorios</CardTitle>
          <Button variant="outline" size="sm" onClick={onAddAccessory}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Accesorio
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AccessoryTable
          accessories={accessories}
          onAccessoryChange={onAccessoryChange}
          onRemoveAccessory={onRemoveAccessory}
        />
      </CardContent>
    </Card>
  );
};
