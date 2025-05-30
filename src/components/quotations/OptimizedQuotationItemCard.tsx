
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { OptimizedQuotationTableRow } from "./OptimizedQuotationTableRow";
import { QuotationConfigPanel } from "./QuotationConfigPanel";
import { getBestPricePEN, getWorstPricePEN } from "@/utils/quotationPriceCalculator";
import { EmptyState } from "@/components/ui/states/EmptyState";

interface OptimizedQuotationItemCardProps {
  item: any;
  isSelecting: boolean;
  onQuotationSelection: (itemId: string, quotationId: string) => void;
  onViewQuotation: (quotation: any) => void;
  onMarginChange: (itemId: string, margin: number, adjustedUnitPricePEN: number, quantity: number) => void;
  onObservationChange: (itemId: string, justificacion: string) => void;
}

export const OptimizedQuotationItemCard = React.memo(({
  item,
  isSelecting,
  onQuotationSelection,
  onViewQuotation,
  onMarginChange,
  onObservationChange
}: OptimizedQuotationItemCardProps) => {
  const bestPricePEN = React.useMemo(() => getBestPricePEN(item.quotations), [item.quotations]);
  const worstPricePEN = React.useMemo(() => getWorstPricePEN(item.quotations), [item.quotations]);
  const selectedQuotation = React.useMemo(() => 
    item.quotations.find((q: any) => q.selected), 
    [item.quotations]
  );

  return (
    <Card className="border-2">
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
          <EmptyState
            icon="package"
            message="No hay cotizaciones disponibles para este ítem"
          />
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
                    <th className="text-left py-2 px-3 text-sm font-medium">Tipo</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Precio Unit. Base</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Precio Unit. Ajustado</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Total</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Entrega</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {item.quotations.map((quotation: any) => (
                    <OptimizedQuotationTableRow
                      key={quotation.id}
                      quotation={quotation}
                      itemId={item.id}
                      quantity={item.cantidad}
                      bestPricePEN={bestPricePEN}
                      worstPricePEN={worstPricePEN}
                      totalQuotations={item.quotations.length}
                      isSelected={quotation.selected || false}
                      isSelecting={isSelecting}
                      onSelect={onQuotationSelection}
                      onView={onViewQuotation}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {selectedQuotation && (
              <QuotationConfigPanel
                selectedQuotation={selectedQuotation}
                item={item}
                onMarginChange={onMarginChange}
                onObservationChange={onObservationChange}
              />
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
});

OptimizedQuotationItemCard.displayName = 'OptimizedQuotationItemCard';
