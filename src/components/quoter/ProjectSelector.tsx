
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FolderOpen, Calendar, User } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useItemAssignments } from '@/hooks/useItemAssignments';
import { useAuth } from '@/hooks/useAuth';

interface ProjectSelectorProps {
  onProjectSelect: (project: any, item: any) => void;
}

export const ProjectSelector = ({ onProjectSelect }: ProjectSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const { projects, isLoading: loadingProjects } = useProjects();
  const { assignments, isLoading: loadingAssignments } = useItemAssignments();
  const { user } = useAuth();

  // Filtrar asignaciones del usuario actual
  const userAssignments = assignments.filter(assignment => 
    assignment.cotizador_id === user?.id
  );

  // Obtener proyectos únicos de las asignaciones del usuario
  const userProjects = projects.filter(project => 
    userAssignments.some(assignment => 
      assignment.project_items?.proyecto_id === project.id
    )
  ).filter(project =>
    project.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener ítems asignados para el proyecto seleccionado
  const assignedItems = userAssignments
    .filter(assignment => assignment.project_items?.proyecto_id === selectedProjectId)
    .map(assignment => assignment.project_items)
    .filter(Boolean);

  if (loadingProjects || loadingAssignments) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando proyectos asignados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedProjectId ? (
        <>
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5" />
                <span>Proyectos con Ítems Asignados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {userProjects.map((project) => {
                    const projectAssignments = userAssignments.filter(a => 
                      a.project_items?.proyecto_id === project.id
                    );
                    const pendingCount = projectAssignments.filter(a => a.estado === 'pendiente').length;
                    
                    return (
                      <div
                        key={project.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{project.nombre}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{projectAssignments.length} ítems</Badge>
                            {pendingCount > 0 && (
                              <Badge variant="secondary">{pendingCount} pendientes</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(project.fecha_creacion).toLocaleDateString()}</span>
                          </div>
                          {project.responsable && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{project.responsable.nombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {userProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No tienes ítems asignados en ningún proyecto</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Item Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ítems Asignados para Cotizar</span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProjectId('')}
                >
                  Cambiar Proyecto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {assignedItems.map((item) => {
                  const assignment = userAssignments.find(a => a.item_id === item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        const selectedProject = projects.find(p => p.id === selectedProjectId);
                        onProjectSelect(selectedProject, item);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{item.numero_item}</Badge>
                          <h4 className="font-medium text-gray-900">
                            {item.master_equipment?.nombre_equipo}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Cantidad: {item.cantidad}</Badge>
                          <Badge variant={
                            assignment?.estado === 'pendiente' ? 'outline' :
                            assignment?.estado === 'en_proceso' ? 'default' :
                            'secondary'
                          }>
                            {assignment?.estado || 'pendiente'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Código: {item.master_equipment?.codigo}</p>
                        <p>Grupo: {item.master_equipment?.grupo_generico}</p>
                        {item.observaciones && (
                          <p className="mt-1">Observaciones: {item.observaciones}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {assignedItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay ítems asignados para cotizar en este proyecto</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
