
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Eye,
  FileText,
  MoreVertical,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProjectProgress } from '@/hooks/useProjectProgress';

interface Project {
  id: string;
  nombre: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  fecha_creacion: string;
  fecha_vencimiento?: string;
  observaciones?: string;
  excel_url?: string;
  requerimientos_pdf_url?: string;
  responsable_id?: string;
  item_count?: number;
  equipment_groups?: string[];
}

interface ProjectListProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

const ProjectCard = ({ 
  project, 
  onViewProject, 
  onEditProject, 
  onDeleteProject 
}: {
  project: Project;
  onViewProject: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}) => {
  const { data: progressData } = useProjectProgress(project.id);
  const progress = progressData?.progress || 0;
  const details = progressData?.details;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'en_proceso':
        return <Clock className="w-4 h-4" />;
      case 'cancelado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  const isOverdue = project.fecha_vencimiento && 
    new Date(project.fecha_vencimiento) < new Date() && 
    project.estado !== 'completado';

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {project.nombre}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(project.estado)} flex items-center space-x-1`}
              >
                {getStatusIcon(project.estado)}
                <span>{getStatusText(project.estado)}</span>
              </Badge>
              {progress > 0 && (
                <Badge variant="secondary">
                  {progress}% completado
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Vencido</span>
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProject(project)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalle
              </DropdownMenuItem>
              {onEditProject && (
                <DropdownMenuItem onClick={() => onEditProject(project)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDeleteProject && (
                <DropdownMenuItem 
                  onClick={() => onDeleteProject(project)}
                  className="text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Section */}
        {details && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progreso General</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{details.cotizados} de {details.total} ítems cotizados</span>
              <span>Completado</span>
            </div>
          </div>
        )}

        {/* Equipment Groups */}
        {project.equipment_groups && project.equipment_groups.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Equipos principales:</p>
            <div className="flex flex-wrap gap-1">
              {project.equipment_groups.slice(0, 3).map((group, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {group}
                </Badge>
              ))}
              {project.equipment_groups.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.equipment_groups.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Project Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Creado</span>
            </div>
            <p className="text-gray-900 font-medium">
              {format(new Date(project.fecha_creacion), 'd/M/yyyy', { locale: es })}
            </p>
          </div>

          {project.fecha_vencimiento && (
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Target className="w-4 h-4 mr-2" />
                <span>Vencimiento</span>
              </div>
              <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {format(new Date(project.fecha_vencimiento), 'd/M/yyyy', { locale: es })}
              </p>
            </div>
          )}
        </div>

        {/* Breakdown by Status */}
        {details && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Desglose por Estado</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Asignados</span>
                <span className="font-medium">{details.asignados}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Cotizados</span>
                <span className="font-medium">{details.cotizados}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Pendientes</span>
                <span className="font-medium">{details.pendientes}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button 
            onClick={() => onViewProject(project)}
            variant="outline" 
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Proyecto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProjectList = ({ 
  projects, 
  onViewProject, 
  onEditProject, 
  onDeleteProject 
}: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
        <p className="text-gray-600">Comienza creando tu primer proyecto.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewProject={onViewProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </div>
  );
};
