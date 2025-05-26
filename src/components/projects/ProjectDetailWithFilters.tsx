
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectFilters } from "./ProjectFilters";
import { SupplierPanel } from "../suppliers/SupplierPanel";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Package,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings
} from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjectDetail";

interface ProjectDetailWithFiltersProps {
  projectId: string;
  onBack: () => void;
}

const estadoColors = {
  pendiente: "bg-yellow-100 text-yellow-800",
  asignado: "bg-blue-100 text-blue-800", 
  cotizado: "bg-green-100 text-green-800",
};

const estadoIcons = {
  pendiente: Clock,
  asignado: AlertCircle,
  cotizado: CheckCircle,
};

export const ProjectDetailWithFilters = ({ projectId, onBack }: ProjectDetailWithFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoGenerico, setGrupoGenerico] = useState("all");
  const [estado, setEstado] = useState("all");
  const [showSupplierPanel, setShowSupplierPanel] = useState(false);

  const { project, isLoading, error } = useProjectDetail(projectId, {
    grupoGenerico: grupoGenerico === "all" ? undefined : grupoGenerico,
    searchTerm: searchTerm || undefined,
    estado: estado === "all" ? undefined : estado,
  });

  const clearFilters = () => {
    setSearchTerm("");
    setGrupoGenerico("all");
    setEstado("all");
  };

  // Obtener grupos únicos para el filtro
  const gruposDisponibles = project?.project_items
    ? Array.from(new Set(project.project_items.map(item => item.master_equipment?.grupo_generico).filter(Boolean)))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
        </Button>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando detalles del proyecto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
        </Button>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error al cargar el proyecto</p>
        </div>
      </div>
    );
  }

  const gruposDisponibles = project?.project_items
    ? Array.from(new Set(project.project_items.map(item => item.master_equipment?.grupo_generico).filter(Boolean)))
    : [];

  const { stats } = project;

  if (showSupplierPanel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowSupplierPanel(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Proyecto
          </Button>
          <Badge variant="secondary">
            Panel de Proveedores
          </Badge>
        </div>
        <SupplierPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSupplierPanel(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Panel de Proveedores
          </Button>
          <Badge variant="secondary">
            {project.estado}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Header del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{project.nombre}</CardTitle>
            {project.observaciones && (
              <p className="text-gray-600">{project.observaciones}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Fecha de Creación</p>
                  <p className="font-medium">
                    {new Date(project.fecha_creacion || project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {project.fecha_vencimiento && (
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Fecha de Vencimiento</p>
                    <p className="font-medium">
                      {new Date(project.fecha_vencimiento).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Total de Ítems</p>
                  <p className="font-medium">{stats.total} equipos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Progreso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Progreso General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.porcentajeProgreso}%</span>
                <span className="text-sm text-gray-500">Completado</span>
              </div>
              <Progress value={stats.porcentajeProgreso} className="h-2" />
              <div className="text-sm text-gray-600">
                {stats.cotizados} de {stats.total} ítems cotizados
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desglose por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Asignados</span>
                  </div>
                  <span className="font-medium">{stats.asignados}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Cotizados</span>
                  </div>
                  <span className="font-medium">{stats.cotizados}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pendientes</span>
                  </div>
                  <span className="font-medium">{stats.pendientes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <ProjectFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          grupoGenerico={grupoGenerico}
          setGrupoGenerico={setGrupoGenerico}
          estado={estado}
          setEstado={setEstado}
          gruposDisponibles={gruposDisponibles}
          onClearFilters={clearFilters}
        />

        {/* Lista de Ítems */}
        <Card>
          <CardHeader>
            <CardTitle>
              Ítems del Proyecto
              {(searchTerm || grupoGenerico !== "all" || estado !== "all") && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Mostrando {project.project_items?.length || 0} de {stats.total} ítems)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.project_items?.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron ítems con los filtros aplicados</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                project.project_items?.map((item) => {
                  const hasAssignment = item.item_assignments && item.item_assignments.length > 0;
                  const assignment = hasAssignment ? item.item_assignments[0] : null;
                  const estado = item.estado || 'pendiente';
                  const EstadoIcon = estadoIcons[estado] || Clock;
                  
                  return (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">
                              Ítem #{item.numero_item}
                            </Badge>
                            <Badge className={estadoColors[estado] || estadoColors.pendiente}>
                              <EstadoIcon className="w-3 h-3 mr-1" />
                              {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </Badge>
                            {item.master_equipment?.grupo_generico && (
                              <Badge variant="secondary">
                                {item.master_equipment.grupo_generico}
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium">{item.master_equipment?.nombre_equipo}</h4>
                            <p className="text-sm text-gray-600">
                              Código: {item.master_equipment?.codigo} | Cantidad: {item.cantidad}
                            </p>
                            {item.observaciones && (
                              <p className="text-sm text-gray-500 mt-1">{item.observaciones}</p>
                            )}
                          </div>
                          
                          {assignment && (
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Asignado a: {assignment.users?.nombre}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>Fecha: {new Date(assignment.fecha_asignacion).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
