
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterEquipment } from './useMasterEquipment';
import { useAssignmentRules } from './useAssignmentRules';
import { useUsers } from './useUsers';
import type { MasterEquipment } from '@/types/database';

interface SimilarityMatch {
  equipment: MasterEquipment;
  similarity: number;
  matchType: 'exact_code' | 'similar_code' | 'exact_name' | 'similar_name' | 'alternative_name' | 'alternative_code';
}

interface ValidationResult {
  needsReview: boolean;
  issues: string[];
  suggestions: string[];
  similarEquipment: SimilarityMatch[];
}

export const useImprovedEquipmentMatching = () => {
  const { equipment } = useMasterEquipment();
  const { findQuoterByRules } = useAssignmentRules();
  const { users } = useUsers();
  const queryClient = useQueryClient();

  // Improved similarity detection with multiple matching strategies
  const findSimilarEquipment = (
    codigo: string,
    nombre: string,
    grupo: string = 'General'
  ): SimilarityMatch[] => {
    console.log('Finding similar equipment for:', { codigo, nombre, grupo });
    
    const matches: SimilarityMatch[] = [];
    const normalizedNombre = nombre.toLowerCase().trim();
    const normalizedCodigo = codigo.toLowerCase().trim();

    equipment.forEach(eq => {
      const eqNombre = eq.nombre_equipo.toLowerCase().trim();
      const eqCodigo = eq.codigo.toLowerCase().trim();

      // Exact code match (highest priority)
      if (eqCodigo === normalizedCodigo) {
        matches.push({
          equipment: eq,
          similarity: 1.0,
          matchType: 'exact_code'
        });
        return;
      }

      // Alternative code match
      if (eq.codigos_alternativos?.some(alt => alt.toLowerCase().trim() === normalizedCodigo)) {
        matches.push({
          equipment: eq,
          similarity: 0.95,
          matchType: 'alternative_code'
        });
        return;
      }

      // Exact name match (same group)
      if (eqNombre === normalizedNombre && eq.grupo_generico.toLowerCase() === grupo.toLowerCase()) {
        matches.push({
          equipment: eq,
          similarity: 0.9,
          matchType: 'exact_name'
        });
        return;
      }

      // Alternative name match
      if (eq.nombres_alternativos?.some(alt => alt.toLowerCase().trim() === normalizedNombre)) {
        matches.push({
          equipment: eq,
          similarity: 0.85,
          matchType: 'alternative_name'
        });
        return;
      }

      // Similar code match (contains or partial)
      if (eqCodigo.includes(normalizedCodigo) || normalizedCodigo.includes(eqCodigo)) {
        const similarity = Math.max(normalizedCodigo.length, eqCodigo.length) / 
                          Math.max(normalizedCodigo.length, eqCodigo.length);
        if (similarity > 0.7) {
          matches.push({
            equipment: eq,
            similarity: similarity * 0.8,
            matchType: 'similar_code'
          });
        }
      }

      // Similar name match (same group)
      if (eq.grupo_generico.toLowerCase() === grupo.toLowerCase()) {
        const nameSimilarity = calculateStringSimilarity(normalizedNombre, eqNombre);
        if (nameSimilarity > 0.6) {
          matches.push({
            equipment: eq,
            similarity: nameSimilarity * 0.7,
            matchType: 'similar_name'
          });
        }
      }
    });

    // Sort by similarity and return top matches
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  };

  // String similarity calculation using Levenshtein distance
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
  };

  // Validate equipment and suggest improvements
  const validateEquipment = (
    codigo: string,
    nombre: string,
    grupo: string,
    cotizadorSugerido?: string
  ): ValidationResult => {
    console.log('Validating equipment:', { codigo, nombre, grupo, cotizadorSugerido });
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    const similarEquipment = findSimilarEquipment(codigo, nombre, grupo);

    // Check for high similarity matches
    const highSimilarityMatches = similarEquipment.filter(match => match.similarity > 0.8);
    
    if (highSimilarityMatches.length > 0) {
      issues.push(`Se encontraron ${highSimilarityMatches.length} equipos muy similares`);
      suggestions.push('Revisar si este equipo ya existe con otro código o nombre');
    }

    // Check for missing quoter assignment
    const cotizadorId = determineCotizador(codigo, nombre, grupo, cotizadorSugerido);
    if (!cotizadorId) {
      issues.push('No se pudo asignar un cotizador automáticamente');
      suggestions.push('Verificar las reglas de asignación o asignar manualmente');
    }

    // Check for incomplete information
    if (!codigo || codigo.trim().length < 3) {
      issues.push('Código muy corto o vacío');
      suggestions.push('Usar un código más descriptivo');
    }

    if (!nombre || nombre.trim().length < 5) {
      issues.push('Nombre muy corto');
      suggestions.push('Usar un nombre más descriptivo');
    }

    return {
      needsReview: issues.length > 0 || highSimilarityMatches.length > 0,
      issues,
      suggestions,
      similarEquipment
    };
  };

  const determineCotizador = (
    codigo: string, 
    nombre: string, 
    grupo: string, 
    cotizadorSugerido?: string
  ): string | undefined => {
    // 1. Si viene cotizador sugerido del Excel, buscar por nombre o email
    if (cotizadorSugerido && cotizadorSugerido.trim()) {
      const cotizadorFound = users.find(user => 
        user.roles?.includes('cotizador') && (
          user.nombre.toLowerCase().includes(cotizadorSugerido.toLowerCase()) ||
          user.email.toLowerCase().includes(cotizadorSugerido.toLowerCase())
        )
      );
      if (cotizadorFound) {
        console.log('Found cotizador from Excel suggestion:', cotizadorFound.nombre);
        return cotizadorFound.id;
      }
    }

    // 2. Aplicar reglas de asignación automática
    const ruleBasedCotizador = findQuoterByRules(codigo, nombre, grupo);
    if (ruleBasedCotizador) {
      console.log('Found cotizador from rules:', ruleBasedCotizador);
      return ruleBasedCotizador;
    }

    return undefined;
  };

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: {
      codigo: string;
      nombre_equipo: string;
      grupo_generico: string;
      cotizador_predeterminado_id?: string;
      observaciones_inconsistencias?: string;
    }) => {
      const { data, error } = await supabase
        .from('master_equipment')
        .insert(equipmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-equipment'] });
    },
  });

  const findOrCreateEquipmentWithValidation = async (
    codigo: string,
    nombre: string,
    grupo: string = 'General',
    cotizadorSugerido?: string
  ): Promise<{
    equipment: MasterEquipment;
    validation: ValidationResult;
    wasCreated: boolean;
  }> => {
    console.log('Finding or creating equipment with validation:', { codigo, nombre, grupo, cotizadorSugerido });
    
    // First, validate the equipment
    const validation = validateEquipment(codigo, nombre, grupo, cotizadorSugerido);
    
    // Check for exact matches first
    const exactMatch = equipment.find(eq => 
      eq.codigo.toLowerCase() === codigo.toLowerCase()
    );
    
    if (exactMatch) {
      return {
        equipment: exactMatch,
        validation,
        wasCreated: false
      };
    }

    // If high similarity matches exist, we might want to return the best match instead of creating
    const bestSimilarMatch = validation.similarEquipment[0];
    if (bestSimilarMatch && bestSimilarMatch.similarity > 0.9) {
      console.log('High similarity match found, returning existing equipment:', bestSimilarMatch);
      return {
        equipment: bestSimilarMatch.equipment,
        validation,
        wasCreated: false
      };
    }

    // Create new equipment with validation notes
    const cotizadorId = determineCotizador(codigo, nombre, grupo, cotizadorSugerido);
    
    const observaciones = validation.needsReview 
      ? `REQUIERE REVISIÓN: ${validation.issues.join(', ')}. Sugerencias: ${validation.suggestions.join(', ')}`
      : undefined;

    const newEquipment = await new Promise<MasterEquipment>((resolve, reject) => {
      createEquipmentMutation.mutate(
        {
          codigo: codigo || `AUTO-${Date.now()}`,
          nombre_equipo: nombre,
          grupo_generico: grupo,
          cotizador_predeterminado_id: cotizadorId,
          observaciones_inconsistencias: observaciones,
        },
        {
          onSuccess: (data) => {
            console.log('Equipment created with validation:', data);
            resolve(data);
          },
          onError: (error) => {
            console.error('Error creating equipment:', error);
            reject(error);
          },
        }
      );
    });

    return {
      equipment: newEquipment,
      validation,
      wasCreated: true
    };
  };

  return {
    findOrCreateEquipmentWithValidation,
    validateEquipment,
    findSimilarEquipment,
    isCreating: createEquipmentMutation.isPending,
  };
};
