
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PriceInputProps {
  value: string;
  currency: string;
  onValueChange: (value: string) => void;
  onCurrencyChange: (currency: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const currencies = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'PEN', label: 'PEN (S/)', symbol: 'S/' },
];

export const PriceInput = React.memo(({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  label = "Precio",
  placeholder = "0.00",
  required = false,
  disabled = false,
  className = ""
}: PriceInputProps) => {
  const selectedCurrency = currencies.find(c => c.value === currency);

  const handleValueChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(inputValue)) {
      onValueChange(inputValue);
    }
  }, [onValueChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={value}
            onChange={handleValueChange}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {selectedCurrency?.symbol}
          </div>
        </div>
        <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.value} value={curr.value}>
                {curr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

PriceInput.displayName = 'PriceInput';
