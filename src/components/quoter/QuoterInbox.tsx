
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useItemAssignments } from "@/hooks/useItemAssignments";
import { useAuth } from "@/hooks/useAuth";
import { QuotationForm } from "./QuotationForm";

const statusColors = {
  "pendiente": "bg-orange-100 text-orange-800",
  "en_proceso": "bg-blue-100 text-blue-800",
  "completado": "bg-green-100 text-green-800",
};

const statusLabels = {
  "pendiente": "Pendiente",
  "en_proceso": "En progreso", 
  "completado": "Completado",
};

export const QuoterInbox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const { assignments, isLoading } = useItemAssignments();
  const { user } = useAuth();

  console.log('QuoterInbox: User:', user?.email, 'Assignments:', assignments.length);

  // Si hay una asignación seleccionada, mostrar el formulario de cotización
  if (selectedAssignment) {
    return (
      <QuotationForm 
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  // Filtrar asignaciones para el usuario actual
  const userAssignments = assignments.filter(assignment => 
    assignment.cotizador_id === user?.id
  );

  console.log('QuoterInbox: User assignments:', userAssignments.length);

  // Aplicar filtros
  const filteredItems = userAssignments.filter(assignment => {
    const item = assignment.project_items;
    if (!item) return false;

    const matchesSearch = 
      item.master_equipment?.nombre_equipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.master_equipment?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projects?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || assignment.estado === statusFilter;
    const matchesProject = projectFilter === "all" || item.proyecto_id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Obtener proyectos únicos para el filtro
  const uniqueProjects = Array.from(
    new Set(
      userAssignments
        .map(a => a.project_items?.projects)
        .filter(Boolean)
        .map(p => JSON.stringify({ id: p!.id, nombre: p!.nombre }))
    )
  ).map(p => JSON.parse(p));

  // Calcular estadísticas
  const pendingCount = userAssignments.filter(a => a.estado === "pendiente").length;
  const inProgressCount = userAssignments.filter(a => a.estado === "en_proceso").length;
  const completedCount = userAssignments.filter(a => a.estado === "completado").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Mi Bandeja de Cotización</h3>
            <p className="text-gray-600">Gestiona los ítems asignados para cotización</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Mi Bandeja de Cotización</h3>
          <p className="text-gray-600">Gestiona los ítems asignados para cotización</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                <p className="text-sm text-gray-600">En progreso</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                <p className="text-sm text-gray-600">Completados</p>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En progreso</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {uniqueProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-4">
          {filteredItems.map((assignment) => {
            const item = assignment.project_items!;
            const equipment = item.master_equipment!;
            const project = item.projects!;

            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{equipment.nombre_equipo}</h4>
                        <Badge className={statusColors[assignment.estado as keyof typeof statusColors]}>
                          {statusLabels[assignment.estado as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{project.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Código: {equipment.codigo} | Cantidad: {item.cantidad} unidades
                      </p>
                      {item.observaciones && (
                        <p className="text-sm text-gray-500 mt-1">
                          Observaciones: {item.observaciones}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Cotizar
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Asignado: {new Date(assignment.fecha_asignacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">
                        Ítem #{item.numero_item}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {userAssignments.length === 0 ? 'No tienes asignaciones' : 'No hay ítems que coincidan'}
          </h3>
          <p className="text-gray-600">
            {userAssignments.length === 0 
              ? 'Espera a que un coordinador te asigne ítems para cotizar.'
              : 'Intenta ajustar los filtros de búsqueda.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
