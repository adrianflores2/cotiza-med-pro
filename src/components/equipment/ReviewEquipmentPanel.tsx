
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Edit, Eye } from 'lucide-react';
import { useMasterEquipment } from '@/hooks/useMasterEquipment';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/database';

interface ReviewEquipmentPanelProps {
  userRole: UserRole;
}

export const ReviewEquipmentPanel = ({ userRole }: ReviewEquipmentPanelProps) => {
  const { equipment, isLoading } = useMasterEquipment();
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const canResolve = userRole === 'coordinador' || userRole === 'admin';

  // Filter equipment that needs review
  const equipmentNeedingReview = equipment.filter(eq => 
    eq.observaciones_inconsistencias && 
    eq.observaciones_inconsistencias.includes('REQUIERE REVISIÓN')
  );

  const handleResolveReview = async (equipmentId: string, notes: string) => {
    if (!canResolve) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para resolver revisiones",
        variant: "destructive"
      });
      return;
    }

    setIsResolving(true);
    try {
      const { error } = await supabase
        .from('master_equipment')
        .update({
          observaciones_inconsistencias: `REVISADO: ${notes}. Original: ${selectedEquipment?.observaciones_inconsistencias || ''}`
        })
        .eq('id', equipmentId);

      if (error) throw error;

      toast({
        title: "Revisión completada",
        description: "El equipo ha sido marcado como revisado",
      });

      setSelectedEquipment(null);
      setResolutionNotes('');
      window.location.reload();
    } catch (error: any) {
      console.error('Error resolving review:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la revisión",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleMarkAsValid = async (equipmentId: string) => {
    if (!canResolve) return;

    setIsResolving(true);
    try {
      const { error } = await supabase
        .from('master_equipment')
        .update({
          observaciones_inconsistencias: null
        })
        .eq('id', equipmentId);

      if (error) throw error;

      toast({
        title: "Equipo validado",
        description: "El equipo ha sido marcado como válido",
      });

      window.location.reload();
    } catch (error: any) {
      console.error('Error validating equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo validar el equipo",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const parseReviewNotes = (observaciones: string) => {
    const parts = observaciones.split('Sugerencias:');
    const issues = parts[0].replace('REQUIERE REVISIÓN:', '').trim();
    const suggestions = parts[1]?.trim() || '';
    
    return { issues, suggestions };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando equipos para revisión...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revisión de Equipos</h1>
            <p className="text-gray-500">Equipos que requieren validación manual</p>
          </div>
        </div>
        <Badge variant={equipmentNeedingReview.length > 0 ? "destructive" : "default"}>
          {equipmentNeedingReview.length} equipos pendientes
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Equipos que Requieren Revisión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {equipmentNeedingReview.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No hay equipos pendientes de revisión</p>
              <p className="text-sm text-gray-400 mt-2">Todos los equipos han sido validados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre del Equipo</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentNeedingReview.map((item) => {
                    const { issues, suggestions } = parseReviewNotes(item.observaciones_inconsistencias || '');
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.codigo}</TableCell>
                        <TableCell>{item.nombre_equipo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.grupo_generico}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Requiere Revisión
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEquipment(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canResolve && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsValid(item.id)}
                                  disabled={isResolving}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEquipment(item);
                                    setResolutionNotes('');
                                  }}
                                  disabled={isResolving}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Equipo: {selectedEquipment?.codigo}</DialogTitle>
          </DialogHeader>
          
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código</Label>
                  <p className="font-medium">{selectedEquipment.codigo}</p>
                </div>
                <div>
                  <Label>Grupo Genérico</Label>
                  <p className="font-medium">{selectedEquipment.grupo_generico}</p>
                </div>
              </div>
              
              <div>
                <Label>Nombre del Equipo</Label>
                <p className="font-medium">{selectedEquipment.nombre_equipo}</p>
              </div>

              {selectedEquipment.observaciones_inconsistencias && (
                <div className="space-y-2">
                  <Label>Problemas Detectados</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    {(() => {
                      const { issues, suggestions } = parseReviewNotes(selectedEquipment.observaciones_inconsistencias);
                      return (
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-red-800">Problemas:</p>
                            <p className="text-sm text-red-700">{issues}</p>
                          </div>
                          {suggestions && (
                            <div>
                              <p className="font-medium text-red-800">Sugerencias:</p>
                              <p className="text-sm text-red-700">{suggestions}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {canResolve && (
                <div className="space-y-3">
                  <Label htmlFor="resolution-notes">Notas de Resolución</Label>
                  <Textarea
                    id="resolution-notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe cómo se resolvió el problema o por qué el equipo es válido..."
                    rows={3}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedEquipment(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleMarkAsValid(selectedEquipment.id)}
                      disabled={isResolving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Válido
                    </Button>
                    <Button
                      onClick={() => handleResolveReview(selectedEquipment.id, resolutionNotes)}
                      disabled={isResolving || !resolutionNotes.trim()}
                    >
                      {isResolving ? 'Resolviendo...' : 'Resolver con Notas'}
                    </Button>
                  </div>
                </div>
              )}

              {!canResolve && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-800">
                    Solo los usuarios con rol de Coordinador o Administrador pueden resolver revisiones de equipos.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {!canResolve && equipmentNeedingReview.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-amber-800">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <p className="text-sm">
                Solo los usuarios con rol de Coordinador o Administrador pueden resolver revisiones de equipos
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
