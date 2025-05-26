
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { SupplierForm } from '@/components/suppliers/SupplierForm';

export const SupplierManagement = () => {
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {validSuppliers.map((supplier) => (
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
    </div>
  );
};
