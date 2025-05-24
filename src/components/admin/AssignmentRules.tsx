
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssignmentRules } from "@/hooks/useAssignmentRules";
import { useUsers } from "@/hooks/useUsers";
import type { AssignmentRule } from "@/types/database";

export const AssignmentRules = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    patron_codigo: "",
    patron_nombre: "",
    grupo_generico: "",
    cotizador_id: "",
    prioridad: 0,
  });

  const { toast } = useToast();
  const { rules, isLoading, createRule, updateRule, deleteRule } = useAssignmentRules();
  const { users } = useUsers();

  const quoters = users.filter(user => user.roles?.includes('cotizador'));

  const resetForm = () => {
    setFormData({
      nombre: "",
      patron_codigo: "",
      patron_nombre: "",
      grupo_generico: "",
      cotizador_id: "",
      prioridad: 0,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.cotizador_id) {
      toast({
        title: "Error",
        description: "Nombre y cotizador son requeridos",
        variant: "destructive",
      });
      return;
    }

    const ruleData = {
      ...formData,
      nombre: formData.nombre.trim(),
      patron_codigo: formData.patron_codigo.trim() || undefined,
      patron_nombre: formData.patron_nombre.trim() || undefined,
      grupo_generico: formData.grupo_generico.trim() || undefined,
      activo: true,
    };

    if (editingId) {
      updateRule({ id: editingId, ...ruleData });
    } else {
      createRule(ruleData);
    }
    
    resetForm();
  };

  const handleEdit = (rule: AssignmentRule) => {
    setFormData({
      nombre: rule.nombre,
      patron_codigo: rule.patron_codigo || "",
      patron_nombre: rule.patron_nombre || "",
      grupo_generico: rule.grupo_generico || "",
      cotizador_id: rule.cotizador_id,
      prioridad: rule.prioridad,
    });
    setEditingId(rule.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
      deleteRule(id);
    }
  };

  const getQuoterName = (quoterId: string) => {
    return users.find(u => u.id === quoterId)?.nombre || 'Desconocido';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando reglas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reglas de Asignación Automática
          </h3>
          <p className="text-gray-600">
            Define reglas para asignar automáticamente cotizadores a equipos
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Regla
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Regla' : 'Nueva Regla de Asignación'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Regla *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Equipos cardiovasculares"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cotizador">Cotizador Asignado *</Label>
                  <Select
                    value={formData.cotizador_id}
                    onValueChange={(value) => setFormData({ ...formData, cotizador_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cotizador" />
                    </SelectTrigger>
                    <SelectContent>
                      {quoters.map(quoter => (
                        <SelectItem key={quoter.id} value={quoter.id}>
                          {quoter.nombre} ({quoter.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="patron_codigo">Patrón de Código (Regex)</Label>
                  <Input
                    id="patron_codigo"
                    value={formData.patron_codigo}
                    onChange={(e) => setFormData({ ...formData, patron_codigo: e.target.value })}
                    placeholder="Ej: ^CV.*|^CARD.*"
                  />
                </div>

                <div>
                  <Label htmlFor="patron_nombre">Patrón de Nombre (Regex)</Label>
                  <Input
                    id="patron_nombre"
                    value={formData.patron_nombre}
                    onChange={(e) => setFormData({ ...formData, patron_nombre: e.target.value })}
                    placeholder="Ej: .*cardiovascular.*|.*cardiología.*"
                  />
                </div>

                <div>
                  <Label htmlFor="grupo_generico">Grupo Genérico</Label>
                  <Input
                    id="grupo_generico"
                    value={formData.grupo_generico}
                    onChange={(e) => setFormData({ ...formData, grupo_generico: e.target.value })}
                    placeholder="Ej: Equipos Médicos"
                  />
                </div>

                <div>
                  <Label htmlFor="prioridad">Prioridad (0-100)</Label>
                  <Input
                    id="prioridad"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Actualizar' : 'Crear'} Regla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reglas Activas ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cotizador</TableHead>
                  <TableHead>Patrón Código</TableHead>
                  <TableHead>Patrón Nombre</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getQuoterName(rule.cotizador_id)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.patron_codigo || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.patron_nombre || '-'}
                    </TableCell>
                    <TableCell>{rule.grupo_generico || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.prioridad}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {rules.length === 0 && (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reglas</h3>
              <p className="text-gray-600">
                Crea reglas para asignar automáticamente cotizadores a equipos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
