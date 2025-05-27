
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  User
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuotationComparisons } from "@/hooks/useQuotationComparisons";
import { useAuth } from "@/hooks/useAuth";
import { QuotationViewDialog } from "./QuotationViewDialog";
import { useProjects } from "@/hooks/useProjects";

interface QuotationComparisonProps {
  projectId?: string;
}

export const QuotationComparison = ({ projectId }: QuotationComparisonProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "all");
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { projects } = useProjects();
  
  const {
    itemsWithQuotations,
    isLoading,
    selectQuotation,
    isSelecting
  } = useQuotationComparisons(selectedProjectId !== "all" ? selectedProjectId : undefined);

  const filteredItems = itemsWithQuotations.filter(item =>
    item.equipment.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipment.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.project.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuotationSelection = (itemId: string, quotationId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para seleccionar cotizaciones",
        variant: "destructive",
      });
      return;
    }

    selectQuotation({
      itemId,
      quotationId,
      comercialId: user.id,
    });
  };

  const handleViewQuotation = (quotation: any) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  const handleMarginChange = (itemId: string, margin: number, basePrice: number, quantity: number) => {
    const finalPrice = basePrice * quantity * (1 + margin / 100);
    
    if (!user?.id) return;

    const selectedQuotation = filteredItems
      .find(item => item.id === itemId)
      ?.quotations.find(q => q.selected);

    if (selectedQuotation) {
      selectQuotation({
        itemId,
        quotationId: selectedQuotation.id,
        comercialId: user.id,
        margenUtilidad: margin,
        precioVenta: finalPrice,
      });
    }
  };

  const handleObservationChange = (itemId: string, justificacion: string) => {
    if (!user?.id) return;

    const selectedQuotation = filteredItems
      .find(item => item.id === itemId)
      ?.quotations.find(q => q.selected);

    if (selectedQuotation) {
      selectQuotation({
        itemId,
        quotationId: selectedQuotation.id,
        comercialId: user.id,
        justificacion,
      });
    }
  };

  const getBestPrice = (quotations: any[]) => {
    if (quotations.length === 0) return 0;
    return Math.min(...quotations.map(q => q.precio_unitario));
  };

  const getWorstPrice = (quotations: any[]) => {
    if (quotations.length === 0) return 0;
    return Math.max(...quotations.map(q => q.precio_unitario));
  };

  const handleExportExcel = () => {
    toast({
      title: "Exportando a Excel",
      description: "El archivo está siendo preparado para descarga...",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comparaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Comparación de Cotizaciones</h3>
          <p className="text-gray-600">Analiza y selecciona las mejores propuestas para cada ítem</p>
        </div>
        <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar a Excel
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar ítems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Seleccionar proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ítems con cotizaciones</h3>
            <p className="text-gray-600">
              {searchTerm || selectedProjectId !== "all" ? 'No se encontraron ítems que coincidan con los filtros.' : 'Aún no hay ítems con cotizaciones para comparar.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredItems.map((item) => {
            const bestPrice = getBestPrice(item.quotations);
            const worstPrice = getWorstPrice(item.quotations);
            const selectedQuotation = item.quotations.find(q => q.selected);

            return (
              <Card key={item.id} className="border-2">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 mb-2">
                        {item.equipment.nombre_equipo}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Código: {item.equipment.codigo}</span>
                        <span>Ítem: #{item.numero_item}</span>
                        <span>Cantidad: {item.cantidad}</span>
                        <span>Proyecto: {item.project.nombre}</span>
                      </div>
                    </div>
                    <Badge variant={selectedQuotation ? "default" : "secondary"}>
                      {selectedQuotation ? "Cotización seleccionada" : "Pendiente selección"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {item.quotations.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No hay cotizaciones disponibles para este ítem</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto mb-6">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 text-sm font-medium">Seleccionar</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Marca/Modelo</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Proveedor</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Cotizador</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Origen</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Precio</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Entrega</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Fecha</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.quotations.map((quotation) => (
                              <tr 
                                key={quotation.id} 
                                className={`border-b border-gray-100 hover:bg-gray-50 ${
                                  quotation.selected ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                              >
                                <td className="py-3 px-3">
                                  <input
                                    type="radio"
                                    name={`quotation-${item.id}`}
                                    checked={quotation.selected || false}
                                    onChange={() => handleQuotationSelection(item.id, quotation.id)}
                                    className="w-4 h-4 text-blue-600"
                                    disabled={isSelecting}
                                  />
                                </td>
                                <td className="py-3 px-3">
                                  <div>
                                    <p className="font-medium text-sm">{quotation.marca}</p>
                                    <p className="text-xs text-gray-500">{quotation.modelo}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-sm">{quotation.supplier.razon_social}</td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center space-x-1 text-sm">
                                    <User className="w-3 h-3 text-gray-500" />
                                    <span>{quotation.cotizador?.nombre || 'No asignado'}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-sm">{quotation.procedencia || quotation.supplier.pais || '-'}</td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium">
                                      {quotation.moneda} {quotation.precio_unitario.toLocaleString()}
                                    </span>
                                    {quotation.precio_unitario === bestPrice && (
                                      <TrendingDown className="w-4 h-4 text-green-600" />
                                    )}
                                    {quotation.precio_unitario === worstPrice && item.quotations.length > 1 && (
                                      <TrendingUp className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-sm">{quotation.tiempo_entrega || '-'}</td>
                                <td className="py-3 px-3 text-sm">{quotation.fecha_cotizacion}</td>
                                <td className="py-3 px-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewQuotation(quotation)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Ver</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {selectedQuotation && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Margen de utilidad (%)
                            </label>
                            <Input
                              type="number"
                              value={item.comparison?.margen_utilidad || 0}
                              onChange={(e) => handleMarginChange(
                                item.id, 
                                parseFloat(e.target.value) || 0,
                                selectedQuotation.precio_unitario,
                                item.cantidad
                              )}
                              className="w-32"
                              min="0"
                              max="100"
                            />
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Precio base total: {selectedQuotation.moneda} {(selectedQuotation.precio_unitario * item.cantidad).toLocaleString()}</p>
                              {item.comparison?.precio_venta && (
                                <p className="font-semibold">Precio final: {selectedQuotation.moneda} {item.comparison.precio_venta.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observaciones y justificación
                            </label>
                            <Textarea
                              value={item.comparison?.justificacion || ''}
                              onChange={(e) => handleObservationChange(item.id, e.target.value)}
                              placeholder="Explica la razón de la selección..."
                              rows={3}
                            />
                          </div>
                        </div>
                      )}

                      {!selectedQuotation && (
                        <div className="flex items-center space-x-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <p className="text-sm text-orange-700">
                            Selecciona una cotización para continuar con la configuración de precio final.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <QuotationViewDialog
        quotation={selectedQuotation}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedQuotation(null);
        }}
      />
    </div>
  );
};
