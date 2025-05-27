
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
  ruc?: string;
  nombre_contacto?: string;
  apellido_contacto?: string;
  email_contacto?: string;
  telefono_contacto?: string;
}

export const useSmartSupplierSuggestions = (equipmentId?: string) => {
  const { suppliers, isLoading } = useEquipmentSuppliers(equipmentId);
  const { findQuoterByRules } = useAssignmentRules();
  const { user } = useAuth();

  console.log('useSmartSupplierSuggestions: Equipment ID:', equipmentId);
  console.log('useSmartSupplierSuggestions: Suppliers found:', suppliers?.length || 0);

  const smartSuggestions = useMemo(() => {
    if (!suppliers?.length || !equipmentId) {
      console.log('useSmartSupplierSuggestions: No suppliers or equipment ID, returning empty array');
      return [];
    }

    console.log('Generating smart suggestions for equipment:', equipmentId);
    console.log('Available suppliers:', suppliers.map(s => ({ 
      id: s.suppliers.id, 
      razon_social: s.suppliers.razon_social, 
      marca: s.marca, 
      modelo: s.modelo,
      precio: s.precio_unitario 
    })));

    // Sort by price first to establish price rankings
    const sortedByPrice = [...suppliers].sort((a, b) => {
      const priceA = a.precio_unitario || Infinity;
      const priceB = b.precio_unitario || Infinity;
      return priceA - priceB;
    });

    const suggestions = sortedByPrice.map((supplier, index): SupplierSuggestion => {
      const suggestion: SupplierSuggestion = {
        id: supplier.suppliers.id,
        razon_social: supplier.suppliers.razon_social,
        marca: supplier.marca,
        modelo: supplier.modelo,
        precio_unitario: supplier.precio_unitario,
        moneda: supplier.moneda,
        procedencia: supplier.procedencia,
        pais: supplier.suppliers.pais,
        ruc: supplier.suppliers.ruc,
        nombre_contacto: supplier.suppliers.nombre_contacto,
        apellido_contacto: supplier.suppliers.apellido_contacto,
        email_contacto: supplier.suppliers.email_contacto,
        telefono_contacto: supplier.suppliers.telefono_contacto,
        score: 0,
        reasons: [],
        isPreferred: false,
        isHistorical: true, // Has historical data
        priceRank: index + 1,
      };

      // Base score for having historical data
      suggestion.score += 50;
      suggestion.reasons.push('Datos históricos disponibles');

      // Price scoring (best price gets higher score)
      if (supplier.precio_unitario) {
        const priceScore = Math.max(0, 50 - (index * 5)); // Top price gets 50, decreases by 5 per rank
        suggestion.score += priceScore;
        
        if (index === 0) {
          suggestion.reasons.push('Mejor precio disponible');
        } else if (index < 3) {
          suggestion.reasons.push('Precio competitivo');
        }
      }

      // Check if this supplier is preferred by assignment rules
      if (user?.id) {
        // This is a simplified check - in reality, we'd need equipment details
        suggestion.isPreferred = false; // We'll enhance this later with actual rule matching
      }

      // National supplier preference
      if (supplier.suppliers.pais?.toLowerCase().includes('per')) {
        suggestion.score += 20;
        suggestion.reasons.push('Proveedor nacional');
      }

      // Recently updated data
      if (supplier.fecha_ultima_actualizacion) {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(supplier.fecha_ultima_actualizacion).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate < 30) {
          suggestion.score += 15;
          suggestion.reasons.push('Información actualizada');
        }
      }

      // Complete supplier information
      if (supplier.suppliers.email_contacto && supplier.suppliers.telefono_contacto) {
        suggestion.score += 10;
        suggestion.reasons.push('Información de contacto completa');
      }

      return suggestion;
    }).sort((a, b) => b.score - a.score);

    console.log('Generated suggestions:', suggestions.map(s => ({ 
      razon_social: s.razon_social, 
      score: s.score, 
      reasons: s.reasons 
    })));

    return suggestions;
  }, [suppliers, equipmentId, user?.id]);

  const bestSuggestion = smartSuggestions[0];
  const priceComparison = smartSuggestions
    .filter(s => s.precio_unitario)
    .slice(0, 3)
    .map(s => ({
      id: s.id,
      razon_social: s.razon_social,
      precio_unitario: s.precio_unitario!,
      moneda: s.moneda || 'USD',
      marca: s.marca,
      modelo: s.modelo,
    }));

  // Fix the hasHistoricalData logic - it should be true when we have suppliers
  const hasHistoricalData = smartSuggestions.length > 0;

  console.log('useSmartSupplierSuggestions: Final results:', {
    suggestionsCount: smartSuggestions.length,
    hasHistoricalData,
    bestSuggestion: bestSuggestion?.razon_social || 'None'
  });

  return {
    suggestions: smartSuggestions,
    bestSuggestion,
    priceComparison,
    hasHistoricalData,
    isLoading,
  };
};
