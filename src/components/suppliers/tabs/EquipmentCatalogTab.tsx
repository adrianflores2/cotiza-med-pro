
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Package } from 'lucide-react';
import { EquipmentForm } from '../EquipmentForm';
import { EquipmentCatalogFilters, CatalogFilters } from '../EquipmentCatalogFilters';
import { EquipmentCatalogTable } from '../tables/EquipmentCatalogTable';

interface EquipmentCatalogTabProps {
  selectedSupplier: string;
  onSupplierChange: (supplierId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  catalogFilters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  selectedEquipment: string;
  onEquipmentSelect: (equipmentId: string) => void;
  suppliers: any[];
  equipments: any[];
  masterEquipment: any[];
  isLoading: boolean;
  isDataReady: boolean;
  availableGroups: string[];
  onViewProformas: (equipmentId: string) => void;
  onPriceUpdate: (equipment: any) => void;
}

export const EquipmentCatalogTab = ({
  selectedSupplier,
  onSupplierChange,
  searchTerm,
  onSearchChange,
  catalogFilters,
  onFiltersChange,
  selectedEquipment,
  onEquipmentSelect,
  suppliers,
  equipments,
  masterEquipment,
  isLoading,
  isDataReady,
  availableGroups,
  onViewProformas,
  onPriceUpdate,
}: EquipmentCatalogTabProps) => {
  return (
    <div className="space-y-4">
      <EquipmentCatalogFilters
        filters={catalogFilters}
        onFiltersChange={onFiltersChange}
        availableGroups={availableGroups}
        isLoading={isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Catálogo de Equipos por Proveedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedSupplier} onValueChange={onSupplierChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todos los proveedores" />
              </SelectTrigger>
              <SelectContent>
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedSupplier && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!isDataReady}>
                    <Plus className="h-4 w-4 mr-2" />
                    {!isDataReady ? 'Cargando...' : 'Agregar Equipo'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Agregar Equipo al Proveedor</DialogTitle>
                  </DialogHeader>
                  {isDataReady ? (
                    <EquipmentForm 
                      supplierId={selectedSupplier}
                      masterEquipment={masterEquipment}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Cargando equipos maestros...</p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>

          {selectedEquipment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Equipo Seleccionado</Badge>
                  <span className="text-sm font-medium">
                    {masterEquipment?.find(eq => eq.id === selectedEquipment)?.nombre_equipo || 'Equipo desconocido'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEquipmentSelect('')}
                >
                  Deseleccionar
                </Button>
              </div>
            </div>
          )}

          <EquipmentCatalogTable
            equipments={equipments}
            selectedEquipment={selectedEquipment}
            isLoading={isLoading}
            onEquipmentSelect={onEquipmentSelect}
            onViewProformas={onViewProformas}
            onPriceUpdate={onPriceUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};
