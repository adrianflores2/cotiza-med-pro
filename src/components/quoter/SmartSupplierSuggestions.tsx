
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Crown, 
  Clock, 
  DollarSign, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useSmartSupplierSuggestions } from '@/hooks/useSmartSupplierSuggestions';

interface SmartSupplierSuggestionsProps {
  equipmentId?: string;
  onSelectSuggestion: (suggestion: any) => void;
  showComparison?: boolean;
}

export const SmartSupplierSuggestions = ({ 
  equipmentId, 
  onSelectSuggestion,
  showComparison = true 
}: SmartSupplierSuggestionsProps) => {
  const { 
    suggestions, 
    bestSuggestion, 
    priceComparison, 
    hasHistoricalData, 
    isLoading 
  } = useSmartSupplierSuggestions(equipmentId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Analizando proveedores inteligentemente...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasHistoricalData) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-orange-700">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-medium">Modo Manual Activado</p>
              <p className="text-sm">No hay datos históricos. Ingresa información manualmente.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Best Suggestion Banner */}
      {bestSuggestion && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Lightbulb className="w-5 h-5" />
              <span>Sugerencia Inteligente</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Score: {bestSuggestion.score}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="font-semibold text-lg">{bestSuggestion.razon_social}</p>
                <p className="text-gray-600">
                  {bestSuggestion.marca} - {bestSuggestion.modelo}
                </p>
                {bestSuggestion.precio_unitario && (
                  <p className="text-xl font-bold text-green-700">
                    {bestSuggestion.moneda} {bestSuggestion.precio_unitario.toLocaleString()}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {bestSuggestion.reasons.map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => onSelectSuggestion(bestSuggestion)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Usar Sugerencia
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison */}
      {showComparison && priceComparison.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Comparación Rápida de Precios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {priceComparison.map((comparison, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                    <div>
                      <p className="font-medium">{comparison.razon_social}</p>
                      <p className="text-sm text-gray-600">
                        {comparison.marca} - {comparison.modelo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${index === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                      {comparison.moneda} {comparison.precio_unitario.toLocaleString()}
                    </p>
                    {index === 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Mejor precio
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Suggestions */}
      {suggestions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Todas las Opciones Disponibles</span>
              <Badge variant="outline">{suggestions.length} proveedores</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.slice(1).map((suggestion, index) => (
                <div 
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{suggestion.razon_social}</p>
                      {suggestion.isPreferred && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Preferido
                        </Badge>
                      )}
                      {suggestion.pais?.toLowerCase().includes('per') && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          Nacional
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {suggestion.marca} - {suggestion.modelo}
                    </p>
                    {suggestion.precio_unitario && (
                      <p className="text-sm font-semibold">
                        {suggestion.moneda} {suggestion.precio_unitario.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-2">
                          (#{suggestion.priceRank} en precio)
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Score: {suggestion.score}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectSuggestion(suggestion)}
                    >
                      Seleccionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
