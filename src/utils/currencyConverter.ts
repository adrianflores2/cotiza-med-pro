
// Exchange rates to PEN
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 4.0,
  'EURO': 4.7,
  'EUR': 4.7,
  'PEN': 1.0,
  'SOL': 1.0,
  'SOLES': 1.0,
};

export const convertToPEN = (amount: number, fromCurrency: string): number => {
  const normalizedCurrency = fromCurrency.toUpperCase();
  const rate = EXCHANGE_RATES[normalizedCurrency] || 1;
  return amount * rate;
};

export const formatPENPrice = (amount: number): string => {
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currency: string): string => {
  const normalized = currency.toUpperCase();
  switch (normalized) {
    case 'USD':
      return '$';
    case 'EURO':
    case 'EUR':
      return '€';
    case 'PEN':
    case 'SOL':
    case 'SOLES':
      return 'S/';
    default:
      return currency;
  }
};
