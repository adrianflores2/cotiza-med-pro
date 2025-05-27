
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FolderOpen, Calendar, User } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectDetail } from '@/hooks/useProjectDetail';

interface ProjectSelectorProps {
  onProjectSelect: (project: any, item: any) => void;
}

export const ProjectSelector = ({ onProjectSelect }: ProjectSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const { projects, isLoading: loadingProjects } = useProjects();
  const { projectItems, isLoading: loadingItems } = useProjectDetail(selectedProjectId);

  const filteredProjects = projects.filter(project =>
    project.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingProjects) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando proyectos...</p>
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
                <span>Seleccionar Proyecto</span>
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
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{project.nombre}</h4>
                        <Badge variant={
                          project.estado === 'completado' ? 'default' :
                          project.estado === 'en_proceso' ? 'secondary' :
                          'outline'
                        }>
                          {project.estado}
                        </Badge>
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
                  ))}
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No se encontraron proyectos</p>
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
                <span>Seleccionar Ítem</span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProjectId('')}
                >
                  Cambiar Proyecto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingItems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando ítems...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {projectItems
                    ?.filter(item => item.estado !== 'completado')
                    ?.map((item) => (
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
                            item.estado === 'asignado' ? 'default' :
                            item.estado === 'pendiente' ? 'outline' :
                            'secondary'
                          }>
                            {item.estado}
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
                  ))}
                  
                  {!projectItems?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay ítems disponibles para cotizar en este proyecto</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
