
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useQuotations } from "@/hooks/useQuotations";
import { useQuotationDetails } from "@/hooks/useQuotationDetails";

interface EditQuotationFormProps {
  quotationId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditQuotationForm = ({ quotationId, onCancel, onSuccess }: EditQuotationFormProps) => {
  const { updateQuotation, isUpdating } = useQuotations();
  const { data: quotationDetails, isLoading } = useQuotationDetails(quotationId);

  const [formData, setFormData] = useState({
    tipo_cotizacion: 'nacional' as 'nacional' | 'importado',
    marca: '',
    modelo: '',
    procedencia: '',
    precio_unitario: 0,
    moneda: 'USD',
    tiempo_entrega: '',
    condiciones: '',
    incoterm: '',
    observaciones: '',
    fecha_vencimiento: '',
  });

  // Load existing data when quotationDetails is available
  useEffect(() => {
    if (quotationDetails) {
      setFormData({
        tipo_cotizacion: quotationDetails.tipo_cotizacion as 'nacional' | 'importado',
        marca: quotationDetails.marca || '',
        modelo: quotationDetails.modelo || '',
        procedencia: quotationDetails.procedencia || '',
        precio_unitario: quotationDetails.precio_unitario || 0,
        moneda: quotationDetails.moneda || 'USD',
        tiempo_entrega: quotationDetails.tiempo_entrega || '',
        condiciones: quotationDetails.condiciones || '',
        incoterm: quotationDetails.incoterm || '',
        observaciones: quotationDetails.observaciones || '',
        fecha_vencimiento: quotationDetails.fecha_vencimiento || '',
      });
    }
  }, [quotationDetails]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    updateQuotation({
      id: quotationId,
      ...formData
    });
    onSuccess();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos de la cotización...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h3 className="text-xl font-semibold text-gray-900">Editar Cotización</h3>
        </div>
        <Button onClick={handleSubmit} disabled={isUpdating}>
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_cotizacion">Tipo de Cotización</Label>
              <Select 
                value={formData.tipo_cotizacion} 
                onValueChange={(value) => handleInputChange('tipo_cotizacion', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="importado">Importado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Ingrese la marca"
              />
            </div>

            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Ingrese el modelo"
              />
            </div>

            <div>
              <Label htmlFor="procedencia">Procedencia</Label>
              <Input
                id="procedencia"
                value={formData.procedencia}
                onChange={(e) => handleInputChange('procedencia', e.target.value)}
                placeholder="País de origen"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Comercial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="precio_unitario">Precio Unitario</Label>
              <Input
                id="precio_unitario"
                type="number"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => handleInputChange('precio_unitario', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Select 
                value={formData.moneda} 
                onValueChange={(value) => handleInputChange('moneda', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="PEN">PEN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
              <Input
                id="tiempo_entrega"
                value={formData.tiempo_entrega}
                onChange={(e) => handleInputChange('tiempo_entrega', e.target.value)}
                placeholder="ej: 4-6 semanas"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incoterm">Incoterm</Label>
              <Input
                id="incoterm"
                value={formData.incoterm}
                onChange={(e) => handleInputChange('incoterm', e.target.value)}
                placeholder="ej: FOB, CIF, EXW"
              />
            </div>

            <div>
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="condiciones">Condiciones</Label>
            <Textarea
              id="condiciones"
              value={formData.condiciones}
              onChange={(e) => handleInputChange('condiciones', e.target.value)}
              placeholder="Condiciones comerciales, formas de pago, etc."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
