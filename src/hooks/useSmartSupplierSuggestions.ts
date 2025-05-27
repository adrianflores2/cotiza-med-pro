
import { useMemo } from 'react';
import { useEquipmentSuppliers } from './useEquipmentSuppliers';
import { useAssignmentRules } from './useAssignmentRules';
import { useAuth } from './useAuth';

interface SupplierSuggestion {
  id: string;
  razon_social: string;
  marca: string;
  modelo: string;
  precio_unitario?: number;
  moneda?: string;
  procedencia?: string;
  pais?: string;
  score: number;
  reasons: string[];
  isPreferred: boolean;
  isHistorical: boolean;
  priceRank: number;
}

export const useSmartSupplierSuggestions = (equipmentId?: string) => {
  const { suppliers, isLoading } = useEquipmentSuppliers(equipmentId);
  const { findQuoterByRules } = useAssignmentRules();
  const { user } = useAuth();

  const smartSuggestions = useMemo(() => {
    if (!suppliers.length || !equipmentId) return [];

    console.log('Generating smart suggestions for equipment:', equipmentId);

    // Sort by price first to establish price rankings
    const sortedByPrice = [...suppliers].sort((a, b) => {
      const priceA = a.precio_unitario || Infinity;
      const priceB = b.precio_unitario || Infinity;
      return priceA - priceB;
    });

    return sortedByPrice.map((supplier, index): SupplierSuggestion => {
      const suggestions: SupplierSuggestion = {
        id: supplier.suppliers.id,
        razon_social: supplier.suppliers.razon_social,
        marca: supplier.marca,
        modelo: supplier.modelo,
        precio_unitario: supplier.precio_unitario,
        moneda: supplier.moneda,
        procedencia: supplier.procedencia,
        pais: supplier.suppliers.pais,
        score: 0,
        reasons: [],
        isPreferred: false,
        isHistorical: true, // Has historical data
        priceRank: index + 1,
      };

      // Base score for having historical data
      suggestions.score += 50;
      suggestions.reasons.push('Datos históricos disponibles');

      // Price scoring (best price gets higher score)
      if (supplier.precio_unitario) {
        const priceScore = Math.max(0, 50 - (index * 5)); // Top price gets 50, decreases by 5 per rank
        suggestions.score += priceScore;
        
        if (index === 0) {
          suggestions.reasons.push('Mejor precio disponible');
        } else if (index < 3) {
          suggestions.reasons.push('Precio competitivo');
        }
      }

      // Check if this supplier is preferred by assignment rules
      if (user?.id) {
        // This is a simplified check - in reality, we'd need equipment details
        suggestions.isPreferred = false; // We'll enhance this later
      }

      // National supplier preference
      if (supplier.suppliers.pais?.toLowerCase().includes('per')) {
        suggestions.score += 20;
        suggestions.reasons.push('Proveedor nacional');
      }

      // Recently updated data
      if (supplier.fecha_ultima_actualizacion) {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(supplier.fecha_ultima_actualizacion).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate < 30) {
          suggestions.score += 15;
          suggestions.reasons.push('Información actualizada');
        }
      }

      // Complete supplier information
      if (supplier.suppliers.email_contacto && supplier.suppliers.telefono_contacto) {
        suggestions.score += 10;
        suggestions.reasons.push('Información de contacto completa');
      }

      return suggestions;
    }).sort((a, b) => b.score - a.score);
  }, [suppliers, equipmentId, user?.id]);

  const bestSuggestion = smartSuggestions[0];
  const priceComparison = smartSuggestions
    .filter(s => s.precio_unitario)
    .slice(0, 3)
    .map(s => ({
      razon_social: s.razon_social,
      precio_unitario: s.precio_unitario!,
      moneda: s.moneda || 'USD',
      marca: s.marca,
      modelo: s.modelo,
    }));

  return {
    suggestions: smartSuggestions,
    bestSuggestion,
    priceComparison,
    hasHistoricalData: smartSuggestions.length > 0,
    isLoading,
  };
};
