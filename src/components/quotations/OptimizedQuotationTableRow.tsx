
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, User } from "lucide-react";
import { formatPENPrice } from "@/utils/currencyConverter";
import { calculateQuotationPrices, getQuotationType } from "@/utils/quotationPriceCalculator";

interface OptimizedQuotationTableRowProps {
  quotation: any;
  itemId: string;
  quantity: number;
  bestPricePEN: number;
  worstPricePEN: number;
  totalQuotations: number;
  isSelected: boolean;
  isSelecting: boolean;
  onSelect: (itemId: string, quotationId: string) => void;
  onView: (quotation: any) => void;
}

export const OptimizedQuotationTableRow = React.memo(({
  quotation,
  itemId,
  quantity,
  bestPricePEN,
  worstPricePEN,
  totalQuotations,
  isSelected,
  isSelecting,
  onSelect,
  onView
}: OptimizedQuotationTableRowProps) => {
  const priceCalculation = React.useMemo(() => 
    calculateQuotationPrices(quotation, quantity), 
    [quotation, quantity]
  );

  const { basePricePEN, accessoryPricePerUnitPEN, adjustedUnitPricePEN, totalPricePEN } = priceCalculation;

  const handleSelect = React.useCallback(() => {
    onSelect(itemId, quotation.id);
  }, [itemId, quotation.id, onSelect]);

  const handleView = React.useCallback(() => {
    onView(quotation);
  }, [quotation, onView]);

  const isBestPrice = adjustedUnitPricePEN === bestPricePEN;
  const isWorstPrice = adjustedUnitPricePEN === worstPricePEN && totalQuotations > 1;

  return (
    <tr 
      className={`border-b border-gray-100 hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <td className="py-3 px-3">
        <input
          type="radio"
          name={`quotation-${itemId}`}
          checked={isSelected}
          onChange={handleSelect}
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
      <td className="py-3 px-3">
        <Badge variant={quotation.tipo_cotizacion === 'importado' ? 'destructive' : 'default'} className="text-xs">
          {getQuotationType(quotation)}
        </Badge>
      </td>
      <td className="py-3 px-3">
        <div className="text-sm">
          <span className="font-medium">
            {formatPENPrice(basePricePEN)}
          </span>
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center space-x-1">
          <div className="text-sm">
            <span className="font-bold text-blue-600">
              {formatPENPrice(adjustedUnitPricePEN)}
            </span>
            {accessoryPricePerUnitPEN > 0 && (
              <p className="text-xs text-orange-600">
                +{formatPENPrice(accessoryPricePerUnitPEN)} accesorios
              </p>
            )}
          </div>
          {isBestPrice && (
            <TrendingDown className="w-4 h-4 text-green-600" />
          )}
          {isWorstPrice && (
            <TrendingUp className="w-4 h-4 text-red-600" />
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="text-sm font-bold text-green-600">
          {formatPENPrice(totalPricePEN)}
        </div>
      </td>
      <td className="py-3 px-3 text-sm">{quotation.tiempo_entrega || '-'}</td>
      <td className="py-3 px-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          className="flex items-center space-x-1"
        >
          <Eye className="w-3 h-3" />
          <span>Ver</span>
        </Button>
      </td>
    </tr>
  );
});

OptimizedQuotationTableRow.displayName = 'OptimizedQuotationTableRow';
