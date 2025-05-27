
import { useState } from "react";
import { useProjectsData } from "@/hooks/useProjectsData";
import { ProjectDetailWithFilters } from "./ProjectDetailWithFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { 
  Plus, 
  Calendar, 
  User, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface ProjectListProps {
  onNewProject: () => void;
}

const statusLabels = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const statusIcons = {
  pendiente: Clock,
  en_proceso: AlertCircle,
  completado: CheckCircle,
  cancelado: XCircle,
};

const statusColors = {
  pendiente: "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
  completado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export const ProjectList = ({ onNewProject }: ProjectListProps) => {
  const { projects, isLoading, error } = useProjectsData();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Helper function to calculate project progress
  const calculateProgress = (projectItems: any[] = []) => {
    if (!projectItems || projectItems.length === 0) return 0;
    
    const completedItems = projectItems.filter(item => 
      item.estado === 'cotizado' || item.estado === 'completado'
    ).length;
    
    return Math.round((completedItems / projectItems.length) * 100);
  };

  // Si hay un proyecto seleccionado, mostrar la vista detallada con filtros
  if (selectedProjectId) {
    return (
      <ProjectDetailWithFilters 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <Button onClick={onNewProject}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <Button onClick={onNewProject}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error al cargar los proyectos</p>
          <p className="text-sm text-gray-500 mt-1">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay proyectos todavía
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer proyecto para gestionar cotizaciones
            </p>
            <Button onClick={onNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => {
            const StatusIcon = statusIcons[project.estado || 'pendiente'];
            const itemCount = project.project_items?.length || 0;
            const progress = calculateProgress(project.project_items);
            
            return (
              <Card 
                key={project.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{project.nombre}</CardTitle>
                      {project.observaciones && (
                        <p className="text-sm text-gray-600">
                          {project.observaciones}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <CircularProgress 
                        progress={progress} 
                        size={50} 
                        strokeWidth={3}
                        className="flex-shrink-0"
                      />
                      <Badge className={statusColors[project.estado || 'pendiente']}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusLabels[project.estado || 'pendiente']}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Creado</p>
                        <p className="font-medium">
                          {new Date(project.fecha_creacion || project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {project.fecha_vencimiento && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500">Vencimiento</p>
                          <p className="font-medium">
                            {new Date(project.fecha_vencimiento).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Progreso</p>
                        <p className="font-medium">{progress}% completado</p>
                      </div>
                    </div>
                  </div>

                  {itemCount > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Equipos principales:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.project_items?.slice(0, 3).map((item) => (
                          <Badge key={item.id} variant="secondary" className="text-xs">
                            {item.master_equipment?.codigo} - {item.cantidad}x
                          </Badge>
                        ))}
                        {itemCount > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{itemCount - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
