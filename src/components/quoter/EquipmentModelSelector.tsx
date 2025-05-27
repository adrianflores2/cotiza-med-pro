
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HistoricalQuotation {
  id: string;
  marca: string;
  modelo: string;
  precio_unitario: number;
  moneda: string;
  fecha_cotizacion: string;
  proveedor: {
    razon_social: string;
  };
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
  const [historicalQuotations, setHistoricalQuotations] = useState<HistoricalQuotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModelForm, setShowNewModelForm] = useState(false);
  const [newMarca, setNewMarca] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchHistoricalQuotations();
  }, [item.equipment_id]);

  const fetchHistoricalQuotations = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching historical quotations for equipment:', item.equipment_id);

      const { data, error } = await supabase
        .from('quotations')
        .select(`
          id,
          marca,
          modelo,
          precio_unitario,
          moneda,
          fecha_cotizacion,
          suppliers!inner(razon_social)
        `)
        .eq('item_id', item.id)
        .not('marca', 'is', null)
        .not('modelo', 'is', null)
        .order('fecha_cotizacion', { ascending: false });

      if (error) {
        console.error('Error fetching historical quotations:', error);
        throw error;
      }

      // Agrupar por marca y modelo únicos
      const uniqueModels = new Map();
      data?.forEach(quotation => {
        const key = `${quotation.marca}-${quotation.modelo}`;
        if (!uniqueModels.has(key)) {
          uniqueModels.set(key, {
            ...quotation,
            proveedor: quotation.suppliers
          });
        }
      });

      setHistoricalQuotations(Array.from(uniqueModels.values()));
      console.log('Historical quotations loaded:', uniqueModels.size);
    } catch (error) {
      console.error('Error loading historical quotations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones históricas",
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

  const filteredQuotations = historicalQuotations.filter(q =>
    q.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.proveedor.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando opciones históricas...</p>
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
              <h4 className="font-medium text-gray-900 mb-2">{item.master_equipment?.nombre_equipo}</h4>
              <div className="text-sm text-gray-600">
                <p>Código: {item.master_equipment?.codigo}</p>
                <p>Grupo: {item.master_equipment?.grupo_generico}</p>
                <p>Cantidad requerida: {item.cantidad} unidades</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por marca, modelo o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Historical Options */}
            {filteredQuotations.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Opciones Históricas</h5>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredQuotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onModelSelect(quotation.marca, quotation.modelo)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {quotation.marca} - {quotation.modelo}
                        </div>
                        <div className="text-sm text-gray-600">
                          {quotation.precio_unitario} {quotation.moneda}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Proveedor: {quotation.proveedor.razon_social}</p>
                        <p>Última cotización: {new Date(quotation.fecha_cotizacion).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
