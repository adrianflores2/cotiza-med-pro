
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuotationComparisons } from "@/hooks/useQuotationComparisons";
import { useAuth } from "@/hooks/useAuth";
import { QuotationViewDialog } from "./QuotationViewDialog";
import { OptimizedQuotationItemCard } from "./OptimizedQuotationItemCard";
import { useProjects } from "@/hooks/useProjects";
import { LoadingState } from "@/components/ui/states/LoadingState";
import { EmptyState } from "@/components/ui/states/EmptyState";
import * as XLSX from 'xlsx';
import { formatPENPrice } from "@/utils/currencyConverter";
import { calculateQuotationPrices } from "@/utils/quotationPriceCalculator";

interface OptimizedQuotationComparisonProps {
  projectId?: string;
}

export const OptimizedQuotationComparison = React.memo(({ projectId }: OptimizedQuotationComparisonProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState(projectId || "all");
  const [selectedQuotation, setSelectedQuotation] = React.useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { projects } = useProjects();
  
  const {
    itemsWithQuotations,
    isLoading,
    selectQuotation,
    updateComparison,
    deleteQuotation,
    isSelecting,
    isUpdating,
    isDeleting
  } = useQuotationComparisons(selectedProjectId !== "all" ? selectedProjectId : undefined);

  // Update selectedProjectId when projectId prop changes
  React.useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, selectedProjectId]);

  const filteredItems = React.useMemo(() => 
    itemsWithQuotations.filter(item =>
      item.equipment.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [itemsWithQuotations, searchTerm]
  );

  const handleQuotationSelection = React.useCallback((itemId: string, quotationId: string) => {
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
  }, [user?.id, selectQuotation, toast]);

  const handleViewQuotation = React.useCallback((quotation: any) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  }, []);

  const handleDeleteQuotation = React.useCallback((quotationId: string) => {
    console.log('Handling quotation deletion:', quotationId);
    deleteQuotation(quotationId);
  }, [deleteQuotation]);

  const handleMarginChange = React.useCallback((itemId: string, margin: number, adjustedUnitPricePEN: number, quantity: number) => {
    const finalPricePEN = adjustedUnitPricePEN * quantity * (1 + margin / 100);
    
    updateComparison({
      itemId,
      margenUtilidad: margin,
      precioVenta: finalPricePEN,
    });
  }, [updateComparison]);

  const handleObservationChange = React.useCallback((itemId: string, justificacion: string) => {
    updateComparison({
      itemId,
      justificacion,
    });
  }, [updateComparison]);

  const handleExportExcel = React.useCallback(() => {
    try {
      console.log('Starting Excel export with filtered items:', filteredItems.length);
      
      // Prepare data for Excel export
      const exportData = filteredItems
        .filter(item => item.quotations.length > 0)
        .map(item => {
          const selectedQuotation = item.quotations.find(q => q.selected);
          
          const baseRow = {
            proyecto: item.project.nombre,
            codigo_equipo: item.equipment.codigo,
            nombre_equipo: item.equipment.nombre_equipo,
            numero_item: item.numero_item,
            cantidad: item.cantidad,
            cotizacion_seleccionada: selectedQuotation ? `${selectedQuotation.marca} ${selectedQuotation.modelo}` : 'Ninguna',
            proveedor_seleccionado: selectedQuotation?.supplier.razon_social || '',
            margen_utilidad: item.comparison?.margen_utilidad || 0,
            precio_venta: item.comparison?.precio_venta ? formatPENPrice(item.comparison.precio_venta) : '',
            justificacion: item.comparison?.justificacion || '',
            total_cotizaciones: item.quotations.length
          };

          return baseRow;
        });

      if (exportData.length === 0) {
        toast({
          title: "No hay datos para exportar",
          description: "No se encontraron ítems con cotizaciones para exportar",
          variant: "destructive",
        });
        return;
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create main summary sheet
      const ws1 = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws1, "Resumen Comparaciones");

      // Create detailed quotations sheet
      const detailedData = filteredItems.flatMap(item => 
        item.quotations.map(q => {
          const prices = calculateQuotationPrices(q, item.cantidad);
          return {
            proyecto: item.project.nombre,
            codigo_equipo: item.equipment.codigo,
            nombre_equipo: item.equipment.nombre_equipo,
            numero_item: item.numero_item,
            cantidad: item.cantidad,
            marca: q.marca,
            modelo: q.modelo,
            proveedor: q.supplier.razon_social,
            cotizador: q.cotizador?.nombre || 'No asignado',
            tipo: q.tipo_cotizacion,
            precio_unitario_base: formatPENPrice(prices.basePricePEN),
            precio_unitario_ajustado: formatPENPrice(prices.adjustedUnitPricePEN),
            precio_total: formatPENPrice(prices.totalPricePEN),
            tiempo_entrega: q.tiempo_entrega || '',
            seleccionada: q.selected ? 'SÍ' : 'NO'
          };
        })
      );

      const ws2 = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, ws2, "Detalle Cotizaciones");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const projectName = selectedProjectId !== "all" ? projects.find(p => p.id === selectedProjectId)?.nombre || "Todos" : "Todos";
      const filename = `Comparacion_Cotizaciones_${projectName}_${currentDate}.xlsx`;

      console.log('Generated Excel with', exportData.length, 'summary rows and', detailedData.length, 'detail rows');

      // Save file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Exportación completada",
        description: `El archivo ${filename} ha sido descargado exitosamente`,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error en la exportación",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    }
  }, [filteredItems, selectedProjectId, projects, toast]);

  if (isLoading) {
    return <LoadingState message="Cargando comparaciones..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Comparación de Cotizaciones</h3>
          <p className="text-gray-600">Analiza y selecciona las mejores propuestas para cada ítem</p>
        </div>
        <Button 
          onClick={handleExportExcel} 
          className="bg-green-600 hover:bg-green-700"
          disabled={filteredItems.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar a Excel ({filteredItems.filter(item => item.quotations.length > 0).length} ítems)
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
        <EmptyState
          icon="search"
          message="No hay ítems con cotizaciones"
          description={
            searchTerm || selectedProjectId !== "all" 
              ? 'No se encontraron ítems que coincidan con los filtros.' 
              : 'Aún no hay ítems con cotizaciones para comparar.'
          }
        />
      ) : (
        <div className="space-y-8">
          {filteredItems.map((item) => (
            <OptimizedQuotationItemCard
              key={item.id}
              item={item}
              isSelecting={isSelecting || isUpdating || isDeleting}
              onQuotationSelection={handleQuotationSelection}
              onViewQuotation={handleViewQuotation}
              onMarginChange={handleMarginChange}
              onObservationChange={handleObservationChange}
              onDeleteQuotation={handleDeleteQuotation}
              isDeleting={isDeleting}
            />
          ))}
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
});

OptimizedQuotationComparison.displayName = 'OptimizedQuotationComparison';
