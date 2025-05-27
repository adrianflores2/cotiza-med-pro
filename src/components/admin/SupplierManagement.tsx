
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Globe, MapPin, Edit } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { SupplierEditDialog } from '@/components/suppliers/SupplierEditDialog';

export const SupplierManagement = () => {
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

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

  const nationalSuppliers = validSuppliers.filter(s => s.tipo_proveedor === 'nacional' || !s.tipo_proveedor);
  const internationalSuppliers = validSuppliers.filter(s => s.tipo_proveedor === 'internacional');

  const SupplierCard = ({ supplier }: { supplier: any }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{supplier.razon_social}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={supplier.tipo_proveedor === 'internacional' ? 'default' : 'secondary'}>
                {supplier.tipo_proveedor === 'internacional' ? (
                  <><Globe className="w-3 h-3 mr-1" />Internacional</>
                ) : (
                  <><MapPin className="w-3 h-3 mr-1" />Nacional</>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSupplier(supplier)}
                title="Editar proveedor"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
  );

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-8">
      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">No hay proveedores {type} registrados</p>
      <p className="text-sm text-gray-400 mt-2">Crea tu primer proveedor usando el botón de arriba</p>
    </div>
  );

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

      {loadingSuppliers ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando proveedores...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Todos ({validSuppliers.length})
            </TabsTrigger>
            <TabsTrigger value="nacional" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nacionales ({nationalSuppliers.length})
            </TabsTrigger>
            <TabsTrigger value="internacional" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Internacionales ({internationalSuppliers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Todos los Proveedores</CardTitle>
              </CardHeader>
              <CardContent>
                {validSuppliers.length === 0 ? (
                  <EmptyState type="" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {validSuppliers.map((supplier) => (
                      <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nacional">
            <Card>
              <CardHeader>
                <CardTitle>Proveedores Nacionales</CardTitle>
              </CardHeader>
              <CardContent>
                {nationalSuppliers.length === 0 ? (
                  <EmptyState type="nacionales" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {nationalSuppliers.map((supplier) => (
                      <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internacional">
            <Card>
              <CardHeader>
                <CardTitle>Proveedores Internacionales</CardTitle>
              </CardHeader>
              <CardContent>
                {internationalSuppliers.length === 0 ? (
                  <EmptyState type="internacionales" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {internationalSuppliers.map((supplier) => (
                      <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Supplier Edit Dialog */}
      {editingSupplier && (
        <SupplierEditDialog
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          supplier={editingSupplier}
        />
      )}
    </div>
  );
};
