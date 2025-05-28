
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupplierEquipmentOption {
  id: string;
  marca: string;
  modelo: string;
  precio_unitario: number;
  moneda: string;
  procedencia: string;
  supplier: {
    razon_social: string;
  };
  fecha_ultima_actualizacion: string;
}

interface EquipmentModelSelectorProps {
  project: any;
  item: any;
  onModelSelect: (marca: string, modelo: string) => void;
  onNewModel: (marca: string, modelo: string) => void;
  onBack: () => void;
}

export const EquipmentModelSelector = ({ 
  project, 
  item, 
  onModelSelect, 
  onNewModel, 
  onBack 
}: EquipmentModelSelectorProps) => {
  const [supplierEquipments, setSupplierEquipments] = useState<SupplierEquipmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModelForm, setShowNewModelForm] = useState(false);
  const [newMarca, setNewMarca] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSupplierEquipments();
  }, [item]);

  const fetchSupplierEquipments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching supplier equipments for equipment:', item?.equipment_id);

      // Buscar equipos en el panel de proveedores basados en el equipment_id
      const { data, error } = await supabase
        .from('supplier_equipments')
        .select(`
          id,
          marca,
          modelo,
          precio_unitario,
          moneda,
          procedencia,
          fecha_ultima_actualizacion,
          suppliers!inner(razon_social)
        `)
        .eq('equipment_id', item?.equipment_id)
        .eq('activo', true)
        .not('marca', 'is', null)
        .not('modelo', 'is', null)
        .order('fecha_ultima_actualizacion', { ascending: false });

      if (error) {
        console.error('Error fetching supplier equipments:', error);
        throw error;
      }

      console.log('Supplier equipments found:', data?.length || 0);

      // Transformar los datos para el componente
      const transformedData = data?.map(equipment => ({
        id: equipment.id,
        marca: equipment.marca,
        modelo: equipment.modelo,
        precio_unitario: equipment.precio_unitario || 0,
        moneda: equipment.moneda || 'USD',
        procedencia: equipment.procedencia || '',
        supplier: {
          razon_social: equipment.suppliers.razon_social
        },
        fecha_ultima_actualizacion: equipment.fecha_ultima_actualizacion || ''
      })) || [];

      // Agrupar por marca y modelo únicos para evitar duplicados
      const uniqueModels = new Map();
      transformedData.forEach(equipment => {
        const key = `${equipment.marca}-${equipment.modelo}`;
        if (!uniqueModels.has(key)) {
          uniqueModels.set(key, equipment);
        }
      });

      setSupplierEquipments(Array.from(uniqueModels.values()));
      console.log('Unique supplier equipment models loaded:', uniqueModels.size);
    } catch (error) {
      console.error('Error loading supplier equipments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos del panel de proveedores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMarca.trim() && newModelo.trim()) {
      onNewModel(newMarca.trim(), newModelo.trim());
    }
  };

  const filteredEquipments = supplierEquipments.filter(equipment =>
    equipment.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.supplier.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.procedencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando opciones del panel de proveedores...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Seleccionar Marca y Modelo</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{project?.nombre}</Badge>
              <Badge variant="secondary">Ítem #{item?.numero_item}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Equipment Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{item?.master_equipment?.nombre_equipo}</h4>
              <div className="text-sm text-gray-600">
                <p>Código: {item?.master_equipment?.codigo}</p>
                <p>Grupo: {item?.master_equipment?.grupo_generico}</p>
                <p>Cantidad requerida: {item?.cantidad} unidades</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por marca, modelo, proveedor o procedencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Supplier Equipment Options */}
            {filteredEquipments.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Opciones Disponibles en Panel de Proveedores</h5>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredEquipments.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onModelSelect(equipment.marca, equipment.modelo)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {equipment.marca} - {equipment.modelo}
                        </div>
                        <div className="text-sm text-gray-600">
                          {equipment.precio_unitario} {equipment.moneda}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Proveedor: {equipment.supplier.razon_social}</p>
                        {equipment.procedencia && <p>Procedencia: {equipment.procedencia}</p>}
                        {equipment.fecha_ultima_actualizacion && (
                          <p>Última actualización: {new Date(equipment.fecha_ultima_actualizacion).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message when no data found */}
            {filteredEquipments.length === 0 && !showNewModelForm && (
              <div className="text-center py-6 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No se encontraron equipos en el panel de proveedores</p>
                <p className="text-sm">Código: {item?.master_equipment?.codigo}</p>
                <p className="text-sm text-gray-400 mt-1">Agrega equipos al panel de proveedores o crea una nueva marca/modelo</p>
              </div>
            )}

            {/* New Model Form */}
            {!showNewModelForm ? (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowNewModelForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cotizar Nueva Marca/Modelo
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <h5 className="font-medium text-gray-900 mb-3">Nueva Marca y Modelo</h5>
                <form onSubmit={handleNewModelSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={newMarca}
                      onChange={(e) => setNewMarca(e.target.value)}
                      placeholder="Ingrese la marca"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={newModelo}
                      onChange={(e) => setNewModelo(e.target.value)}
                      placeholder="Ingrese el modelo"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      Continuar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewModelForm(false);
                        setNewMarca('');
                        setNewModelo('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="flex justify-start pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
