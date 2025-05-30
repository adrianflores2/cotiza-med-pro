
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, User, Trash2 } from "lucide-react";
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
  onDelete?: (quotationId: string) => void;
  isDeleting?: boolean;
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
  onView,
  onDelete,
  isDeleting = false
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

  const handleDelete = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      const confirmed = window.confirm(
        `¿Estás seguro de que quieres eliminar la cotización de ${quotation.marca} ${quotation.modelo}?\n\n` +
        `Esta acción no se puede deshacer.${isSelected ? '\n\nNota: Esta cotización está seleccionada y se removerá la selección.' : ''}`
      );
      
      if (confirmed) {
        onDelete(quotation.id);
      }
    }
  }, [quotation.id, quotation.marca, quotation.modelo, isSelected, onDelete]);

  const isBestPrice = adjustedUnitPricePEN === bestPricePEN;
  const isWorstPrice = adjustedUnitPricePEN === worstPricePEN && totalQuotations > 1;

  return (
    <tr 
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isSelected 
          ? 'bg-blue-100 border-blue-300 shadow-sm ring-1 ring-blue-200' 
          : ''
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
          <p className={`font-medium text-sm ${isSelected ? 'text-blue-900' : ''}`}>
            {quotation.marca}
          </p>
          <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
            {quotation.modelo}
          </p>
        </div>
      </td>
      <td className={`py-3 px-3 text-sm ${isSelected ? 'text-blue-900' : ''}`}>
        {quotation.supplier.razon_social}
      </td>
      <td className="py-3 px-3">
        <div className={`flex items-center space-x-1 text-sm ${isSelected ? 'text-blue-900' : ''}`}>
          <User className={`w-3 h-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
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
          <span className={`font-medium ${isSelected ? 'text-blue-900' : ''}`}>
            {formatPENPrice(basePricePEN)}
          </span>
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center space-x-1">
          <div className="text-sm">
            <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>
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
        <div className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-green-600'}`}>
          {formatPENPrice(totalPricePEN)}
        </div>
      </td>
      <td className={`py-3 px-3 text-sm ${isSelected ? 'text-blue-900' : ''}`}>
        {quotation.tiempo_entrega || '-'}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>Ver</span>
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              title={`Eliminar cotización de ${quotation.marca} ${quotation.modelo}`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
});

OptimizedQuotationTableRow.displayName = 'OptimizedQuotationTableRow';
