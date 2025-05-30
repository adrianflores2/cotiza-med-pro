
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPENPrice } from "@/utils/currencyConverter";
import { calculateQuotationPrices } from "@/utils/quotationPriceCalculator";
import { useCallback, useState, useEffect } from "react";

interface QuotationConfigPanelProps {
  selectedQuotation: any;
  item: any;
  onMarginChange: (itemId: string, margin: number, adjustedUnitPricePEN: number, quantity: number) => void;
  onObservationChange: (itemId: string, justificacion: string) => void;
}

export const QuotationConfigPanel = ({
  selectedQuotation,
  item,
  onMarginChange,
  onObservationChange
}: QuotationConfigPanelProps) => {
  const { adjustedUnitPricePEN, totalPricePEN } = calculateQuotationPrices(selectedQuotation, item.cantidad);
  const [localMargin, setLocalMargin] = useState(item.comparison?.margen_utilidad || 0);
  const [localJustification, setLocalJustification] = useState(item.comparison?.justificacion || '');

  // Update local state when item comparison changes
  useEffect(() => {
    setLocalMargin(item.comparison?.margen_utilidad || 0);
    setLocalJustification(item.comparison?.justificacion || '');
  }, [item.comparison?.margen_utilidad, item.comparison?.justificacion]);

  // Debounced handlers to avoid excessive API calls
  const debouncedMarginChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (margin: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onMarginChange(item.id, margin, adjustedUnitPricePEN, item.cantidad);
        }, 500); // 500ms delay
      };
    })(),
    [item.id, adjustedUnitPricePEN, item.cantidad, onMarginChange]
  );

  const debouncedJustificationChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (justificacion: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onObservationChange(item.id, justificacion);
        }, 1000); // 1 second delay for text
      };
    })(),
    [item.id, onObservationChange]
  );

  const handleMarginChange = (margin: number) => {
    setLocalMargin(margin);
    debouncedMarginChange(margin);
  };

  const handleJustificationChange = (justificacion: string) => {
    setLocalJustification(justificacion);
    debouncedJustificationChange(justificacion);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Margen de utilidad (%)
        </label>
        <Input
          type="number"
          value={localMargin}
          onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
          className="w-32"
          min="0"
          max="100"
        />
        <div className="mt-2 text-sm text-gray-600">
          <p>Precio unitario ajustado: {formatPENPrice(adjustedUnitPricePEN)}</p>
          <p>Precio base total: {formatPENPrice(totalPricePEN)}</p>
          {item.comparison?.precio_venta && (
            <p className="font-semibold">Precio final: {formatPENPrice(item.comparison.precio_venta)}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones y justificación
        </label>
        <Textarea
          value={localJustification}
          onChange={(e) => handleJustificationChange(e.target.value)}
          placeholder="Explica la razón de la selección..."
          rows={3}
        />
      </div>
    </div>
  );
};
