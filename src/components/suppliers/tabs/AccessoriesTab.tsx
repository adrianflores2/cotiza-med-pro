
import { Card, CardContent } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import { EquipmentAccessoriesTab } from '../EquipmentAccessoriesTab';

interface AccessoriesTabProps {
  selectedEquipment: string;
  equipmentName?: string;
}

export const AccessoriesTab = ({ selectedEquipment, equipmentName }: AccessoriesTabProps) => {
  if (!selectedEquipment) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona un equipo para ver sus accesorios</p>
          <p className="text-sm text-gray-400 mt-2">Puedes seleccionar un equipo desde la pestaña "Catálogo de Equipos"</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <EquipmentAccessoriesTab 
      equipmentId={selectedEquipment}
      equipmentName={equipmentName || 'Equipo seleccionado'}
    />
  );
};
