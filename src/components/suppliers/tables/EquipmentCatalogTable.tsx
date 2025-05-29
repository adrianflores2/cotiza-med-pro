
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, DollarSign, Wrench } from 'lucide-react';

interface EquipmentCatalogTableProps {
  equipments: any[];
  selectedEquipment: string;
  isLoading: boolean;
  onEquipmentSelect: (equipmentId: string) => void;
  onViewProformas: (equipmentId: string) => void;
  onPriceUpdate: (equipment: any) => void;
}

export const EquipmentCatalogTable = ({
  equipments,
  selectedEquipment,
  isLoading,
  onEquipmentSelect,
  onViewProformas,
  onPriceUpdate
}: EquipmentCatalogTableProps) => {
  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Precio Actual</TableHead>
            <TableHead>Precio Anterior</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Cargando equipos...
              </TableCell>
            </TableRow>
          ) : equipments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No se encontraron equipos con los filtros aplicados
              </TableCell>
            </TableRow>
          ) : (
            equipments.map((equipment) => (
              <TableRow 
                key={equipment.id}
                className={selectedEquipment === equipment.equipment_id ? 'bg-blue-50' : ''}
              >
                <TableCell className="font-mono">
                  {equipment.master_equipment?.codigo}
                </TableCell>
                <TableCell>{equipment.master_equipment?.nombre_equipo}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{equipment.marca}</div>
                    <div className="text-sm text-muted-foreground">{equipment.modelo}</div>
                  </div>
                </TableCell>
                <TableCell>{equipment.suppliers?.razon_social}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {formatPrice(equipment.precio_unitario, equipment.moneda)}
                    </Badge>
                    {equipment.fecha_ultima_actualizacion && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(equipment.fecha_ultima_actualizacion).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {equipment.precio_anterior ? (
                    <Badge variant="secondary">
                      {formatPrice(equipment.precio_anterior, equipment.moneda)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {equipment.master_equipment?.grupo_generico}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewProformas(equipment.equipment_id)}
                      title="Ver proformas"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPriceUpdate(equipment)}
                      title="Actualizar precio"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEquipmentSelect(equipment.equipment_id)}
                      title="Ver accesorios"
                    >
                      <Wrench className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
