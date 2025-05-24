
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter,
  Save,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProjectsData } from "@/hooks/useProjectsData";
import { useUsers } from "@/hooks/useUsers";
import { useItemAssignments } from "@/hooks/useItemAssignments";

export const ItemAssignment = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const { toast } = useToast();

  const { projects, isLoading: projectsLoading } = useProjectsData();
  const { users, isLoading: usersLoading } = useUsers();
  const { assignments, updateAssignment, isUpdating } = useItemAssignments();

  // Filtrar usuarios con rol de cotizador - corregir la lógica de filtrado
  const quoters = users.filter(user => {
    console.log('ItemAssignment: Checking user:', user.nombre, 'Roles:', user.roles);
    return user.roles && user.roles.includes('cotizador');
  });

  console.log('ItemAssignment: Total users:', users.length);
  console.log('ItemAssignment: Quoters found:', quoters.length);

  // Obtener el proyecto seleccionado
  const currentProject = projects.find(p => p.id === selectedProject);
  const projectItems = currentProject?.project_items || [];

  // Combinar ítems del proyecto con asignaciones existentes
  const itemsWithAssignments = projectItems.map(item => {
    const assignment = assignments.find(a => a.item_id === item.id);
    return {
      ...item,
      assignedTo: assignment?.cotizador_id || null
    };
  });

  const filteredItems = itemsWithAssignments.filter(item => {
    const equipment = item.master_equipment;
    if (!equipment) return false;
    
    const matchesSearch = equipment.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === "all" || equipment.grupo_generico === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const uniqueGroups = [...new Set(projectItems.map(item => item.master_equipment?.grupo_generico).filter(Boolean))];
  const unassignedCount = itemsWithAssignments.filter(item => !item.assignedTo).length;
  const assignedCount = itemsWithAssignments.filter(item => item.assignedTo).length;

  const handleAssignment = (itemId: string, quoterId: string) => {
    console.log('ItemAssignment: Handling assignment:', { itemId, quoterId });
    const cotizadorId = quoterId === "unassigned" ? null : quoterId;
    updateAssignment({ itemId, cotizadorId });
  };

  const getQuoterName = (quoterId: string | null) => {
    if (!quoterId) return null;
    return users.find(u => u.id === quoterId)?.nombre;
  };

  if (projectsLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Asignación de Ítems</h3>
            <p className="text-gray-600">Asigna ítems del proyecto a cotizadores específicos</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Asignación de Ítems</h3>
          <p className="text-gray-600">Asigna ítems del proyecto a cotizadores específicos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Seleccionar Proyecto</CardTitle>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{project.nombre}</span>
                      <Badge variant="secondary">{project.project_items?.length || 0} ítems</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {selectedProject && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{unassignedCount}</p>
                    <p className="text-sm text-gray-600">Ítems sin asignar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{assignedCount}</p>
                    <p className="text-sm text-gray-600">Ítems asignados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{quoters.length}</p>
                    <p className="text-sm text-gray-600">Cotizadores disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar ítems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {uniqueGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Ítems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Nº</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Código</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Grupo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre del Equipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cantidad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Asignado a</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const equipment = item.master_equipment;
                      if (!equipment) return null;

                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{item.numero_item}</td>
                          <td className="py-3 px-4 text-sm font-mono">{equipment.codigo}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {equipment.grupo_generico}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{equipment.nombre_equipo}</td>
                          <td className="py-3 px-4 text-sm">{item.cantidad}</td>
                          <td className="py-3 px-4">
                            <Select 
                              value={item.assignedTo || "unassigned"}
                              onValueChange={(value) => handleAssignment(item.id, value)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Sin asignar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">
                                  <span className="text-gray-500">Sin asignar</span>
                                </SelectItem>
                                {quoters.map(quoter => (
                                  <SelectItem key={quoter.id} value={quoter.id}>
                                    <div className="flex flex-col">
                                      <span>{quoter.nombre}</span>
                                      <span className="text-xs text-gray-500">{quoter.email}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredItems.length === 0 && selectedProject && (
                <div className="text-center py-8">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ítems</h3>
                  <p className="text-gray-600">
                    {projectItems.length === 0 
                      ? "Este proyecto no tiene ítems cargados." 
                      : "No hay ítems que coincidan con los filtros seleccionados."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedProject && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un proyecto</h3>
          <p className="text-gray-600">Elige un proyecto para comenzar a asignar ítems a cotizadores.</p>
        </div>
      )}
    </div>
  );
};
