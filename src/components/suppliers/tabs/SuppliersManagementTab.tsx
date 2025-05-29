
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package } from 'lucide-react';
import { SupplierForm } from '../SupplierForm';
import { SupplierGrid } from '../tables/SupplierGrid';

interface SuppliersManagementTabProps {
  suppliers: any[];
  isLoading: boolean;
  canEditSuppliers: boolean;
  onEditSupplier: (supplier: any) => void;
}

export const SuppliersManagementTab = ({
  suppliers,
  isLoading,
  canEditSuppliers,
  onEditSupplier
}: SuppliersManagementTabProps) => {
  return (
    <div className="space-y-4">
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
          {isLoading ? (
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
            <SupplierGrid
              suppliers={suppliers}
              canEditSuppliers={canEditSuppliers}
              onEditSupplier={onEditSupplier}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
