
import { useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSupplierEquipments } from "@/hooks/useSupplierEquipments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Building, 
  Package,
  DollarSign,
  Calendar,
  ArrowLeft,
  Edit,
  History
} from "lucide-react";

export const SupplierManagement = () => {
  const { suppliers, isLoading } = useSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  
  const { 
    equipments, 
    isLoading: equipmentsLoading,
    updatePrice,
    isUpdatingPrice 
  } = useSupplierEquipments(selectedSupplierId || undefined);

  const [editingPrice, setEditingPrice] = useState<{id: string, price: string} | null>(null);

  const handleUpdatePrice = (equipmentId: string) => {
    if (editingPrice && editingPrice.id === equipmentId) {
      const newPrice = parseFloat(editingPrice.price);
      if (!isNaN(newPrice) && newPrice > 0) {
        updatePrice({ id: equipmentId, precio_unitario: newPrice });
        setEditingPrice(null);
      }
    }
  };

  // Vista de lista de proveedores
  if (!selectedSupplierId && !showNewSupplier) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
          <Button onClick={() => setShowNewSupplier(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando proveedores...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {suppliers.map((supplier) => (
              <Card 
                key={supplier.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSupplierId(supplier.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="w-5 h-5" />
                        <span>{supplier.razon_social}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600">RUC: {supplier.ruc}</p>
                      {supplier.pais && (
                        <p className="text-sm text-gray-600">País: {supplier.pais}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      Ver Detalles
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {supplier.nombre_contacto && (
                    <div className="text-sm">
                      <p><strong>Contacto:</strong> {supplier.nombre_contacto} {supplier.apellido_contacto}</p>
                      {supplier.email_contacto && (
                        <p><strong>Email:</strong> {supplier.email_contacto}</p>
                      )}
                      {supplier.telefono_contacto && (
                        <p><strong>Teléfono:</strong> {supplier.telefono_contacto}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vista detallada del proveedor
  if (selectedSupplierId) {
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedSupplierId(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Proveedores
          </Button>
          <Badge variant="secondary">
            {supplier?.razon_social}
          </Badge>
        </div>

        {/* Información del Proveedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Información del Proveedor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Razón Social:</strong> {supplier?.razon_social}</p>
                <p><strong>RUC:</strong> {supplier?.ruc}</p>
                <p><strong>País:</strong> {supplier?.pais || 'No especificado'}</p>
              </div>
              <div>
                <p><strong>Contacto:</strong> {supplier?.nombre_contacto} {supplier?.apellido_contacto}</p>
                <p><strong>Email:</strong> {supplier?.email_contacto || 'No especificado'}</p>
                <p><strong>Teléfono:</strong> {supplier?.telefono_contacto || 'No especificado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipos del Proveedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Equipos del Proveedor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipmentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando equipos...</p>
              </div>
            ) : equipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Este proveedor no tiene equipos registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {equipments.map((equipment) => (
                  <div key={equipment.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium">{equipment.master_equipment?.nombre_equipo}</h4>
                        <p className="text-sm text-gray-600">
                          Código: {equipment.master_equipment?.codigo}
                        </p>
                        <p className="text-sm text-gray-600">
                          Marca: {equipment.marca} | Modelo: {equipment.modelo}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">Precio Actual</span>
                        </div>
                        {editingPrice?.id === equipment.id ? (
                          <div className="flex space-x-2 mt-1">
                            <Input
                              type="number"
                              step="0.01"
                              value={editingPrice.price}
                              onChange={(e) => setEditingPrice({
                                id: equipment.id,
                                price: e.target.value
                              })}
                              className="h-8 text-sm"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdatePrice(equipment.id)}
                              disabled={isUpdatingPrice}
                            >
                              Guardar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingPrice(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-medium">
                              ${equipment.precio_unitario} {equipment.moneda}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingPrice({
                                id: equipment.id,
                                price: equipment.precio_unitario?.toString() || '0'
                              })}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        {equipment.precio_anterior && (
                          <div>
                            <div className="flex items-center space-x-2">
                              <History className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">Precio Anterior</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              ${equipment.precio_anterior} {equipment.moneda}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">Última Actualización</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {equipment.fecha_ultima_actualizacion 
                            ? new Date(equipment.fecha_ultima_actualizacion).toLocaleDateString()
                            : 'No disponible'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
