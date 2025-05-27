import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Eye, EyeOff, Wrench } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierEquipments } from '@/hooks/useSupplierEquipments';
import { useMasterEquipment } from '@/hooks/useMasterEquipment';
import { SupplierForm } from './SupplierForm';
import { EquipmentForm } from './EquipmentForm';

export const SupplierManagement = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { equipments, isLoading: loadingEquipments } = useSupplierEquipments(selectedSupplier || undefined);
  const { equipment: masterEquipment } = useMasterEquipment();

  // Validate suppliers to prevent empty value SelectItems
  const validSuppliers = React.useMemo(() => {
    if (!Array.isArray(suppliers)) {
      console.log('SupplierManagement: suppliers is not an array:', suppliers);
      return [];
    }

    const filtered = suppliers.filter(supplier => {
      const isValid = supplier && 
        typeof supplier === 'object' &&
        supplier.id &&
        typeof supplier.id === 'string' && 
        supplier.id.trim() !== '' &&
        supplier.razon_social;
      
      if (!isValid) {
        console.log('SupplierManagement: Filtering out invalid supplier:', supplier);
      }
      
      return isValid;
    });

    console.log('SupplierManagement: Valid suppliers filtered:', filtered.length, 'out of', suppliers.length);
    return filtered;
  }, [suppliers]);

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleSupplierClick = (supplierId: string) => {
    if (selectedSupplier === supplierId) {
      setSelectedSupplier(null); // Collapse if already selected
    } else {
      setSelectedSupplier(supplierId); // Expand selected supplier
    }
  };

  const handleEquipmentAdded = () => {
    setShowEquipmentDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
            </DialogHeader>
            <SupplierForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSuppliers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando proveedores...</p>
            </div>
          ) : validSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay proveedores registrados</p>
              <p className="text-sm text-gray-400 mt-2">Crea tu primer proveedor usando el botón de arriba</p>
            </div>
          ) : (
            <div className="space-y-4">
              {validSuppliers.map((supplier) => (
                <div key={supplier.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                    onClick={() => handleSupplierClick(supplier.id)}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{supplier.razon_social}</h3>
                        <div className="flex items-center gap-2">
                          {selectedSupplier === supplier.id && (
                            <Dialog open={showEquipmentDialog} onOpenChange={setShowEquipmentDialog}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <Wrench className="h-4 w-4 mr-2" />
                                  Agregar Equipo
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Agregar Equipo a {supplier.razon_social}</DialogTitle>
                                </DialogHeader>
                                <EquipmentForm 
                                  supplierId={supplier.id}
                                  masterEquipment={masterEquipment}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button variant="ghost" size="sm">
                            {selectedSupplier === supplier.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <p>RUC: {supplier.ruc}</p>
                        {supplier.pais && <p>País: {supplier.pais}</p>}
                        {supplier.email_contacto && <p>Email: {supplier.email_contacto}</p>}
                        {supplier.telefono_contacto && <p>Tel: {supplier.telefono_contacto}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {supplier.nombre_contacto ? 
                            `${supplier.nombre_contacto} ${supplier.apellido_contacto || ''}`.trim() : 
                            'Sin contacto'
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Equipment list for selected supplier */}
                  {selectedSupplier === supplier.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Equipos Distribuidos
                      </h4>
                      
                      {loadingEquipments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Cargando equipos...</p>
                        </div>
                      ) : equipments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Este proveedor no tiene equipos registrados</p>
                      ) : (
                        <div className="border rounded-lg bg-white">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Marca/Modelo</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Grupo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {equipments.map((equipment) => (
                                <TableRow key={equipment.id}>
                                  <TableCell className="font-mono text-sm">
                                    {equipment.master_equipment?.codigo}
                                  </TableCell>
                                  <TableCell>{equipment.master_equipment?.nombre_equipo}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{equipment.marca}</div>
                                      <div className="text-sm text-muted-foreground">{equipment.modelo}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {formatPrice(equipment.precio_unitario, equipment.moneda)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {equipment.master_equipment?.grupo_generico}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
