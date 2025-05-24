
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Download
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

const mockItemsWithQuotations = [
  {
    id: 1,
    project: "Hospital San Juan - UCI",
    name: "Monitor de signos vitales",
    code: "EQ-001",
    quantity: 5,
    quotations: [
      {
        id: 1,
        brand: "Philips",
        model: "IntelliVue MX400",
        supplier: "MedTech Solutions",
        origin: "Alemania",
        price: 15000,
        currency: "USD",
        exchangeRate: 3.75,
        localPrice: 56250,
        deliveryTime: "6-8 semanas",
        conditions: "FOB destino, garantía 2 años",
        lastUpdate: "2024-01-20",
        selected: false
      },
      {
        id: 2,
        brand: "GE Healthcare",
        model: "B40 Patient Monitor",
        supplier: "HealthEquip SA",
        origin: "Estados Unidos",
        price: 12500,
        currency: "USD",
        exchangeRate: 3.75,
        localPrice: 46875,
        deliveryTime: "4-6 semanas",
        conditions: "CIF, garantía 3 años",
        lastUpdate: "2024-01-22",
        selected: true
      },
      {
        id: 3,
        brand: "Mindray",
        model: "BeneView T1",
        supplier: "Medical Imports",
        origin: "China",
        price: 8500,
        currency: "USD",
        exchangeRate: 3.75,
        localPrice: 31875,
        deliveryTime: "8-10 semanas",
        conditions: "FOB origen, garantía 1 año",
        lastUpdate: "2024-01-18",
        selected: false
      }
    ],
    finalMargin: 25,
    finalPrice: 58593.75,
    observations: "Se selecciona GE por mejor relación calidad-precio y garantía extendida"
  }
];

export const QuotationComparison = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [items, setItems] = useState(mockItemsWithQuotations);
  const { toast } = useToast();

  const handleQuotationSelection = (itemId: number, quotationId: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            quotations: item.quotations.map(q => ({
              ...q,
              selected: q.id === quotationId
            }))
          }
        : item
    ));
  };

  const handleMarginChange = (itemId: number, margin: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            finalMargin: margin,
            finalPrice: calculateFinalPrice(item, margin)
          }
        : item
    ));
  };

  const calculateFinalPrice = (item: any, margin: number) => {
    const selectedQuotation = item.quotations.find((q: any) => q.selected);
    if (!selectedQuotation) return 0;
    const basePrice = selectedQuotation.localPrice * item.quantity;
    return basePrice * (1 + margin / 100);
  };

  const handleObservationChange = (itemId: number, observation: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, observations: observation }
        : item
    ));
  };

  const handleExportExcel = () => {
    toast({
      title: "Exportando a Excel",
      description: "El archivo está siendo preparado para descarga...",
    });
  };

  const getBestPrice = (quotations: any[]) => {
    return Math.min(...quotations.map(q => q.localPrice));
  };

  const getWorstPrice = (quotations: any[]) => {
    return Math.max(...quotations.map(q => q.localPrice));
  };

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
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrar por proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            <SelectItem value="hospital-san-juan">Hospital San Juan - UCI</SelectItem>
            <SelectItem value="clinica-norte">Clínica Norte - Quirófanos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        {items.map((item) => {
          const bestPrice = getBestPrice(item.quotations);
          const worstPrice = getWorstPrice(item.quotations);
          const selectedQuotation = item.quotations.find(q => q.selected);

          return (
            <Card key={item.id} className="border-2">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-900 mb-2">
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Código: {item.code}</span>
                      <span>Cantidad: {item.quantity}</span>
                      <span>Proyecto: {item.project}</span>
                    </div>
                  </div>
                  <Badge variant={selectedQuotation ? "default" : "secondary"}>
                    {selectedQuotation ? "Cotización seleccionada" : "Pendiente selección"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-sm font-medium">Seleccionar</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Marca/Modelo</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Proveedor</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Origen</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Precio USD</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Precio Local</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Entrega</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Estado</th>
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
                              checked={quotation.selected}
                              onChange={() => handleQuotationSelection(item.id, quotation.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-medium text-sm">{quotation.brand}</p>
                              <p className="text-xs text-gray-500">{quotation.model}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-sm">{quotation.supplier}</td>
                          <td className="py-3 px-3 text-sm">{quotation.origin}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium">
                                ${quotation.price.toLocaleString()}
                              </span>
                              {quotation.localPrice === bestPrice && (
                                <TrendingDown className="w-4 h-4 text-green-600" />
                              )}
                              {quotation.localPrice === worstPrice && (
                                <TrendingUp className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm font-medium">
                              S/ {quotation.localPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-sm">{quotation.deliveryTime}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">{quotation.lastUpdate}</span>
                            </div>
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
                        value={item.finalMargin}
                        onChange={(e) => handleMarginChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-32"
                        min="0"
                        max="100"
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Precio base total: S/ {(selectedQuotation.localPrice * item.quantity).toLocaleString()}</p>
                        <p className="font-semibold">Precio final: S/ {item.finalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones y justificación
                      </label>
                      <Textarea
                        value={item.observations}
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
