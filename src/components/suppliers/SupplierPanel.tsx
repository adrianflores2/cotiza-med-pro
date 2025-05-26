
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, DollarSign, Package, FileText } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierEquipments } from '@/hooks/useSupplierEquipments';
import { useMasterEquipment } from '@/hooks/useMasterEquipment';
import { useIndependentProformas } from '@/hooks/useIndependentProformas';
import { SupplierForm } from './SupplierForm';
import { EquipmentForm } from './EquipmentForm';
import { ProformaForm } from './ProformaForm';

export const SupplierPanel = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { equipments, isLoading: loadingEquipments } = useSupplierEquipments(selectedSupplier, searchTerm);
  const { equipment: masterEquipment } = useMasterEquipment();
  const { proformas } = useIndependentProformas(selectedEquipment);

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Proveedores</h1>
        <div className="flex gap-2">
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
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Catálogo de Equipos</TabsTrigger>
          <TabsTrigger value="suppliers">Gestión de Proveedores</TabsTrigger>
          <TabsTrigger value="proformas">Proformas Independientes</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Catálogo de Equipos por Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los proveedores</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.razon_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, nombre, marca o modelo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {selectedSupplier && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Equipo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Equipo al Proveedor</DialogTitle>
                      </DialogHeader>
                      <EquipmentForm 
                        supplierId={selectedSupplier}
                        masterEquipment={masterEquipment}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

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
                    {loadingEquipments ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Cargando equipos...
                        </TableCell>
                      </TableRow>
                    ) : equipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No se encontraron equipos
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipments.map((equipment) => (
                        <TableRow key={equipment.id}>
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
                                onClick={() => setSelectedEquipment(equipment.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Actualizar Precio</DialogTitle>
                                  </DialogHeader>
                                  {/* Price update form would go here */}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Listado de Proveedores</CardTitle>
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
            </CardHeader>
            <CardContent>
              {loadingSuppliers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando proveedores...</p>
                </div>
              ) : suppliers.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay proveedores registrados</p>
                  <p className="text-sm text-gray-400 mt-2">Crea tu primer proveedor usando el botón de arriba</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{supplier.razon_social}</h3>
                          <p className="text-sm text-muted-foreground">RUC: {supplier.ruc}</p>
                          {supplier.pais && (
                            <p className="text-sm text-muted-foreground">País: {supplier.pais}</p>
                          )}
                          {supplier.email_contacto && (
                            <p className="text-sm text-muted-foreground">{supplier.email_contacto}</p>
                          )}
                          {supplier.telefono_contacto && (
                            <p className="text-sm text-muted-foreground">Tel: {supplier.telefono_contacto}</p>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="outline">
                              {supplier.nombre_contacto ? 
                                `${supplier.nombre_contacto} ${supplier.apellido_contacto || ''}`.trim() : 
                                'Sin contacto'
                              }
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proformas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proformas Independientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  Gestiona proformas no ligadas a proyectos específicos
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Proforma
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Proforma Independiente</DialogTitle>
                    </DialogHeader>
                    <ProformaForm />
                  </DialogContent>
                </Dialog>
              </div>

              {selectedEquipment && proformas.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Moneda</TableHead>
                        <TableHead>Tiempo Entrega</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proformas.map((proforma) => (
                        <TableRow key={proforma.id}>
                          <TableCell>
                            {new Date(proforma.fecha_proforma).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {proforma.supplier_equipments?.suppliers?.razon_social}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {proforma.supplier_equipments?.master_equipment?.nombre_equipo}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {proforma.supplier_equipments?.marca} - {proforma.supplier_equipments?.modelo}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatPrice(proforma.precio_unitario, proforma.moneda)}
                          </TableCell>
                          <TableCell>{proforma.moneda}</TableCell>
                          <TableCell>{proforma.tiempo_entrega || 'No especificado'}</TableCell>
                          <TableCell>
                            <Badge variant={proforma.vigente ? "default" : "secondary"}>
                              {proforma.vigente ? 'Vigente' : 'Vencida'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
