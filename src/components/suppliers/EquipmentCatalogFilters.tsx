
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

export interface CatalogFilters {
  grupoGenerico?: string;
  procedencia?: string;
  tipoProveedor?: string;
  precioMin?: number;
  precioMax?: number;
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
    onFiltersChange({
      ...filters,
      [key]: value || undefined
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar todo
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Grupo Genérico */}
          <div className="space-y-2">
            <Label>Grupo Genérico</Label>
            <Select 
              value={filters.grupoGenerico || ''} 
              onValueChange={(value) => updateFilter('grupoGenerico', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los grupos</SelectItem>
                {availableGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.grupoGenerico && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearFilter('grupoGenerico')}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Procedencia */}
          <div className="space-y-2">
            <Label>Procedencia</Label>
            <Select 
              value={filters.procedencia || ''} 
              onValueChange={(value) => updateFilter('procedencia', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cualquier origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Cualquier origen</SelectItem>
                <SelectItem value="Nacional">Nacional</SelectItem>
                <SelectItem value="Internacional">Internacional</SelectItem>
              </SelectContent>
            </Select>
            {filters.procedencia && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearFilter('procedencia')}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Tipo de Proveedor */}
          <div className="space-y-2">
            <Label>Tipo de Proveedor</Label>
            <Select 
              value={filters.tipoProveedor || ''} 
              onValueChange={(value) => updateFilter('tipoProveedor', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cualquier tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Cualquier tipo</SelectItem>
                <SelectItem value="nacional">Nacional</SelectItem>
                <SelectItem value="internacional">Internacional</SelectItem>
              </SelectContent>
            </Select>
            {filters.tipoProveedor && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearFilter('tipoProveedor')}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Moneda */}
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select 
              value={filters.moneda || ''} 
              onValueChange={(value) => updateFilter('moneda', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cualquier moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Cualquier moneda</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="PEN">PEN</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
            {filters.moneda && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearFilter('moneda')}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Rango de Precios */}
        <div className="space-y-2">
          <Label>Rango de Precios</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Precio mínimo"
              value={filters.precioMin || ''}
              onChange={(e) => updateFilter('precioMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={isLoading}
              className="w-32"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Precio máximo"
              value={filters.precioMax || ''}
              onChange={(e) => updateFilter('precioMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={isLoading}
              className="w-32"
            />
            {(filters.precioMin || filters.precioMax) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  clearFilter('precioMin');
                  clearFilter('precioMax');
                }}
                className="h-8 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
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
              {filters.procedencia && (
                <Badge variant="secondary" className="text-xs">
                  Origen: {filters.procedencia}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearFilter('procedencia')}
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
              {(filters.precioMin || filters.precioMax) && (
                <Badge variant="secondary" className="text-xs">
                  Precio: {filters.precioMin || '0'} - {filters.precioMax || '∞'}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      clearFilter('precioMin');
                      clearFilter('precioMax');
                    }}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
