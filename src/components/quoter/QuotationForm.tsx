
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Send, 
  Upload,
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuotationFormProps {
  assignment: any;
  onBack: () => void;
}

export const QuotationForm = ({ assignment, onBack }: QuotationFormProps) => {
  const [formData, setFormData] = useState({
    precio_unitario: "",
    moneda: "USD",
    tiempo_entrega: "",
    condiciones: "",
    incoterm: "",
    observaciones: "",
    fecha_vencimiento: "",
  });

  const [isDraft, setIsDraft] = useState(true);
  const { toast } = useToast();

  const item = assignment.project_items;
  const equipment = item?.master_equipment;
  const project = item?.projects;

  const handleSubmit = (asDraft = true) => {
    if (!formData.precio_unitario.trim()) {
      toast({
        title: "Error",
        description: "El precio unitario es requerido",
        variant: "destructive",
      });
      return;
    }

    // Aquí iría la lógica para guardar la cotización
    console.log('Saving quotation:', { ...formData, isDraft: asDraft });
    
    toast({
      title: asDraft ? "Borrador guardado" : "Cotización enviada",
      description: asDraft 
        ? "La cotización se guardó como borrador" 
        : "La cotización se envió correctamente",
    });

    if (!asDraft) {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la bandeja
        </Button>
        <div className="flex space-x-2">
          <Badge variant="outline">
            Ítem #{item?.numero_item}
          </Badge>
          <Badge variant="secondary">
            {project?.nombre}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Cotización - {equipment?.nombre_equipo}</span>
          </CardTitle>
          <div className="text-sm text-gray-600">
            <p>Código: {equipment?.codigo}</p>
            <p>Cantidad: {item?.cantidad} unidades</p>
            {item?.observaciones && (
              <p>Observaciones: {item.observaciones}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio">Precio Unitario *</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <Select 
                  value={formData.moneda} 
                  onValueChange={(value) => setFormData({ ...formData, moneda: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="PEN">PEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tiempo_entrega">Tiempo de Entrega</Label>
              <Input
                id="tiempo_entrega"
                value={formData.tiempo_entrega}
                onChange={(e) => setFormData({ ...formData, tiempo_entrega: e.target.value })}
                placeholder="Ej: 30 días calendario"
              />
            </div>

            <div>
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="incoterm">Incoterm</Label>
              <Select 
                value={formData.incoterm} 
                onValueChange={(value) => setFormData({ ...formData, incoterm: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar incoterm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                  <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                  <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                  <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="condiciones">Condiciones de Pago</Label>
            <Textarea
              id="condiciones"
              value={formData.condiciones}
              onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
              placeholder="Ej: 50% adelanto, 50% contra entrega"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones adicionales sobre la cotización"
              rows={3}
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Subir proforma (PDF, máximo 10MB)
            </p>
            <Button variant="outline" size="sm">
              Seleccionar archivo
            </Button>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar borrador
            </Button>
            <Button onClick={() => handleSubmit(false)}>
              <Send className="w-4 h-4 mr-2" />
              Enviar cotización
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
