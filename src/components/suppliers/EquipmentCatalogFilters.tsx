
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

export interface CatalogFilters {
  grupoGenerico?: string;
  tipoProveedor?: string;
  moneda?: string;
}

interface EquipmentCatalogFiltersProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  availableGroups: string[];
  isLoading?: boolean;
}

export const EquipmentCatalogFilters = ({ 
  filters, 
  onFiltersChange, 
  availableGroups,
  isLoading = false 
}: EquipmentCatalogFiltersProps) => {
  const updateFilter = (key: keyof CatalogFilters, value: any) => {
    // Convert placeholder values back to undefined for the filters
    const filterValue = value === 'all' || value === 'any' ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue || undefined
    });
  };

  const clearFilter = (key: keyof CatalogFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avanzados</h4>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs h-6"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar todo
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Grupo Genérico */}
              <div className="space-y-2">
                <Label>Grupo Genérico</Label>
                <Select 
                  value={filters.grupoGenerico || 'all'} 
                  onValueChange={(value) => updateFilter('grupoGenerico', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los grupos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    {availableGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Proveedor */}
              <div className="space-y-2">
                <Label>Tipo de Proveedor</Label>
                <Select 
                  value={filters.tipoProveedor || 'any'} 
                  onValueChange={(value) => updateFilter('tipoProveedor', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquier tipo</SelectItem>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="internacional">Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moneda */}
              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select 
                  value={filters.moneda || 'any'} 
                  onValueChange={(value) => updateFilter('moneda', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquier moneda</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="PEN">PEN</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm text-muted-foreground">Filtros activos:</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.grupoGenerico && (
                    <Badge variant="secondary" className="text-xs">
                      Grupo: {filters.grupoGenerico}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => clearFilter('grupoGenerico')}
                        className="h-4 w-4 p-0 ml-1"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.tipoProveedor && (
                    <Badge variant="secondary" className="text-xs">
                      Tipo: {filters.tipoProveedor}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => clearFilter('tipoProveedor')}
                        className="h-4 w-4 p-0 ml-1"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.moneda && (
                    <Badge variant="secondary" className="text-xs">
                      Moneda: {filters.moneda}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => clearFilter('moneda')}
                        className="h-4 w-4 p-0 ml-1"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
