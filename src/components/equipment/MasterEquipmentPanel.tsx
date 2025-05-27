import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Trash2, Wrench, AlertTriangle, History } from 'lucide-react';
import { useMasterEquipment } from '@/hooks/useMasterEquipment';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReviewEquipmentPanel } from './ReviewEquipmentPanel';
import type { UserRole } from '@/types/database';

interface MasterEquipmentPanelProps {
  userRole: UserRole;
}

interface EquipmentFormData {
  codigo: string;
  nombre_equipo: string;
  grupo_generico: string;
  nombres_alternativos: string[];
  codigos_alternativos: string[];
  observaciones_inconsistencias?: string;
}

export const MasterEquipmentPanel = ({ userRole }: MasterEquipmentPanelProps) => {
  const { equipment, isLoading, error } = useMasterEquipment();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [formData, setFormData] = useState<EquipmentFormData>({
    codigo: '',
    nombre_equipo: '',
    grupo_generico: '',
    nombres_alternativos: [],
    codigos_alternativos: []
  });
  const [newAlternativeName, setNewAlternativeName] = useState('');
  const [newAlternativeCode, setNewAlternativeCode] = useState('');

  const canEdit = userRole === 'coordinador' || userRole === 'admin';

  // Count equipment needing review
  const equipmentNeedingReview = equipment.filter(eq => 
    eq.observaciones_inconsistencias && 
    eq.observaciones_inconsistencias.includes('REQUIERE REVISIÓN')
  ).length;

  const filteredEquipment = equipment.filter(item =>
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grupo_generico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nombres_alternativos && item.nombres_alternativos.some(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )) ||
    (item.codigos_alternativos && item.codigos_alternativos.some(code => 
      code.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para realizar esta acción",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        nombres_alternativos: formData.nombres_alternativos.length > 0 ? formData.nombres_alternativos : null,
        codigos_alternativos: formData.codigos_alternativos.length > 0 ? formData.codigos_alternativos : null
      };

      if (editingEquipment) {
        const { error } = await supabase
          .from('master_equipment')
          .update(dataToSubmit)
          .eq('id', editingEquipment.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Equipo actualizado correctamente"
        });
      } else {
        const { error } = await supabase
          .from('master_equipment')
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Equipo creado correctamente"
        });
      }

      setIsDialogOpen(false);
      setEditingEquipment(null);
      resetForm();
      
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar el equipo",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre_equipo: '',
      grupo_generico: '',
      nombres_alternativos: [],
      codigos_alternativos: []
    });
    setNewAlternativeName('');
    setNewAlternativeCode('');
  };

  const handleEdit = (equipment: any) => {
    if (!canEdit) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para editar equipos",
        variant: "destructive"
      });
      return;
    }

    setEditingEquipment(equipment);
    setFormData({
      codigo: equipment.codigo,
      nombre_equipo: equipment.nombre_equipo,
      grupo_generico: equipment.grupo_generico,
      nombres_alternativos: equipment.nombres_alternativos || [],
      codigos_alternativos: equipment.codigos_alternativos || [],
      observaciones_inconsistencias: equipment.observaciones_inconsistencias || ''
    });
    setIsDialogOpen(true);
  };

  const addAlternativeName = () => {
    if (newAlternativeName.trim() && !formData.nombres_alternativos.includes(newAlternativeName.trim())) {
      setFormData(prev => ({
        ...prev,
        nombres_alternativos: [...prev.nombres_alternativos, newAlternativeName.trim()]
      }));
      setNewAlternativeName('');
    }
  };

  const removeAlternativeName = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nombres_alternativos: prev.nombres_alternativos.filter((_, i) => i !== index)
    }));
  };

  const addAlternativeCode = () => {
    if (newAlternativeCode.trim() && !formData.codigos_alternativos.includes(newAlternativeCode.trim())) {
      setFormData(prev => ({
        ...prev,
        codigos_alternativos: [...prev.codigos_alternativos, newAlternativeCode.trim()]
      }));
      setNewAlternativeCode('');
    }
  };

  const removeAlternativeCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      codigos_alternativos: prev.codigos_alternativos.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para eliminar equipos",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('master_equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Equipo eliminado correctamente"
      });

      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el equipo",
        variant: "destructive"
      });
    }
  };

  const openCreateDialog = () => {
    if (!canEdit) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para crear equipos",
        variant: "destructive"
      });
      return;
    }

    setEditingEquipment(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando equipos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error al cargar los equipos: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wrench className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Equipment</h1>
            <p className="text-gray-500">Gestión del catálogo maestro de equipos</p>
          </div>
        </div>
        
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEquipment ? 'Editar Equipo' : 'Nuevo Equipo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grupo_generico">Grupo Genérico</Label>
                    <Input
                      id="grupo_generico"
                      value={formData.grupo_generico}
                      onChange={(e) => setFormData({ ...formData, grupo_generico: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nombre_equipo">Nombre del Equipo</Label>
                  <Input
                    id="nombre_equipo"
                    value={formData.nombre_equipo}
                    onChange={(e) => setFormData({ ...formData, nombre_equipo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Nombres Alternativos</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newAlternativeName}
                      onChange={(e) => setNewAlternativeName(e.target.value)}
                      placeholder="Agregar nombre alternativo"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternativeName())}
                    />
                    <Button type="button" onClick={addAlternativeName} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.nombres_alternativos.map((name, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {name}
                        <button
                          type="button"
                          onClick={() => removeAlternativeName(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Códigos Alternativos</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newAlternativeCode}
                      onChange={(e) => setNewAlternativeCode(e.target.value)}
                      placeholder="Agregar código alternativo"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternativeCode())}
                    />
                    <Button type="button" onClick={addAlternativeCode} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.codigos_alternativos.map((code, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {code}
                        <button
                          type="button"
                          onClick={() => removeAlternativeCode(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="observaciones_inconsistencias">Observaciones / Inconsistencias</Label>
                  <Textarea
                    id="observaciones_inconsistencias"
                    value={formData.observaciones_inconsistencias || ''}
                    onChange={(e) => setFormData({ ...formData, observaciones_inconsistencias: e.target.value })}
                    placeholder="Notas sobre inconsistencias o variaciones encontradas..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEquipment ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Catálogo ({filteredEquipment.length})
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Revisión {equipmentNeedingReview > 0 && (
              <Badge variant="destructive" className="ml-1">
                {equipmentNeedingReview}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipos Registrados</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar equipos, nombres alternativos, códigos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Badge variant="secondary">
                    {filteredEquipment.length} equipos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre del Equipo</TableHead>
                      <TableHead>Grupo Genérico</TableHead>
                      <TableHead>Alternativos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      {canEdit && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.codigo}</TableCell>
                        <TableCell>{item.nombre_equipo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.grupo_generico}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.nombres_alternativos && item.nombres_alternativos.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.nombres_alternativos.slice(0, 2).map((name, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {name}
                                  </Badge>
                                ))}
                                {item.nombres_alternativos.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{item.nombres_alternativos.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {item.codigos_alternativos && item.codigos_alternativos.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.codigos_alternativos.slice(0, 2).map((code, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {code}
                                  </Badge>
                                ))}
                                {item.codigos_alternativos.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.codigos_alternativos.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.observaciones_inconsistencias && item.observaciones_inconsistencias.includes('REQUIERE REVISIÓN') ? (
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                              <span className="text-xs text-amber-600">Requiere revisión</span>
                            </div>
                          ) : item.observaciones_inconsistencias && item.observaciones_inconsistencias.includes('REVISADO') ? (
                            <div className="flex items-center">
                              <History className="w-4 h-4 text-blue-500 mr-1" />
                              <span className="text-xs text-blue-600">Revisado</span>
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        {canEdit && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredEquipment.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron equipos con los criterios de búsqueda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <ReviewEquipmentPanel userRole={userRole} />
        </TabsContent>
      </Tabs>

      {!canEdit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-amber-800">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <p className="text-sm">
                Solo los usuarios con rol de Coordinador o Administrador pueden editar el Master Equipment
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
