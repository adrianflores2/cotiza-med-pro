
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, ExternalLink, Plus } from 'lucide-react';
import { useIndependentProformas } from '@/hooks/useIndependentProformas';

interface EquipmentProformasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName: string;
}

export const EquipmentProformasDialog = ({ 
  isOpen, 
  onClose, 
  equipmentId, 
  equipmentName 
}: EquipmentProformasDialogProps) => {
  const { proformas, isLoading } = useIndependentProformas(equipmentId);

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proformas para: {equipmentName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando proformas...</p>
            </div>
          ) : proformas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay proformas para este equipo</p>
              <p className="text-sm text-gray-400 mt-2">
                Las proformas aparecerán aquí cuando se creen para este equipo específico
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {proformas.length} proforma{proformas.length !== 1 ? 's' : ''} encontrada{proformas.length !== 1 ? 's' : ''}
                </p>
                <Badge variant="outline">
                  {proformas.filter(p => p.vigente).length} vigente{proformas.filter(p => p.vigente).length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Marca/Modelo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Tiempo Entrega</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proformas.map((proforma) => (
                      <TableRow key={proforma.id}>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(proforma.fecha_proforma)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {proforma.supplier_equipments?.suppliers?.razon_social}
                            </div>
                            {proforma.supplier_equipments?.suppliers?.ruc && (
                              <div className="text-xs text-muted-foreground">
                                RUC: {proforma.supplier_equipments.suppliers.ruc}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {proforma.supplier_equipments?.marca}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {proforma.supplier_equipments?.modelo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatPrice(proforma.precio_unitario, proforma.moneda)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {proforma.tiempo_entrega || 'No especificado'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={proforma.vigente ? "default" : "secondary"}>
                            {proforma.vigente ? 'Vigente' : 'Vencida'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {proforma.archivo_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                title="Ver archivo"
                              >
                                <a href={proforma.archivo_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {proformas.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Total: {proformas.length} proforma{proformas.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    Vigentes: {proformas.filter(p => p.vigente).length} | 
                    Vencidas: {proformas.filter(p => !p.vigente).length}
                  </span>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
