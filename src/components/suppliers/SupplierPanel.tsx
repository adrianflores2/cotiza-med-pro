
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierEquipments } from '@/hooks/useSupplierEquipments';
import { useMasterEquipment } from '@/hooks/useMasterEquipment';
import { useIndependentProformas } from '@/hooks/useIndependentProformas';
import { SupplierForm } from './SupplierForm';
import { PriceUpdateDialog } from './PriceUpdateDialog';
import { SupplierEditDialog } from './SupplierEditDialog';
import { EquipmentProformasDialog } from './EquipmentProformasDialog';
import { CatalogFilters } from './EquipmentCatalogFilters';
import { useAuth } from '@/hooks/useAuth';
import { EquipmentCatalogTab } from './tabs/EquipmentCatalogTab';
import { SuppliersManagementTab } from './tabs/SuppliersManagementTab';
import { IndependentProformasTab } from './tabs/IndependentProformasTab';
import { AccessoriesTab } from './tabs/AccessoriesTab';

export const SupplierPanel = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [priceUpdateEquipment, setPriceUpdateEquipment] = useState<any>(null);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [proformasDialogEquipment, setProformasDialogEquipment] = useState<{id: string, name: string} | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>({});

  const { userRole } = useAuth();
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const { equipments, isLoading: loadingEquipments, getAvailableGroups } = useSupplierEquipments(
    selectedSupplier || undefined, 
    searchTerm, 
    catalogFilters
  );
  const { equipment: masterEquipment, isLoading: loadingMasterEquipment } = useMasterEquipment();
  const { proformas: allProformas, isLoading: loadingAllProformas } = useIndependentProformas();

  // Check if user can edit suppliers (coordinador or admin)
  const canEditSuppliers = userRole === 'coordinador' || userRole === 'admin';

  // Validate suppliers to prevent empty value SelectItems
  const validSuppliers = React.useMemo(() => {
    if (!Array.isArray(suppliers)) {
      return [];
    }

    const filtered = suppliers.filter(supplier => {
      const isValid = supplier && 
        typeof supplier === 'object' &&
        supplier.id &&
        typeof supplier.id === 'string' && 
        supplier.id.trim() !== '' &&
        supplier.razon_social;
      
      return isValid;
    });

    return filtered;
  }, [suppliers]);

  // Validar si los datos están listos para mostrar formularios
  const isDataReady = !loadingMasterEquipment && masterEquipment && masterEquipment.length > 0;

  // Function to handle opening proformas dialog
  const handleViewProformas = (equipmentId: string) => {
    const equipment = masterEquipment?.find(eq => eq.id === equipmentId);
    if (equipment) {
      setProformasDialogEquipment({
        id: equipmentId,
        name: equipment.nombre_equipo
      });
    }
  };

  // Get available groups for filters
  const availableGroups = getAvailableGroups();

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="catalog">Catálogo de Equipos</TabsTrigger>
          <TabsTrigger value="suppliers">Gestión de Proveedores</TabsTrigger>
          <TabsTrigger value="proformas">Proformas Independientes</TabsTrigger>
          <TabsTrigger value="accessories">Accesorios</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <EquipmentCatalogTab
            selectedSupplier={selectedSupplier}
            onSupplierChange={setSelectedSupplier}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            catalogFilters={catalogFilters}
            onFiltersChange={setCatalogFilters}
            selectedEquipment={selectedEquipment}
            onEquipmentSelect={setSelectedEquipment}
            suppliers={validSuppliers}
            equipments={equipments}
            masterEquipment={masterEquipment}
            isLoading={loadingEquipments}
            isDataReady={isDataReady}
            availableGroups={availableGroups}
            onViewProformas={handleViewProformas}
            onPriceUpdate={setPriceUpdateEquipment}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SuppliersManagementTab
            suppliers={validSuppliers}
            isLoading={loadingSuppliers}
            canEditSuppliers={canEditSuppliers}
            onEditSupplier={setEditingSupplier}
          />
        </TabsContent>

        <TabsContent value="proformas" className="space-y-4">
          <IndependentProformasTab
            proformas={allProformas}
            isLoading={loadingAllProformas}
            isEquipmentsLoading={loadingEquipments}
          />
        </TabsContent>

        <TabsContent value="accessories" className="space-y-4">
          <AccessoriesTab
            selectedEquipment={selectedEquipment}
            equipmentName={masterEquipment?.find(eq => eq.id === selectedEquipment)?.nombre_equipo}
          />
        </TabsContent>
      </Tabs>

      {/* Price Update Dialog */}
      {priceUpdateEquipment && (
        <PriceUpdateDialog
          isOpen={!!priceUpdateEquipment}
          onClose={() => setPriceUpdateEquipment(null)}
          equipment={priceUpdateEquipment}
        />
      )}

      {/* Supplier Edit Dialog */}
      {editingSupplier && (
        <SupplierEditDialog
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          supplier={editingSupplier}
        />
      )}

      {/* Equipment Proformas Dialog */}
      {proformasDialogEquipment && (
        <EquipmentProformasDialog
          isOpen={!!proformasDialogEquipment}
          onClose={() => setProformasDialogEquipment(null)}
          equipmentId={proformasDialogEquipment.id}
          equipmentName={proformasDialogEquipment.name}
        />
      )}
    </div>
  );
};
