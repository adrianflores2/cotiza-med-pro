
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
    isSelecting
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

  const handleMarginChange = React.useCallback((itemId: string, margin: number, adjustedUnitPricePEN: number, quantity: number) => {
    const finalPricePEN = adjustedUnitPricePEN * quantity * (1 + margin / 100);
    
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
        precioVenta: finalPricePEN,
      });
    }
  }, [user?.id, filteredItems, selectQuotation]);

  const handleObservationChange = React.useCallback((itemId: string, justificacion: string) => {
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
  }, [user?.id, filteredItems, selectQuotation]);

  const handleExportExcel = React.useCallback(() => {
    toast({
      title: "Exportando a Excel",
      description: "El archivo está siendo preparado para descarga...",
    });
  }, [toast]);

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
              isSelecting={isSelecting}
              onQuotationSelection={handleQuotationSelection}
              onViewQuotation={handleViewQuotation}
              onMarginChange={handleMarginChange}
              onObservationChange={handleObservationChange}
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
