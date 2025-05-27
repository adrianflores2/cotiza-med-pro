
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Package, Info } from 'lucide-react';

interface EquipmentDisplayProps {
  project: any;
  item: any;
  onContinue: () => void;
  onBack: () => void;
}

export const EquipmentDisplay = ({ project, item, onContinue, onBack }: EquipmentDisplayProps) => {
  const equipment = item?.master_equipment;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Información del Equipo</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Project and Item Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Proyecto</h4>
              <Badge variant="outline">{project?.nombre}</Badge>
            </div>
            <div className="text-sm text-blue-700">
              <p>Estado: {project?.estado}</p>
              <p>Fecha de creación: {new Date(project?.fecha_creacion).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Equipment Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-gray-900">Ítem #</Label>
                <p className="text-lg font-semibold text-blue-600">#{item?.numero_item}</p>
              </div>
              
              <div>
                <Label className="font-medium text-gray-900">Nombre del Equipo</Label>
                <p className="text-lg">{equipment?.nombre_equipo}</p>
              </div>
              
              <div>
                <Label className="font-medium text-gray-900">Código</Label>
                <p className="font-mono text-gray-700">{equipment?.codigo}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-medium text-gray-900">Cantidad Requerida</Label>
                <p className="text-lg font-semibold text-green-600">{item?.cantidad} unidades</p>
              </div>
              
              <div>
                <Label className="font-medium text-gray-900">Grupo Genérico</Label>
                <p>{equipment?.grupo_generico}</p>
              </div>
              
              <div>
                <Label className="font-medium text-gray-900">Estado del Ítem</Label>
                <Badge variant={
                  item?.estado === 'asignado' ? 'default' :
                  item?.estado === 'pendiente' ? 'outline' :
                  'secondary'
                }>
                  {item?.estado}
                </Badge>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(equipment?.nombres_alternativos?.length > 0 || item?.observaciones) && (
            <div className="space-y-4">
              {equipment?.nombres_alternativos?.length > 0 && (
                <div>
                  <Label className="font-medium text-gray-900">Nombres Alternativos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {equipment.nombres_alternativos.map((nombre: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {item?.observaciones && (
                <div>
                  <Label className="font-medium text-gray-900">Observaciones del Ítem</Label>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">{item.observaciones}</p>
                    </div>
                  </div>
                </div>
              )}

              {item?.requiere_accesorios && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">
                      Este ítem requiere accesorios especiales
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cambiar Proyecto/Ítem
            </Button>
            <Button onClick={onContinue}>
              Continuar a Proveedores
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for labels
const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
    {children}
  </label>
);
