
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
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

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export const ProjectDetailView = ({ 
  project, 
  onBack, 
  onEdit, 
  onDelete 
}: ProjectDetailViewProps) => {
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
        return <CheckCircle2 className="w-5 h-5" />;
      case 'en_proceso':
        return <Clock className="w-5 h-5" />;
      case 'cancelado':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Proyectos
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.nombre}</h1>
            <p className="text-gray-600">Detalle del proyecto</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(project)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" onClick={() => onDelete(project)} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Project Status and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Estado del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(project.estado)} flex items-center space-x-2 text-sm px-3 py-1`}
              >
                {getStatusIcon(project.estado)}
                <span>{getStatusText(project.estado)}</span>
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Vencido</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Progreso General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{progress}%</span>
                <span className="text-sm text-gray-500">Completado</span>
              </div>
              <Progress value={progress} className="h-2" />
              {details && (
                <p className="text-sm text-gray-600">
                  {details.cotizados} de {details.total} ítems cotizados
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Fechas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Creado:</span>
              <span className="font-medium">
                {format(new Date(project.fecha_creacion), 'd/M/yyyy', { locale: es })}
              </span>
            </div>
            {project.fecha_vencimiento && (
              <div className="flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Vence:</span>
                <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {format(new Date(project.fecha_vencimiento), 'd/M/yyyy', { locale: es })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Breakdown */}
      {details && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{details.asignados}</div>
                <div className="text-sm text-blue-700">Ítems Asignados</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{details.cotizados}</div>
                <div className="text-sm text-green-700">Ítems Cotizados</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{details.pendientes}</div>
                <div className="text-sm text-yellow-700">Ítems Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Groups */}
      {project.equipment_groups && project.equipment_groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipos Principales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.equipment_groups.map((group, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {group}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Files */}
      <Card>
        <CardHeader>
          <CardTitle>Archivos del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.excel_url && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Lista de Equipos (Excel)</p>
                  <p className="text-sm text-gray-600">Archivo con la lista completa de equipos</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          )}
          
          {project.requerimientos_pdf_url && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">Requerimientos (PDF)</p>
                  <p className="text-sm text-gray-600">Documento con los requerimientos del proyecto</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          )}
          
          {!project.excel_url && !project.requerimientos_pdf_url && (
            <p className="text-gray-500 text-center py-4">No hay archivos adjuntos</p>
          )}
        </CardContent>
      </Card>

      {/* Observations */}
      {project.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{project.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
