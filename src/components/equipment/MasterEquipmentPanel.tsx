
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Wrench } from 'lucide-react';
import { useMasterEquipment } from '@/hooks/useMasterEquipment';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/database';

interface MasterEquipmentPanelProps {
  userRole: UserRole;
}

interface EquipmentFormData {
  codigo: string;
  nombre_equipo: string;
  grupo_generico: string;
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
    grupo_generico: ''
  });

  const canEdit = userRole === 'coordinador' || userRole === 'admin';

  const filteredEquipment = equipment.filter(item =>
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grupo_generico.toLowerCase().includes(searchTerm.toLowerCase())
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
      if (editingEquipment) {
        const { error } = await supabase
          .from('master_equipment')
          .update(formData)
          .eq('id', editingEquipment.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Equipo actualizado correctamente"
        });
      } else {
        const { error } = await supabase
          .from('master_equipment')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Equipo creado correctamente"
        });
      }

      setIsDialogOpen(false);
      setEditingEquipment(null);
      setFormData({ codigo: '', nombre_equipo: '', grupo_generico: '' });
      
      // Refetch data
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
      grupo_generico: equipment.grupo_generico
    });
    setIsDialogOpen(true);
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

      // Refetch data
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
    setFormData({ codigo: '', nombre_equipo: '', grupo_generico: '' });
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEquipment ? 'Editar Equipo' : 'Nuevo Equipo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="nombre_equipo">Nombre del Equipo</Label>
                  <Input
                    id="nombre_equipo"
                    value={formData.nombre_equipo}
                    onChange={(e) => setFormData({ ...formData, nombre_equipo: e.target.value })}
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Equipos Registrados</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
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
