
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPENPrice } from "@/utils/currencyConverter";
import { calculateQuotationPrices } from "@/utils/quotationPriceCalculator";

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Margen de utilidad (%)
        </label>
        <Input
          type="number"
          value={item.comparison?.margen_utilidad || 0}
          onChange={(e) => onMarginChange(
            item.id, 
            parseFloat(e.target.value) || 0,
            adjustedUnitPricePEN,
            item.cantidad
          )}
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
          value={item.comparison?.justificacion || ''}
          onChange={(e) => onObservationChange(item.id, e.target.value)}
          placeholder="Explica la razón de la selección..."
          rows={3}
        />
      </div>
    </div>
  );
};
