
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface ProjectFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  grupoGenerico: string;
  setGrupoGenerico: (grupo: string) => void;
  estado: string;
  setEstado: (estado: string) => void;
  gruposDisponibles: string[];
  onClearFilters: () => void;
}

export const ProjectFilters = ({
  searchTerm,
  setSearchTerm,
  grupoGenerico,
  setGrupoGenerico,
  estado,
  setEstado,
  gruposDisponibles,
  onClearFilters,
}: ProjectFiltersProps) => {
  console.log('ProjectFilters: gruposDisponibles:', gruposDisponibles);
  
  // More robust filtering - ensure values are strings and not empty
  const validGrupos = gruposDisponibles.filter(grupo => {
    const isValid = typeof grupo === 'string' && grupo.trim() !== '' && grupo !== null && grupo !== undefined;
    console.log('ProjectFilters: validating grupo:', grupo, 'isValid:', isValid);
    return isValid;
  });
  
  console.log('ProjectFilters: validGrupos after filtering:', validGrupos);
  
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filtros</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Código o nombre del equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Grupo Genérico</label>
          <Select value={grupoGenerico} onValueChange={setGrupoGenerico}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los grupos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {validGrupos.map((grupo) => {
                console.log('ProjectFilters: rendering SelectItem for grupo:', grupo);
                return (
                  <SelectItem key={grupo} value={grupo}>
                    {grupo}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="asignado">Asignado</SelectItem>
              <SelectItem value="cotizado">Cotizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
