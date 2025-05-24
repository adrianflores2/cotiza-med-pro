
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  FileText,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectListProps {
  onNewProject: () => void;
}

const mockProjects = [
  {
    id: 1,
    name: "Hospital San Juan - Unidad de Cuidados Intensivos",
    client: "Hospital San Juan",
    status: "En cotización",
    items: 45,
    assignedQuoters: 3,
    createdDate: "2024-01-15",
    excelFile: "UCI_Items_v2.xlsx",
    pdfFile: "Especificaciones_UCI.pdf"
  },
  {
    id: 2,
    name: "Clínica Norte - Modernización Quirófanos",
    client: "Clínica Norte S.A.",
    status: "Asignación pendiente",
    items: 78,
    assignedQuoters: 0,
    createdDate: "2024-01-18",
    excelFile: "Quirofanos_Lista.xlsx",
    pdfFile: "Requerimientos_Quirofanos.pdf"
  },
  {
    id: 3,
    name: "Centro Médico Sur - Laboratorio Clínico",
    client: "Centro Médico Sur",
    status: "Comparación",
    items: 23,
    assignedQuoters: 2,
    createdDate: "2024-01-10",
    excelFile: "Lab_Equipos.xlsx",
    pdfFile: "Especificaciones_Lab.pdf"
  },
];

const statusColors = {
  "En cotización": "bg-blue-100 text-blue-800",
  "Asignación pendiente": "bg-orange-100 text-orange-800",
  "Comparación": "bg-green-100 text-green-800",
  "Finalizado": "bg-gray-100 text-gray-800",
};

export const ProjectList = ({ onNewProject }: ProjectListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Gestión de Proyectos</h3>
          <p className="text-gray-600">Administra y supervisa todos los proyectos de cotización</p>
        </div>
        <Button onClick={onNewProject} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar por estado
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Todos los estados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("En cotización")}>
              En cotización
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Asignación pendiente")}>
              Asignación pendiente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Comparación")}>
              Comparación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 mb-2">
                    {project.name}
                  </CardTitle>
                  <p className="text-gray-600 mb-3">{project.client}</p>
                  <Badge 
                    className={statusColors[project.status as keyof typeof statusColors]}
                  >
                    {project.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem>Asignar ítems</DropdownMenuItem>
                    <DropdownMenuItem>Exportar datos</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Eliminar proyecto
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.items} ítems</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.assignedQuoters} cotizadores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.createdDate}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    📊 {project.excelFile}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  📄 {project.pdfFile}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda o crea un nuevo proyecto.</p>
        </div>
      )}
    </div>
  );
};
