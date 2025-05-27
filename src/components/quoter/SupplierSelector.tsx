import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  DollarSign,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { useEquipmentSuppliers } from '@/hooks/useEquipmentSuppliers';
import { useSuppliers } from '@/hooks/useSuppliers';

interface SupplierSelectorProps {
  equipmentId?: string;
  onSupplierSelect: (supplier: any) => void;
  onBack: () => void;
}

export const SupplierSelector = ({ equipmentId, onSupplierSelect, onBack }: SupplierSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  
  const { suppliers: equipmentSuppliers, isLoading: loadingEquipmentSuppliers } = useEquipmentSuppliers(equipmentId);
  const { suppliers: allSuppliers, isLoading: loadingAllSuppliers } = useSuppliers();

  // Get historical suppliers (those with equipment data)
  const historicalSuppliers = equipmentSuppliers?.map(es => ({
    ...es.suppliers,
    hasHistoricalData: true,
    equipmentData: {
      marca: es.marca,
      modelo: es.modelo,
      precio_unitario: es.precio_unitario,
      moneda: es.moneda,
      procedencia: es.procedencia,
      fecha_ultima_actualizacion: es.fecha_ultima_actualizacion
    }
  })) || [];

  // Get other suppliers (without equipment data for this equipment)
  const otherSuppliers = allSuppliers?.filter(supplier => 
    !historicalSuppliers.some(hs => hs.id === supplier.id)
  ).map(supplier => ({
    ...supplier,
    hasHistoricalData: false
  })) || [];

  const allCombinedSuppliers = [...historicalSuppliers, ...otherSuppliers];

  const filteredSuppliers = allCombinedSuppliers.filter(supplier =>
    supplier.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.ruc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingEquipmentSuppliers || loadingAllSuppliers) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando proveedores...</p>
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
              <Building2 className="w-5 h-5" />
              <span>Seleccionar Proveedor</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowNewSupplierForm(!showNewSupplierForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por razón social o RUC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Historical Suppliers Section */}
            {historicalSuppliers.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  Proveedores con Datos Históricos
                </h4>
                <div className="space-y-3">
                  {historicalSuppliers
                    .filter(supplier =>
                      supplier.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      supplier.ruc?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-4 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                      onClick={() => onSupplierSelect(supplier)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{supplier.razon_social}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Datos Históricos
                          </Badge>
                          {supplier.pais?.toLowerCase().includes('per') && (
                            <Badge variant="outline">
                              <MapPin className="w-3 h-3 mr-1" />
                              Nacional
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>RUC:</strong> {supplier.ruc || 'No disponible'}</p>
                          <p><strong>País:</strong> {supplier.pais || 'No especificado'}</p>
                        </div>
                        <div>
                          {supplier.equipmentData && (
                            <>
                              <p><strong>Última oferta:</strong> {supplier.equipmentData.marca} - {supplier.equipmentData.modelo}</p>
                              <p><strong>Precio:</strong> {supplier.equipmentData.moneda} {supplier.equipmentData.precio_unitario?.toLocaleString()}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {(supplier.email_contacto || supplier.telefono_contacto) && (
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {supplier.email_contacto && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{supplier.email_contacto}</span>
                            </div>
                          )}
                          {supplier.telefono_contacto && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{supplier.telefono_contacto}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Suppliers Section */}
            {otherSuppliers.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-600" />
                  Otros Proveedores
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {otherSuppliers
                    .filter(supplier =>
                      supplier.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      supplier.ruc?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSupplierSelect(supplier)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{supplier.razon_social}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-orange-700 border-orange-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sin historial
                          </Badge>
                          {supplier.pais?.toLowerCase().includes('per') && (
                            <Badge variant="outline">
                              <MapPin className="w-3 h-3 mr-1" />
                              Nacional
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>RUC:</strong> {supplier.ruc || 'No disponible'}</p>
                          <p><strong>País:</strong> {supplier.pais || 'No especificado'}</p>
                        </div>
                        <div>
                          <p><strong>Contacto:</strong> {supplier.nombre_contacto} {supplier.apellido_contacto}</p>
                        </div>
                      </div>
                      
                      {(supplier.email_contacto || supplier.telefono_contacto) && (
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {supplier.email_contacto && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{supplier.email_contacto}</span>
                            </div>
                          )}
                          {supplier.telefono_contacto && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{supplier.telefono_contacto}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron proveedores</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowNewSupplierForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Nuevo Proveedor
                </Button>
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

      {/* New Supplier Form */}
      {showNewSupplierForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Nuevo Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidad de nuevo proveedor en desarrollo</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowNewSupplierForm(false)}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
