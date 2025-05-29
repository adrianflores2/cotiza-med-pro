
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Database, Settings, UserPlus } from "lucide-react";

interface QuotationModeSelectorProps {
  hasHistoricalData: boolean;
  useSmartSuggestions: boolean;
  onSmartSuggestionsChange: (value: boolean) => void;
  showAdvancedMode: boolean;
  onAdvancedModeChange: (value: boolean) => void;
  onSwitchToManualMode: () => void;
  suggestionsCount: number;
}

export const QuotationModeSelector = ({
  hasHistoricalData,
  useSmartSuggestions,
  onSmartSuggestionsChange,
  showAdvancedMode,
  onAdvancedModeChange,
  onSwitchToManualMode,
  suggestionsCount
}: QuotationModeSelectorProps) => {
  return (
    <Card className={hasHistoricalData ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center space-x-2 ${hasHistoricalData ? 'text-blue-800' : 'text-orange-800'}`}>
            {hasHistoricalData ? <Database className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            <span>{hasHistoricalData ? 'Modo Inteligente Disponible' : 'Modo Manual'}</span>
            {hasHistoricalData && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {suggestionsCount} proveedor{suggestionsCount !== 1 ? 'es' : ''} encontrado{suggestionsCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-4">
            {hasHistoricalData && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="smart-mode">Modo Inteligente</Label>
                <Switch
                  id="smart-mode"
                  checked={useSmartSuggestions}
                  onCheckedChange={onSmartSuggestionsChange}
                />
              </div>
            )}
            {hasHistoricalData && useSmartSuggestions && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="advanced-mode">Análisis Avanzado</Label>
                <Switch
                  id="advanced-mode"
                  checked={showAdvancedMode}
                  onCheckedChange={onAdvancedModeChange}
                />
              </div>
            )}
            {hasHistoricalData && useSmartSuggestions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToManualMode}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
