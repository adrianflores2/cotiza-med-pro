
import { convertToPEN } from './currencyConverter';

export interface QuotationPriceCalculation {
  basePricePEN: number;
  accessoryPricePerUnitPEN: number;
  adjustedUnitPricePEN: number;
  totalPricePEN: number;
}

export const calculateQuotationPrices = (
  quotation: any,
  quantity: number
): QuotationPriceCalculation => {
  // Calculate base price in PEN
  const basePricePEN = convertToPEN(quotation.precio_unitario, quotation.moneda);
  
  // Calculate accessory price NOT included in proforma (per unit) in PEN
  const accessories = quotation.accessories || quotation.quotation_accessories || [];
  const accessoryPricePerUnitPEN = accessories
    .filter((acc: any) => !acc.incluido_en_proforma && acc.precio_unitario)
    .reduce((total: number, acc: any) => {
      const accessoryCurrency = acc.moneda || quotation.moneda || 'USD';
      const accessoryPricePEN = convertToPEN(acc.precio_unitario, accessoryCurrency);
      return total + (accessoryPricePEN * acc.cantidad);
    }, 0);

  // Calculate adjusted unit price in PEN (base price + accessories not in proforma)
  const adjustedUnitPricePEN = basePricePEN + accessoryPricePerUnitPEN;
  
  // Calculate total price in PEN (adjusted unit price * quantity)
  const totalPricePEN = adjustedUnitPricePEN * quantity;

  return {
    basePricePEN,
    accessoryPricePerUnitPEN,
    adjustedUnitPricePEN,
    totalPricePEN
  };
};

export const getBestPricePEN = (quotations: any[]): number => {
  if (quotations.length === 0) return 0;
  return Math.min(...quotations.map(q => {
    const { adjustedUnitPricePEN } = calculateQuotationPrices(q, 1);
    return adjustedUnitPricePEN;
  }));
};

export const getWorstPricePEN = (quotations: any[]): number => {
  if (quotations.length === 0) return 0;
  return Math.max(...quotations.map(q => {
    const { adjustedUnitPricePEN } = calculateQuotationPrices(q, 1);
    return adjustedUnitPricePEN;
  }));
};

export const getQuotationType = (quotation: any): string => {
  return quotation.tipo_cotizacion === 'importado' ? 'Importado' : 'Nacional';
};
